<?php
/**
 * AccessLogController - Controlador de Logs de Acceso
 * 
 * Maneja el registro de ingresos/egresos del condominio
 */

namespace Controllers;

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Router.php';
require_once __DIR__ . '/../auth_middleware.php';

use Utils\Response;
use Utils\Router;

class AccessLogController
{
    private $pdo;
    private $table = 'access_logs';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * GET /api/v1/access-logs
     * Listar logs con filtros opcionales
     */
    public function index()
    {
        // Verificar autenticación
        requireAuth();

        $params = Router::getParams();
        $where = [];
        $values = [];

        // Filtro por access_point_id
        if (isset($params['access_point_id']) && $params['access_point_id']) {
            $where[] = 'access_point_id = ?';
            $values[] = $params['access_point_id'];
        }

        // Filtro por person_id
        if (isset($params['person_id']) && $params['person_id']) {
            $where[] = 'person_id = ?';
            $values[] = $params['person_id'];
        }

        // Filtro por tipo (INGRESO/EGRESO)
        if (isset($params['type']) && $params['type']) {
            $where[] = 'type = ?';
            $values[] = strtoupper($params['type']);
        }

        // Filtro por fecha específica
        if (isset($params['date']) && $params['date']) {
            $where[] = 'DATE(created_at) = ?';
            $values[] = $params['date'];
        }

        // Filtro por rango de fechas
        if (isset($params['start_date']) && isset($params['end_date'])) {
            $where[] = 'created_at BETWEEN ? AND ?';
            $values[] = $params['start_date'] . ' 00:00:00';
            $values[] = $params['end_date'] . ' 23:59:59';
        }

        // Construir query
        $sql = "SELECT * FROM {$this->table}";
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY created_at DESC';

        // Pagination
        $page = isset($params['page']) ? max(1, (int)$params['page']) : 1;
        $limit = isset($params['limit']) ? min(100, max(1, (int)$params['limit'])) : 50;
        $offset = ($page - 1) * $limit;
        $sql .= " LIMIT {$limit} OFFSET {$offset}";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($values);
        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get total count
        $countSql = "SELECT COUNT(*) FROM {$this->table}";
        if (!empty($where)) {
            $countSql .= ' WHERE ' . implode(' AND ', $where);
        }
        $countStmt = $this->pdo->prepare($countSql);
        $countStmt->execute($values);
        $total = $countStmt->fetchColumn();

        Response::json([
            'success' => true,
            'data' => $logs,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * GET /api/v1/access-logs/:id
     * Obtener log por ID
     */
    public function show($id)
    {
        requireAuth();

        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $log = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$log) {
            Response::json(['success' => false, 'error' => 'Log no encontrado'], 404);
            return;
        }

        Response::json(['success' => true, 'data' => $log]);
    }

    /**
     * POST /api/v1/access-logs
     * Crear nuevo registro de acceso. Auditoría: created_by_user_id (guardia/operario que registró).
     */
    public function store()
    {
        $auth = requireAuth();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            Response::json(['success' => false, 'error' => 'Datos inválidos'], 400);
            return;
        }

        // Validar campos requeridos
        $required = ['access_point_id', 'type'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::json(['success' => false, 'error' => "Campo requerido: {$field}"], 400);
                return;
            }
        }

        // Validar tipo
        $validTypes = ['INGRESO', 'EGRESO'];
        $data['type'] = strtoupper($data['type']);
        if (!in_array($data['type'], $validTypes)) {
            Response::json(['success' => false, 'error' => 'Tipo inválido. Usar: INGRESO o EGRESO'], 400);
            return;
        }

        $createdByUserId = isset($auth['user_id']) ? (int)$auth['user_id'] : null;

        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO {$this->table} 
                (access_point_id, person_id, doc_number, vehicle_id, type, observation, created_by_user_id, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $data['access_point_id'],
                $data['person_id'] ?? null,
                $data['doc_number'] ?? null,
                $data['vehicle_id'] ?? null,
                $data['type'],
                $data['observation'] ?? null,
                $createdByUserId
            ]);

            $id = $this->pdo->lastInsertId();

            Response::json([
                'success' => true,
                'data' => ['id' => $id, 'message' => 'Log registrado correctamente']
            ], 201);
        } catch (PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error al registrar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/access-logs/access-points
     * Listar puntos de acceso
     */
    public function accessPoints()
    {
        requireAuth();

        $stmt = $this->pdo->query("SELECT * FROM access_points ORDER BY name");
        $points = $stmt->fetchAll(PDO::FETCH_ASSOC);

        Response::json(['success' => true, 'data' => $points]);
    }

    /**
     * GET /api/v1/access-logs/stats/daily
     * Estadísticas diarias
     */
    public function dailyStats()
    {
        requireAuth();

        $stmt = $this->pdo->query("
            SELECT 
                DATE(created_at) as date,
                type,
                COUNT(*) as count
            FROM {$this->table}
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at), type
            ORDER BY date DESC
        ");

        Response::json(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    // ---------- Reportes (reemplazo legacy con access_logs vc_db) ----------

    /** GET ?date_init=&date_end= - Ingresos por día en rango */
    public function entranceByRange()
    {
        requireAuth();
        $date_init = $_GET['date_init'] ?? '';
        $date_end = $_GET['date_end'] ?? '';
        if ($date_init === '' || $date_end === '') {
            Response::json(['success' => false, 'error' => 'date_init y date_end requeridos'], 400);
            return;
        }
        $stmt = $this->pdo->prepare("
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM {$this->table}
            WHERE type = 'INGRESO' AND created_at BETWEEN ? AND ?
            GROUP BY DATE(created_at)
            ORDER BY date
        ");
        $stmt->execute([$date_init . ' 00:00:00', $date_end . ' 23:59:59']);
        $result = $stmt->fetchAll(PDO::FETCH_OBJ);
        Response::json($result);
    }

    /** GET ?fecha=&sala= (sala = access_point_id o name) - Logs por fecha y punto */
    public function historyByDate()
    {
        requireAuth();
        $fecha = $_GET['fecha'] ?? '';
        $sala = $_GET['sala'] ?? '';
        if ($fecha === '') {
            Response::json(['success' => false, 'error' => 'fecha requerida'], 400);
            return;
        }
        $where = ["DATE(al.created_at) = ?"];
        $params = [$fecha];
        if ($sala !== '') {
            if (is_numeric($sala)) {
                $where[] = 'al.access_point_id = ?';
                $params[] = $sala;
            } else {
                $where[] = 'ap.name = ?';
                $params[] = $sala;
            }
        }
        $sql = "SELECT al.*, ap.name as access_point_name, p.first_name, p.paternal_surname, p.doc_number as person_doc
                FROM {$this->table} al
                LEFT JOIN access_points ap ON ap.id = al.access_point_id
                LEFT JOIN persons p ON p.id = al.person_id
                WHERE " . implode(' AND ', $where) . " ORDER BY al.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_OBJ));
    }

    /** GET ?fecha_inicial=&fecha_final=&access_point= */
    public function historyByRange()
    {
        requireAuth();
        $fi = $_GET['fecha_inicial'] ?? '';
        $ff = $_GET['fecha_final'] ?? '';
        $ap = $_GET['access_point'] ?? '';
        if ($fi === '' || $ff === '') {
            Response::json(['success' => false, 'error' => 'fecha_inicial y fecha_final requeridos'], 400);
            return;
        }
        $where = ["al.created_at BETWEEN ? AND ?"];
        $params = [$fi . ' 00:00:00', $ff . ' 23:59:59'];
        if ($ap !== '') {
            $where[] = 'al.access_point_id = ?';
            $params[] = $ap;
        }
        $sql = "SELECT al.*, ap.name as access_point_name FROM {$this->table} al LEFT JOIN access_points ap ON ap.id = al.access_point_id WHERE " . implode(' AND ', $where) . " ORDER BY al.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_OBJ));
    }

    /** GET ?fecha=&sala=&doc= - Logs de un documento en fecha y sala */
    public function historyByClient()
    {
        requireAuth();
        $fecha = $_GET['fecha'] ?? '';
        $sala = $_GET['sala'] ?? '';
        $doc = $_GET['doc'] ?? '';
        if ($fecha === '') {
            Response::json(['success' => false, 'error' => 'fecha requerida'], 400);
            return;
        }
        $where = ["DATE(al.created_at) = ?"];
        $params = [$fecha];
        if ($sala !== '') {
            $where[] = 'al.access_point_id = ?';
            $params[] = $sala;
        }
        if ($doc !== '') {
            $where[] = '(al.doc_number = ? OR p.doc_number = ?)';
            $params[] = $doc;
            $params[] = $doc;
        }
        $sql = "SELECT al.*, ap.name as access_point_name, p.first_name, p.paternal_surname FROM {$this->table} al LEFT JOIN access_points ap ON ap.id = al.access_point_id LEFT JOIN persons p ON p.id = al.person_id WHERE " . implode(' AND ', $where) . " ORDER BY al.created_at DESC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_OBJ));
    }

    /** Reportes aforo/address/total-month/hours/age: legacy usaba visits_*; devolvemos datos desde access_logs por fecha y access_point */
    public function reportAforo()
    {
        requireAuth();
        $sala = $_GET['sala'] ?? '';
        $fechaInicio = $_GET['fechaInicio'] ?? '';
        $fechaFin = $_GET['fechaFin'] ?? '';
        $fechaMes = $_GET['fechaMes'] ?? '';
        $mes = $_GET['mes'] ?? '';
        $f1 = $_GET['fecha1'] ?? ''; $f2 = $_GET['fecha2'] ?? ''; $f3 = $_GET['fecha3'] ?? ''; $f4 = $_GET['fecha4'] ?? ''; $f5 = $_GET['fecha5'] ?? '';
        $where = ["type = 'INGRESO'"];
        $params = [];
        if ($sala !== '') {
            $where[] = 'access_point_id = ?';
            $params[] = $sala;
        }
        if ($fechaInicio !== '' && $fechaFin !== '' && ($mes === 'SELECCIONAR' || $mes === '')) {
            $where[] = 'DATE(created_at) BETWEEN ? AND ?';
            $params[] = $fechaInicio;
            $params[] = $fechaFin;
        } elseif ($fechaMes !== '') {
            $where[] = 'DATE(created_at) LIKE ?';
            $params[] = '%' . $fechaMes . '%';
        } else {
            $dates = array_values(array_filter([$f1, $f2, $f3, $f4, $f5], fn($d) => $d !== ''));
            if (!empty($dates)) {
                $placeholders = implode(',', array_fill(0, count($dates), '?'));
                $where[] = "DATE(created_at) IN ($placeholders)";
                foreach ($dates as $d) {
                    $params[] = $d;
                }
            }
        }
        $sql = "SELECT DATE(created_at) as FECHA, COUNT(*) as AFORO FROM {$this->table} WHERE " . implode(' AND ', $where) . " GROUP BY DATE(created_at) HAVING AFORO > 0 ORDER BY FECHA";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_OBJ));
    }

    public function reportAddress()
    {
        $this->reportAforo();
    }

    public function reportTotalMonth()
    {
        $this->reportAforo();
    }

    public function reportTotalMonthNew()
    {
        $this->reportAforo();
    }

    public function reportHours()
    {
        $this->reportAforo();
    }

    public function reportAge()
    {
        $this->reportAforo();
    }
}

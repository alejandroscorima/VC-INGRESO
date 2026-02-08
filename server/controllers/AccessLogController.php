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
}

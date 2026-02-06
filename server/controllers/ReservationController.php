<?php
/**
 * ReservationController - Controlador de Reservaciones
 * 
 * Maneja las reservaciones de la Casa Club y áreas comunes
 */

namespace Controllers;

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Router.php';
require_once __DIR__ . '/../auth_middleware.php';

use Utils\Response;
use Utils\Router;

class ReservationController
{
    private $pdo;
    private $table = 'reservations';
    private $accessPointsTable = 'access_points';

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * GET /api/v1/reservations
     * Listar reservaciones con filtros
     */
    public function index()
    {
        requireAuth();

        $params = Router::getParams();
        $where = [];
        $values = [];

        // Filtro por access_point_id (área)
        if (isset($params['access_point_id']) && $params['access_point_id']) {
            $where[] = 'r.access_point_id = ?';
            $values[] = $params['access_point_id'];
        }

        // Filtro por person_id (propietario)
        if (isset($params['person_id']) && $params['person_id']) {
            $where[] = 'r.person_id = ?';
            $values[] = $params['person_id'];
        }

        // Filtro por fecha específica
        if (isset($params['date']) && $params['date']) {
            $where[] = 'DATE(r.reservation_date) = ?';
            $values[] = $params['date'];
        }

        // Filtro por rango de fechas
        if (isset($params['start_date']) && isset($params['end_date'])) {
            $where[] = 'r.reservation_date BETWEEN ? AND ?';
            $values[] = $params['start_date'] . ' 00:00:00';
            $values[] = $params['end_date'] . ' 23:59:59';
        }

        // Filtro por estado
        if (isset($params['status']) && $params['status']) {
            $where[] = 'r.status = ?';
            $values[] = strtoupper($params['status']);
        }

        // Filtro por casa (house_id)
        if (isset($params['house_id']) && $params['house_id']) {
            $where[] = 'r.house_id = ?';
            $values[] = $params['house_id'];
        }

        $sql = "SELECT r.*, ap.name as area_name, ap.type as area_type 
                FROM {$this->table} r 
                LEFT JOIN {$this->accessPointsTable} ap ON r.access_point_id = ap.id";

        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        $sql .= ' ORDER BY r.reservation_date DESC';

        // Pagination
        $page = isset($params['page']) ? max(1, (int)$params['page']) : 1;
        $limit = isset($params['limit']) ? min(100, max(1, (int)$params['limit'])) : 50;
        $offset = ($page - 1) * $limit;
        $sql .= " LIMIT {$limit} OFFSET {$offset}";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($values);
        $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get total count
        $countSql = "SELECT COUNT(*) FROM {$this->table} r";
        if (!empty($where)) {
            $countSql .= ' WHERE ' . implode(' AND ', $where);
        }
        $countStmt = $this->pdo->prepare($countSql);
        $countStmt->execute($values);
        $total = $countStmt->fetchColumn();

        Response::json([
            'success' => true,
            'data' => $reservations,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
    }

    /**
     * GET /api/v1/reservations/:id
     * Obtener reservación por ID
     */
    public function show($id)
    {
        requireAuth();

        $stmt = $this->pdo->prepare("
            SELECT r.*, ap.name as area_name, ap.type as area_type 
            FROM {$this->table} r 
            LEFT JOIN {$this->accessPointsTable} ap ON r.access_point_id = ap.id 
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $reservation = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$reservation) {
            Response::json(['success' => false, 'error' => 'Reservación no encontrada'], 404);
            return;
        }

        Response::json(['success' => true, 'data' => $reservation]);
    }

    /**
     * POST /api/v1/reservations
     * Crear nueva reservación
     */
    public function store()
    {
        requireAuth();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            Response::json(['success' => false, 'error' => 'Datos inválidos'], 400);
            return;
        }

        // Validar campos requeridos
        $required = ['access_point_id', 'reservation_date', 'house_id'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::json(['success' => false, 'error' => "Campo requerido: {$field}"], 400);
                return;
            }
        }

        // Validar estado
        $validStatuses = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];
        $data['status'] = isset($data['status']) ? strtoupper($data['status']) : 'PENDIENTE';
        if (!in_array($data['status'], $validStatuses)) {
            Response::json(['success' => false, 'error' => 'Estado inválido'], 400);
            return;
        }

        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO {$this->table} 
                (access_point_id, person_id, house_id, reservation_date, end_date, 
                 status, observation, num_guests, contact_phone, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $data['access_point_id'],
                $data['person_id'] ?? null,
                $data['house_id'],
                $data['reservation_date'],
                $data['end_date'] ?? $data['reservation_date'] . ' 02:00:00',
                $data['status'],
                $data['observation'] ?? null,
                $data['num_guests'] ?? 1,
                $data['contact_phone'] ?? null
            ]);

            $id = $this->pdo->lastInsertId();

            Response::json([
                'success' => true,
                'data' => ['id' => $id, 'message' => 'Reservación creada correctamente']
            ], 201);
        } catch (PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error al crear: ' . $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/v1/reservations/:id
     * Actualizar reservación
     */
    public function update($id)
    {
        requireAuth();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            Response::json(['success' => false, 'error' => 'Datos inválidos'], 400);
            return;
        }

        // Verificar que existe
        $stmt = $this->pdo->prepare("SELECT id FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            Response::json(['success' => false, 'error' => 'Reservación no encontrada'], 404);
            return;
        }

        $fields = [];
        $values = [];

        $allowedFields = [
            'access_point_id', 'person_id', 'house_id', 'reservation_date',
            'end_date', 'status', 'observation', 'num_guests', 'contact_phone'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            Response::json(['success' => false, 'error' => 'No hay campos para actualizar'], 400);
            return;
        }

        $values[] = $id;

        try {
            $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);

            Response::json([
                'success' => true,
                'data' => ['id' => $id, 'message' => 'Reservación actualizada correctamente']
            ]);
        } catch (PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error al actualizar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/v1/reservations/:id/status
     * Cambiar estado de reservación
     */
    public function updateStatus($id)
    {
        requireAuth();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['status'])) {
            Response::json(['success' => false, 'error' => 'Estado requerido'], 400);
            return;
        }

        $validStatuses = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];
        $data['status'] = strtoupper($data['status']);
        if (!in_array($data['status'], $validStatuses)) {
            Response::json(['success' => false, 'error' => 'Estado inválido'], 400);
            return;
        }

        try {
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET status = ? WHERE id = ?");
            $stmt->execute([$data['status'], $id]);

            Response::json([
                'success' => true,
                'data' => ['id' => $id, 'status' => $data['status']]
            ]);
        } catch (PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/v1/reservations/:id
     * Eliminar reservación
     */
    public function destroy($id)
    {
        requireAuth();

        try {
            $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);

            if ($stmt->rowCount() === 0) {
                Response::json(['success' => false, 'error' => 'Reservación no encontrada'], 404);
                return;
            }

            Response::json(['success' => true, 'data' => ['id' => $id, 'message' => 'Reservación eliminada']]);
        } catch (PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error al eliminar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/reservations/areas
     * Listar áreas disponibles para reservación
     */
    public function areas()
    {
        requireAuth();

        $stmt = $this->pdo->query("
            SELECT * FROM {$this->accessPointsTable} 
            WHERE type IN ('CASA_CLUB', 'PISCINA', 'OTRO') 
            AND is_active = 1 
            ORDER BY name
        ");

        Response::json(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    /**
     * GET /api/v1/reservations/availability
     * Consultar disponibilidad de un área
     */
    public function availability()
    {
        requireAuth();

        $accessPointId = $_GET['access_point_id'] ?? null;
        $date = $_GET['date'] ?? null;

        if (!$accessPointId || !$date) {
            Response::json(['success' => false, 'error' => 'access_point_id y date requeridos'], 400);
            return;
        }

        // Obtener reservaciones confirmadas para ese día
        $stmt = $this->pdo->prepare("
            SELECT reservation_date, end_date 
            FROM {$this->table} 
            WHERE access_point_id = ? 
            AND status != 'CANCELADA'
            AND DATE(reservation_date) = ?
            ORDER BY reservation_date
        ");
        $stmt->execute([$accessPointId, $date]);
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Generar horarios disponibles (假设 8:00 - 22:00)
        $availableSlots = [];
        $startHour = 8;
        $endHour = 22;

        for ($hour = $startHour; $hour < $endHour; $hour++) {
            $slotStart = $date . ' ' . str_pad($hour, 2, '0', STR_PAD_LEFT) . ':00:00';
            $slotEnd = $date . ' ' . str_pad($hour + 1, 2, '0', STR_PAD_LEFT) . ':00:00';

            // Verificar si hay conflicto
            $isAvailable = true;
            foreach ($bookings as $booking) {
                if ($slotStart < $booking['end_date'] && $slotEnd > $booking['reservation_date']) {
                    $isAvailable = false;
                    break;
                }
            }

            $availableSlots[] = [
                'start' => $slotStart,
                'end' => $slotEnd,
                'available' => $isAvailable
            ];
        }

        Response::json([
            'success' => true,
            'data' => [
                'date' => $date,
                'access_point_id' => $accessPointId,
                'slots' => $availableSlots
            ]
        ]);
    }
}

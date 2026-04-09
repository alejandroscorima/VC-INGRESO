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
require_once __DIR__ . '/../helpers/house_permissions.php';
require_once __DIR__ . '/../config/reservation_business_rules.php';

use Utils\Response;
use Utils\Router;

class ReservationController
{
    private $pdo;
    private $table = 'reservations';
    private $accessPointsTable = 'access_points';

    /** Estados que bloquean el hueco en el calendario (PENDIENTE reserva hasta decisión o fin de evento si confirma). */
    private const BLOCKING_STATUSES = ['PENDIENTE', 'CONFIRMADA'];

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
        $auth = requireAuth();

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

        // Vecinos: todas las de sus casas. Admin y personal (portería, etc.): listado completo.
        $this->applyIndexRoleScope($where, $values, $auth);

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
        $reservations = $stmt->fetchAll(\PDO::FETCH_ASSOC);

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
        $auth = requireAuth();

        $stmt = $this->pdo->prepare("
            SELECT r.*, ap.name as area_name, ap.type as area_type 
            FROM {$this->table} r 
            LEFT JOIN {$this->accessPointsTable} ap ON r.access_point_id = ap.id 
            WHERE r.id = ?
        ");
        $stmt->execute([$id]);
        $reservation = $stmt->fetch(\PDO::FETCH_ASSOC);

        if (!$reservation) {
            Response::json(['success' => false, 'error' => 'Reservación no encontrada'], 404);
            return;
        }

        if (!$this->canViewReservation($auth, $reservation)) {
            Response::json(['success' => false, 'error' => 'Sin permiso para ver esta reservación'], 403);
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
        $auth = requireAuth();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            Response::json(['success' => false, 'error' => 'Datos inválidos'], 400);
            return;
        }

        // Validar campos requeridos (end_date necesario para límites de duración y solapes)
        $required = ['access_point_id', 'reservation_date', 'end_date', 'house_id'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                Response::json(['success' => false, 'error' => "Campo requerido: {$field}"], 400);
                return;
            }
        }

        $validStatuses = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'RECHAZADA', 'COMPLETADA'];
        $data['status'] = isset($data['status']) ? strtoupper($data['status']) : 'PENDIENTE';
        if (!in_array($data['status'], $validStatuses, true)) {
            Response::json(['success' => false, 'error' => 'Estado inválido'], 400);
            return;
        }
        // Solo administrador puede crear con estado distinto de PENDIENTE
        if (!isAdminRole($auth)) {
            $data['status'] = 'PENDIENTE';
        }
        if (!canAccessHouse($this->pdo, $auth, (int) $data['house_id'])) {
            Response::json(['success' => false, 'error' => 'Sin permiso para crear reservas en esta casa'], 403);
            return;
        }

        if (empty($data['person_id']) && !empty($auth['person_id'])) {
            $data['person_id'] = (int) $auth['person_id'];
        }

        $err = $this->validateReservationBusinessRules(
            (int) $data['house_id'],
            (int) $data['access_point_id'],
            (string) $data['reservation_date'],
            (string) $data['end_date'],
            null
        );
        if ($err !== null) {
            Response::json(['success' => false, 'error' => $err], 400);
            return;
        }

        $createdByUserId = isset($auth['user_id']) ? (int)$auth['user_id'] : null;

        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO {$this->table} 
                (access_point_id, person_id, house_id, reservation_date, end_date, 
                 status, observation, num_guests, contact_phone, created_by_user_id, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");

            $stmt->execute([
                $data['access_point_id'],
                $data['person_id'] ?? null,
                $data['house_id'],
                $data['reservation_date'],
                $data['end_date'],
                $data['status'],
                $data['observation'] ?? null,
                $data['num_guests'] ?? 1,
                $data['contact_phone'] ?? null,
                $createdByUserId
            ]);

            $id = $this->pdo->lastInsertId();

            Response::json([
                'success' => true,
                'data' => ['id' => $id, 'message' => 'Reservación creada correctamente']
            ], 201);
        } catch (\PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error al crear: ' . $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/v1/reservations/:id
     * Actualizar reservación
     */
    public function update($id)
    {
        $auth = requireAuth();

        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data) {
            Response::json(['success' => false, 'error' => 'Datos inválidos'], 400);
            return;
        }

        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $reservation = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$reservation) {
            Response::json(['success' => false, 'error' => 'Reservación no encontrada'], 404);
            return;
        }
        if (!$this->canViewReservation($auth, $reservation)) {
            Response::json(['success' => false, 'error' => 'Sin permiso para editar esta reservación'], 403);
            return;
        }
        if (!isAdminRole($auth) && !in_array($reservation['status'], ['PENDIENTE', 'CONFIRMADA'], true)) {
            Response::json(['success' => false, 'error' => 'No se puede modificar esta reservación en su estado actual'], 400);
            return;
        }
        if (!isAdminRole($auth) && $reservation['status'] === 'CONFIRMADA') {
            Response::json(['success' => false, 'error' => 'Las reservas confirmadas solo pueden cancelarse desde el cambio de estado'], 400);
            return;
        }
        if (isset($data['house_id']) && (int) $data['house_id'] !== (int) $reservation['house_id']) {
            if (!canAccessHouse($this->pdo, $auth, (int) $data['house_id'])) {
                Response::json(['success' => false, 'error' => 'Sin permiso para asignar esta casa a la reservación'], 403);
                return;
            }
        }

        if (!isAdminRole($auth)) {
            unset($data['status']);
        }

        $fields = [];
        $values = [];

        $allowedFields = [
            'access_point_id', 'person_id', 'house_id', 'reservation_date',
            'end_date', 'status', 'observation', 'num_guests', 'contact_phone',
        ];

        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = ?";
                $values[] = $data[$field];
            }
        }

        if (empty($fields)) {
            Response::json(['success' => false, 'error' => 'No hay campos para actualizar'], 400);
            return;
        }

        $mergedHouse = isset($data['house_id']) ? (int) $data['house_id'] : (int) $reservation['house_id'];
        $mergedAp = isset($data['access_point_id']) ? (int) $data['access_point_id'] : (int) $reservation['access_point_id'];
        $mergedStart = isset($data['reservation_date']) ? (string) $data['reservation_date'] : (string) $reservation['reservation_date'];
        $mergedEnd = isset($data['end_date']) ? (string) $data['end_date'] : (string) $reservation['end_date'];

        if (
            isset($data['house_id']) || isset($data['access_point_id'])
            || isset($data['reservation_date']) || isset($data['end_date'])
        ) {
            $err = $this->validateReservationBusinessRules(
                $mergedHouse,
                $mergedAp,
                $mergedStart,
                $mergedEnd,
                (int) $id
            );
            if ($err !== null) {
                Response::json(['success' => false, 'error' => $err], 400);
                return;
            }
        }

        $values[] = $id;

        try {
            $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);

            Response::json([
                'success' => true,
                'data' => ['id' => $id, 'message' => 'Reservación actualizada correctamente'],
            ]);
        } catch (\PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error al actualizar: ' . $e->getMessage()], 500);
        }
    }

    /**
     * PUT /api/v1/reservations/:id/status
     * Cambiar estado de reservación
     */
    public function updateStatus($id)
    {
        $auth = requireAuth();

        $stmt = $this->pdo->prepare("SELECT * FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $reservation = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$reservation) {
            Response::json(['success' => false, 'error' => 'Reservación no encontrada'], 404);
            return;
        }
        if (!$this->canViewReservation($auth, $reservation)) {
            Response::json(['success' => false, 'error' => 'Sin permiso para cambiar el estado de esta reservación'], 403);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['status'])) {
            Response::json(['success' => false, 'error' => 'Estado requerido'], 400);
            return;
        }

        $validStatuses = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'RECHAZADA', 'COMPLETADA'];
        $newStatus = strtoupper((string) $data['status']);
        if (!in_array($newStatus, $validStatuses, true)) {
            Response::json(['success' => false, 'error' => 'Estado inválido'], 400);
            return;
        }

        $isAdmin = isAdminRole($auth);
        $current = strtoupper((string) ($reservation['status'] ?? ''));

        if (in_array($newStatus, ['CONFIRMADA', 'RECHAZADA', 'COMPLETADA'], true) && !$isAdmin) {
            Response::json(['success' => false, 'error' => 'Solo un administrador puede establecer este estado'], 403);
            return;
        }

        if ($newStatus === 'PENDIENTE' && !$isAdmin) {
            Response::json(['success' => false, 'error' => 'No autorizado'], 403);
            return;
        }

        if ($newStatus === 'CANCELADA') {
            if (!in_array($current, ['PENDIENTE', 'CONFIRMADA'], true)) {
                Response::json(['success' => false, 'error' => 'No se puede cancelar en este estado'], 400);
                return;
            }
            $resHouseId = (int) ($reservation['house_id'] ?? 0);
            if ($isAdmin) {
                $authHouseId = isset($auth['house_id']) ? (int) $auth['house_id'] : 0;
                if ($authHouseId <= 0 || $resHouseId !== $authHouseId) {
                    Response::json(['success' => false, 'error' => 'Solo puedes cancelar solicitudes de tu domicilio'], 403);
                    return;
                }
            } elseif (!canAccessHouse($this->pdo, $auth, $resHouseId)) {
                Response::json(['success' => false, 'error' => 'Sin permiso para cancelar esta reservación'], 403);
                return;
            }
        }

        try {
            $stmt = $this->pdo->prepare("UPDATE {$this->table} SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $id]);

            Response::json([
                'success' => true,
                'data' => ['id' => $id, 'status' => $newStatus],
            ]);
        } catch (\PDOException $e) {
            Response::json(['success' => false, 'error' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * DELETE /api/v1/reservations/:id
     * Eliminar reservación
     */
    public function destroy($id)
    {
        $auth = requireAuth();

        if (!isAdminRole($auth)) {
            Response::json(['success' => false, 'error' => 'Solo un administrador puede eliminar reservaciones'], 403);
            return;
        }

        $stmt = $this->pdo->prepare("SELECT id, house_id FROM {$this->table} WHERE id = ?");
        $stmt->execute([$id]);
        $reservation = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$reservation) {
            Response::json(['success' => false, 'error' => 'Reservación no encontrada'], 404);
            return;
        }

        try {
            $stmt = $this->pdo->prepare("DELETE FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            Response::json(['success' => true, 'data' => ['id' => $id, 'message' => 'Reservación eliminada']]);
        } catch (\PDOException $e) {
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
            WHERE permite_reserva = 1
            AND is_active = 1
            ORDER BY name
        ");

        Response::json(['success' => true, 'data' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
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

        $stmtAp = $this->pdo->prepare(
            "SELECT id, permite_reserva, is_active FROM {$this->accessPointsTable} WHERE id = ? LIMIT 1"
        );
        $stmtAp->execute([(int) $accessPointId]);
        $apRow = $stmtAp->fetch(\PDO::FETCH_ASSOC);
        if (!$apRow) {
            Response::json(['success' => false, 'error' => 'Punto de acceso no encontrado'], 404);
            return;
        }
        if ((int) ($apRow['is_active'] ?? 0) !== 1) {
            Response::json(['success' => false, 'error' => 'El punto de acceso no está activo'], 400);
            return;
        }
        if ((int) ($apRow['permite_reserva'] ?? 0) !== 1) {
            Response::json(['success' => false, 'error' => 'Este punto de acceso no admite reservaciones'], 400);
            return;
        }

        // PENDIENTE y CONFIRMADA bloquean el hueco; RECHAZADA/CANCELADA liberan; COMPLETADA no aplica a nuevas reservas.
        $placeholders = implode(',', array_fill(0, count(self::BLOCKING_STATUSES), '?'));
        $stmt = $this->pdo->prepare("
            SELECT reservation_date, end_date 
            FROM {$this->table} 
            WHERE access_point_id = ? 
            AND status IN ({$placeholders})
            AND DATE(reservation_date) = ?
            ORDER BY reservation_date
        ");
        $execParams = array_merge([$accessPointId], self::BLOCKING_STATUSES, [$date]);
        $stmt->execute($execParams);
        $bookings = $stmt->fetchAll(\PDO::FETCH_ASSOC);

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

    /**
     * Listado: administradores ven todo; OPERARIO ven todo; vecinos solo reservas de sus casas.
     */
    private function applyIndexRoleScope(array &$where, array &$values, array $auth): void
    {
        if (isAdminRole($auth)) {
            return;
        }
        $role = strtoupper(trim($auth['role_system'] ?? ''));
        if ($role === 'OPERARIO') {
            return;
        }

        $ids = getAccessibleHouseIds($this->pdo, $auth);
        if (empty($ids)) {
            $where[] = '1 = 0';

            return;
        }
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $where[] = "r.house_id IN ({$placeholders})";
        foreach ($ids as $hid) {
            $values[] = $hid;
        }
    }

    /**
     * Ver detalle: misma regla que applyIndexRoleScope (admin/staff global; vecino por casa).
     */
    private function canViewReservation(array $auth, array $reservation): bool
    {
        if (isAdminRole($auth)) {
            return true;
        }
        $role = strtoupper(trim($auth['role_system'] ?? ''));
        if ($role === 'OPERARIO') {
            return true;
        }
        $hid = (int) ($reservation['house_id'] ?? 0);
        if ($hid <= 0) {
            return false;
        }

        return canAccessHouse($this->pdo, $auth, $hid);
    }

    /**
     * Duración máxima, tope mensual de activas por casa y solape en el mismo área.
     * Límites numéricos: server/config/reservation_business_rules.php
     *
     * @param int|null $excludeReservationId id actual al editar (no contar solape consigo mismo)
     *
     * @return string|null mensaje de error o null si OK
     */
    private function validateReservationBusinessRules(
        int $houseId,
        int $accessPointId,
        string $reservationDateStr,
        string $endDateStr,
        $excludeReservationId
    ): ?string {
        if ($accessPointId <= 0) {
            return 'Área de acceso no válida';
        }
        $stmtAp = $this->pdo->prepare(
            "SELECT id, permite_reserva, is_active FROM {$this->accessPointsTable} WHERE id = ? LIMIT 1"
        );
        $stmtAp->execute([$accessPointId]);
        $apRow = $stmtAp->fetch(\PDO::FETCH_ASSOC);
        if (!$apRow) {
            return 'Área de acceso no encontrada';
        }
        if ((int) ($apRow['is_active'] ?? 0) !== 1) {
            return 'El punto de acceso no está activo';
        }
        if ((int) ($apRow['permite_reserva'] ?? 0) !== 1) {
            return 'Este punto de acceso no admite reservaciones';
        }

        try {
            $start = new \DateTime($reservationDateStr);
            $end = new \DateTime($endDateStr);
        } catch (\Exception $e) {
            return 'Fechas inválidas';
        }

        if ($end <= $start) {
            return 'La fecha y hora de fin deben ser posteriores al inicio';
        }

        $diffSeconds = $end->getTimestamp() - $start->getTimestamp();
        $maxSeconds = (int) (RESERVATION_MAX_EVENT_HOURS * 3600);
        if ($diffSeconds > $maxSeconds) {
            return 'La duración máxima por evento es ' . RESERVATION_MAX_EVENT_HOURS . ' horas';
        }

        $year = (int) $start->format('Y');
        $month = (int) $start->format('n');

        /** Tope mensual y solape solo si la reserva bloquea hueco (PENDIENTE/CONFIRMADA). */
        $blockingRulesApply = true;
        if ($excludeReservationId !== null && $excludeReservationId !== '') {
            $stmtSt = $this->pdo->prepare("SELECT status FROM {$this->table} WHERE id = ? LIMIT 1");
            $stmtSt->execute([(int) $excludeReservationId]);
            $rowSt = $stmtSt->fetch(\PDO::FETCH_ASSOC);
            if ($rowSt && !in_array(strtoupper((string) ($rowSt['status'] ?? '')), ['PENDIENTE', 'CONFIRMADA'], true)) {
                $blockingRulesApply = false;
            }
        }

        if ($blockingRulesApply) {
            $countSql = "
                SELECT COUNT(*) FROM {$this->table}
                WHERE house_id = ?
                AND status IN ('PENDIENTE', 'CONFIRMADA')
                AND YEAR(reservation_date) = ?
                AND MONTH(reservation_date) = ?
            ";
            $countParams = [$houseId, $year, $month];
            if ($excludeReservationId !== null && $excludeReservationId !== '') {
                $countSql .= ' AND id != ?';
                $countParams[] = (int) $excludeReservationId;
            }
            $stmt = $this->pdo->prepare($countSql);
            $stmt->execute($countParams);
            $othersInMonth = (int) $stmt->fetchColumn();
            if ($othersInMonth >= RESERVATION_MAX_ACTIVE_PER_MONTH_PER_HOUSE) {
                return 'Se alcanzó el máximo de reservas activas por mes para esta casa (' . RESERVATION_MAX_ACTIVE_PER_MONTH_PER_HOUSE . ')';
            }
        }

        if (!$blockingRulesApply) {
            return null;
        }

        $overlapSql = "
            SELECT COUNT(*) FROM {$this->table}
            WHERE access_point_id = ?
            AND status IN ('PENDIENTE', 'CONFIRMADA')
            AND reservation_date < ?
            AND end_date > ?
        ";
        $overlapParams = [$accessPointId, $endDateStr, $reservationDateStr];
        if ($excludeReservationId !== null && $excludeReservationId !== '') {
            $overlapSql .= ' AND id != ?';
            $overlapParams[] = (int) $excludeReservationId;
        }
        $stmtO = $this->pdo->prepare($overlapSql);
        $stmtO->execute($overlapParams);
        if ((int) $stmtO->fetchColumn() > 0) {
            return 'El horario se solapa con otra reserva pendiente o confirmada en esta área';
        }

        return null;
    }
}

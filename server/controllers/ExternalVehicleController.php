<?php
/**
 * ExternalVehicleController para VC-INGRESO
 *
 * Visitas temporales (taxi, delivery, movilidad escolar, etc.): cada usuario autenticado
 * registra y gestiona sus propias anotaciones (registered_by_user_id). Administración y
 * operarios ven y pueden editar el listado completo para portería.
 */

namespace Controllers;

require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../helpers/house_permissions.php';
require_once __DIR__ . '/../helpers/license_plate.php';

use Utils\Response;

class ExternalVehicleController extends Controller {
    protected $tableName = 'temporary_visits';

    private function getAuthUserId(array $auth): int {
        return isset($auth['user_id']) ? (int) $auth['user_id'] : 0;
    }

    /**
     * Staff: acceso total. Vecino: solo filas donde registered_by_user_id = su user_id.
     * Filas sin registrante (legado): solo staff.
     */
    private function canAccessTemporaryVisit(array $auth, $visit): bool {
        if (isStaffRole($auth)) {
            return true;
        }
        $uid = $this->getAuthUserId($auth);
        $owner = is_object($visit)
            ? (int) ($visit->registered_by_user_id ?? 0)
            : (int) ($visit['registered_by_user_id'] ?? 0);

        return $uid > 0 && $owner > 0 && $owner === $uid;
    }

    /**
     * Listar vehículos externos.
     * - ?mine=1: solo los registrados por el usuario en sesión (Mi casa; aplica también a admin/operario como residentes).
     * - Sin mine y rol staff: listado global (pantalla Vehículos).
     * - Sin mine y vecino: solo propios (mismo criterio que mine=1).
     */
    public function index($params = []) {
        $auth = requireAuth();
        $mineParam = $_GET['mine'] ?? $params['mine'] ?? '';
        $mine = $mineParam === '1' || $mineParam === 'true' || $mineParam === true || $mineParam === 1;

        $uid = $this->getAuthUserId($auth);
        $onlyMine = $mine || !isStaffRole($auth);

        if ($onlyMine) {
            if ($uid <= 0) {
                Response::error('Sesión inválida', 403);
                return;
            }
            $stmt = $this->db->prepare(
                "SELECT * FROM {$this->tableName} WHERE registered_by_user_id = ? ORDER BY temp_visit_id DESC"
            );
            $stmt->execute([$uid]);
            $visits = $stmt->fetchAll(\PDO::FETCH_OBJ);
            Response::success($visits, 'Vehículos externos obtenidos correctamente');
            return;
        }

        $visits = $this->getAll([], 'temp_visit_id DESC');
        Response::success($visits, 'Vehículos externos obtenidos correctamente');
    }

    /**
     * Obtener vehículo externo por ID
     */
    public function show($params = []) {
        $auth = requireAuth();
        $id = $params['id'] ?? null;

        if (!$id) {
            Response::error('ID requerido', 400);
            return;
        }

        $visit = $this->findById($id, 'temp_visit_id');

        if (!$visit) {
            Response::notFound('Vehículo externo no encontrado');
            return;
        }
        if (!$this->canAccessTemporaryVisit($auth, $visit)) {
            Response::error('Sin permiso para ver este registro', 403);
            return;
        }

        Response::success($visit);
    }

    /**
     * Crear nuevo vehículo externo (queda asociado al usuario en sesión).
     */
    public function store($params = []) {
        $auth = requireAuth();
        $uid = $this->getAuthUserId($auth);
        if ($uid <= 0) {
            Response::error('Sesión inválida', 403);
            return;
        }

        $data = $this->getInput();

        $required = ['temp_visit_doc'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo requerido faltante: $field", 400);
                return;
            }
        }

        $allowed = ['temp_visit_name', 'temp_visit_doc', 'temp_visit_plate', 'temp_visit_cel', 'temp_visit_type', 'status_validated', 'status_reason', 'status_system'];

        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        if (array_key_exists('temp_visit_plate', $filtered)) {
            $pn = normalize_license_plate((string) $filtered['temp_visit_plate']);
            $filtered['temp_visit_plate'] = $pn === '' ? null : $pn;
        }
        $filtered['registered_by_user_id'] = $uid;

        $id = $this->create($filtered);
        $visit = $this->findById($id, 'temp_visit_id');

        Response::created($visit, 'Vehículo externo creado correctamente');
    }

    /**
     * Actualizar vehículo externo
     */
    public function updateExternalVehicle($params = []) {
        $auth = requireAuth();
        $id = $params['id'] ?? null;

        if (!$id) {
            Response::error('ID requerido', 400);
            return;
        }

        $visit = $this->findById($id, 'temp_visit_id');
        if (!$visit) {
            Response::notFound('Vehículo externo no encontrado');
            return;
        }
        if (!$this->canAccessTemporaryVisit($auth, $visit)) {
            Response::error('Sin permiso para editar este registro', 403);
            return;
        }

        $data = $this->getInput();

        $allowed = ['temp_visit_name', 'temp_visit_doc', 'temp_visit_plate', 'temp_visit_cel', 'temp_visit_type', 'status_validated', 'status_reason', 'status_system'];

        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        if (array_key_exists('temp_visit_plate', $filtered)) {
            $pn = normalize_license_plate((string) $filtered['temp_visit_plate']);
            $filtered['temp_visit_plate'] = $pn === '' ? null : $pn;
        }

        if (empty($filtered)) {
            Response::error('No hay datos para actualizar', 400);
            return;
        }

        parent::update($id, $filtered, 'temp_visit_id');
        $visit = $this->findById($id, 'temp_visit_id');

        Response::success($visit, 'Vehículo externo actualizado correctamente');
    }

    /**
     * Eliminar vehículo externo
     */
    public function destroy($params = []) {
        $auth = requireAuth();
        $id = $params['id'] ?? null;

        if (!$id) {
            Response::error('ID requerido', 400);
            return;
        }

        $visit = $this->findById($id, 'temp_visit_id');
        if (!$visit) {
            Response::notFound('Vehículo externo no encontrado');
            return;
        }
        if (!$this->canAccessTemporaryVisit($auth, $visit)) {
            Response::error('Sin permiso para eliminar este registro', 403);
            return;
        }

        $this->delete($id, 'temp_visit_id');

        Response::success(null, 'Vehículo externo eliminado correctamente');
    }
}

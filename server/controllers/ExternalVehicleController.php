<?php
/**
 * ExternalVehicleController para VC-INGRESO
 * 
 * Controlador para gestionar vehículos temporales/visitas.
 */

namespace Controllers;

use Utils\Response;

class ExternalVehicleController extends Controller {
    protected $tableName = 'temporary_visits';
    
    /**
     * Listar todos los vehículos externos
     */
    public function index($params = []) {
        $visits = $this->getAll([], 'id DESC');
        Response::success($visits, 'Vehículos externos obtenidos correctamente');
    }
    
    /**
     * Obtener vehículo externo por ID
     */
    public function show($params = []) {
        $id = $params['id'] ?? null;
        
        if (!$id) {
            Response::error('ID requerido', 400);
        }
        
        $visit = $this->findById($id, 'id');
        
        if (!$visit) {
            Response::notFound('Vehículo externo no encontrado');
        }
        
        Response::success($visit);
    }
    
    /**
     * Crear nuevo vehículo externo
     */
    public function store($params = []) {
        $data = $this->getInput();
        
        // Validar campos requeridos
        $required = ['temp_visit_doc'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo requerido faltante: $field", 400);
            }
        }
        
        // Campos permitidos
        $allowed = ['temp_visit_name', 'temp_visit_doc', 'temp_visit_plate', 'temp_visit_cel', 'temp_visit_type', 'status_validated', 'status_reason', 'status_system'];
        
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        
        $id = $this->create($filtered);
        $visit = $this->findById($id, 'id');
        
        Response::created($visit, 'Vehículo externo creado correctamente');
    }
    
    /**
     * Actualizar vehículo externo
     */
    public function updateExternalVehicle($params = []) {
        $id = $params['id'] ?? null;
        
        if (!$id) {
            Response::error('ID requerido', 400);
        }
        
        $visit = $this->findById($id, 'id');
        if (!$visit) {
            Response::notFound('Vehículo externo no encontrado');
        }
        
        $data = $this->getInput();
        
        // Campos permitidos
        $allowed = ['temp_visit_name', 'temp_visit_doc', 'temp_visit_plate', 'temp_visit_cel', 'temp_visit_type', 'status_validated', 'status_reason', 'status_system'];
        
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        
        if (empty($filtered)) {
            Response::error('No hay datos para actualizar', 400);
        }
        
        parent::update($id, $filtered, 'id');
        $visit = $this->findById($id, 'id');
        
        Response::success($visit, 'Vehículo externo actualizado correctamente');
    }
    
    /**
     * Eliminar vehículo externo
     */
    public function destroy($params = []) {
        $id = $params['id'] ?? null;
        
        if (!$id) {
            Response::error('ID requerido', 400);
        }
        
        $visit = $this->findById($id, 'id');
        if (!$visit) {
            Response::notFound('Vehículo externo no encontrado');
        }
        
        $this->delete($id, 'id');
        
        Response::success(null, 'Vehículo externo eliminado correctamente');
    }
}

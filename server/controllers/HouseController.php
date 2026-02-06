<?php
/**
 * HouseController para VC-INGRESO
 * 
 * Controlador para gestionar las casas/lotes del conjunto residencial.
 */

namespace Controllers;

use Utils\Response;

class HouseController extends Controller {
    protected $tableName = 'houses';
    
    /**
     * Listar todas las casas
     */
    public function index($params = []) {
        $houses = $this->getAll([], 'house_id DESC');
        Response::success($houses, 'Casas obtenidas correctamente');
    }

    /**
     * Obtener casa por ID
     */
    public function show($params = []) {
        $houseId = $params['id'] ?? null;

        if (!$houseId) {
            Response::error('ID de casa requerido', 400);
        }

        $house = $this->findById($houseId, 'house_id');
        
        if (!$house) {
            Response::notFound('Casa no encontrada');
        }
        
        Response::success($house);
    }
    
    /**
     * Crear nueva casa
     */
    public function store($params = []) {
        $data = $this->getInput();
        
        // Validar campos requeridos
        $required = ['house_type', 'block_house', 'status_system'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo requerido faltante: $field", 400);
            }
        }

        // Campos permitidos
        $allowed = ['house_type', 'block_house', 'lot', 'apartment', 'status_system'];
        
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        
        $houseId = $this->create($filtered);
        $house = $this->findById($houseId, 'house_id');

        Response::created($house, 'Casa creada correctamente');
    }
    
    /**
     * Actualizar casa
     */
    public function updateHouse($params = []) {
        $houseId = $params['id'] ?? null;
        
        if (!$houseId) {
            Response::error('ID de casa requerido', 400);
        }
        
        $house = $this->findById($houseId, 'house_id');
        if (!$house) {
            Response::notFound('Casa no encontrada');
        }

        $data = $this->getInput();

        // Campos permitidos
        $allowed = ['house_type', 'block_house', 'lot', 'apartment', 'status_system'];

        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }

        if (empty($filtered)) {
            Response::error('No hay datos para actualizar', 400);
        }

        parent::update($houseId, $filtered, 'house_id');
        $house = $this->findById($houseId, 'house_id');
        
        Response::success($house, 'Casa actualizada correctamente');
    }
    
    /**
     * Eliminar casa
     */
    public function destroy($params = []) {
        $houseId = $params['id'] ?? null;
        
        if (!$houseId) {
            Response::error('ID de casa requerido', 400);
        }
        
        $house = $this->findById($houseId, 'house_id');
        if (!$house) {
            Response::notFound('Casa no encontrada');
        }

        $this->delete($houseId, 'house_id');
        
        Response::success(null, 'Casa eliminada correctamente');
    }
}

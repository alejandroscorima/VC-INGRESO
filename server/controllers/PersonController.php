<?php
/**
 * PersonController para VC-INGRESO
 * 
 * Controlador para gestionar personas (residentes, visitantes, trabajadores, etc.)
 * del sistema de control de acceso del condominio.
 * 
 * Estados de validacion:
 * - PERMITIDO: Puede acceder normalmente
 * - DENEGADO: No puede acceder
 * - OBSERVADO: Requiere atencion especial
 * 
 * Tipos de persona:
 * - PROPIETARIO: Dueño de domicilio
 * - RESIDENTE: Vive en el condominio
 * - VISITA: Visita registrada
 * - INQUILINO: Alquila un domicilio
 * - VISITA_TEMPORAL: Taxi, delivery, etc.
 * - TRABAJADOR: Personal del condominio
 */

namespace Controllers;

use Utils\Response;

class PersonController extends Controller {
    protected $tableName = 'persons';  // Tabla renombrada de 'clients'
    
    /**
     * Listar todas las personas.
     * Query: without_user=1 → solo personas que aún no tienen usuario (users.person_id).
     */
    public function index($params = []) {
        $withoutUser = isset($params['without_user']) && ($params['without_user'] === '1' || $params['without_user'] === true);
        if ($withoutUser) {
            $sql = "SELECT p.* FROM {$this->tableName} p
                    LEFT JOIN users u ON u.person_id = p.id
                    WHERE u.user_id IS NULL
                    ORDER BY p.id DESC";
            $stmt = $this->db->query($sql);
            $persons = $stmt->fetchAll();
        } else {
            $persons = $this->getAll([], 'id DESC');
        }
        Response::success($persons, 'Personas obtenidas correctamente');
    }
    
    /**
     * Obtener persona por ID
     */
    public function show($params = []) {
        $id = $params['id'] ?? null;
        
        if (!$id) {
            Response::error('ID de persona requerido', 400);
        }
        
        $person = $this->findById($id, 'id');
        
        if (!$person) {
            Response::notFound('Persona no encontrada');
        }
        
        Response::success($person);
    }
    
    /**
     * Obtener persona por numero de documento
     */
    public function byDocNumber($params = []) {
        $docNumber = $params['doc_number'] ?? null;
        
        if (!$docNumber) {
            Response::error('Numero de documento requerido', 400);
        }
        
        $sql = "SELECT * FROM {$this->tableName} WHERE doc_number = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$docNumber]);
        
        $person = $stmt->fetch();
        
        if (!$person) {
            Response::notFound('Persona no encontrada');
        }
        
        Response::success($person);
    }
    
    /**
     * Listar personas observadas (estado OBSERVADO)
     */
    public function observed($params = []) {
        $sql = "SELECT * FROM {$this->tableName} WHERE status_validated = 'OBSERVADO' ORDER BY id DESC";
        $stmt = $this->db->query($sql);
        $persons = $stmt->fetchAll();
        
        Response::success($persons, 'Personas observadas obtenidas');
    }
    
    /**
     * Listar personas restringidas (estado DENEGADO)
     */
    public function restricted($params = []) {
        $sql = "SELECT * FROM {$this->tableName} WHERE status_validated = 'DENEGADO' ORDER BY id DESC";
        $stmt = $this->db->query($sql);
        $persons = $stmt->fetchAll();
        
        Response::success($persons, 'Personas restringidas obtenidas');
    }
    
    /**
     * Crear nueva persona
     */
    public function store($params = []) {
        $data = $this->getInput();
        
        // Validar campos requeridos
        $required = ['doc_number', 'first_name', 'paternal_surname'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                Response::error("Campo requerido faltante: $field", 400);
            }
        }
        
        // Verificar si ya existe
        if ($this->exists('doc_number', $data['doc_number'])) {
            Response::error('Ya existe una persona con este documento', 409);
        }
        
        // Campos permitidos
        $allowed = [
            'type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname',
            'gender', 'birth_date', 'cel_number', 'email', 'address', 'district',
            'province', 'region', 'status_validated', 'status_reason', 'status_system',
            'person_type', 'house_id', 'photo_url', 'origin_list', 'motivo',
            'sala_list', 'fecha_list', 'fecha_registro', 'sala_registro', 'condicion'
        ];
        
        $filtered = [];
        foreach ($allowed as $field) {
            if (isset($data[$field])) {
                $filtered[$field] = $data[$field];
            }
        }
        
        // Estado por defecto
        if (!isset($filtered['status_validated'])) {
            $filtered['status_validated'] = 'PERMITIDO';
        }
        
        $id = $this->create($filtered);
        $person = $this->findById($id, 'id');
        
        Response::created($person, 'Persona creada correctamente');
    }
    
    /**
     * Actualizar persona
     */
    public function updatePerson($params = []) {
        $id = $params['id'] ?? null;
        
        if (!$id) {
            Response::error('ID de persona requerido', 400);
        }
        
        $person = $this->findById($id, 'id');
        if (!$person) {
            Response::notFound('Persona no encontrada');
        }
        
        $data = $this->getInput();
        
        // Campos permitidos
        $allowed = [
            'type_doc', 'doc_number', 'first_name', 'paternal_surname', 'maternal_surname',
            'gender', 'birth_date', 'cel_number', 'email', 'address', 'district',
            'province', 'region', 'status_validated', 'status_reason', 'status_system',
            'person_type', 'house_id', 'photo_url', 'origin_list', 'motivo',
            'sala_list', 'fecha_list'
        ];
        
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
        $person = $this->findById($id, 'id');
        
        Response::success($person, 'Persona actualizada correctamente');
    }
    
    /**
     * Cambiar estado de validacion de una persona
     * POST /api/v1/persons/:id/validate
     */
    public function validate($params = []) {
        $id = $params['id'] ?? null;
        
        if (!$id) {
            Response::error('ID de persona requerido', 400);
        }
        
        $person = $this->findById($id, 'id');
        if (!$person) {
            Response::notFound('Persona no encontrada');
        }
        
        $data = $this->getInput();
        
        if (!isset($data['status_validated'])) {
            Response::error('Estado de validacion requerido', 400);
        }
        
        $validStatuses = ['PERMITIDO', 'DENEGADO', 'OBSERVADO'];
        if (!in_array($data['status_validated'], $validStatuses)) {
            Response::error('Estado invalido. Valores permitidos: PERMITIDO, DENEGADO, OBSERVADO', 400);
        }
        
        parent::update($id, [
            'status_validated' => $data['status_validated'],
            'status_reason' => $data['status_reason'] ?? null
        ], 'id');
        
        $person = $this->findById($id, 'id');
        Response::success($person, 'Estado de validacion actualizado');
    }
    
    /**
     * Eliminar persona
     */
    public function destroy($params = []) {
        $id = $params['id'] ?? null;
        
        if (!$id) {
            Response::error('ID de persona requerido', 400);
        }
        
        $person = $this->findById($id, 'id');
        if (!$person) {
            Response::notFound('Persona no encontrada');
        }
        
        $this->delete($id, 'id');
        
        Response::success(null, 'Persona eliminada correctamente');
    }
}

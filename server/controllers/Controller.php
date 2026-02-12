<?php
/**
 * Base Controller para VC-INGRESO
 * 
 * Clase base para todos los controladores de la aplicación.
 * Proporciona funcionalidad común y acceso a la base de datos.
 */

namespace Controllers;

use PDO;
use Utils\Response;

class Controller {
    protected $db;
    protected $tableName = '';
    
    public function __construct() {
        $this->db = $this->getDatabase();
    }
    
    /**
     * Obtener conexión a la base de datos (única fuente: db_connection.php)
     */
    protected function getDatabase() {
        require_once __DIR__ . '/../db_connection.php';
        return getDbConnection();
    }
    
    /**
     * Obtener todos los registros
     */
    protected function getAll($conditions = [], $orderBy = 'id DESC') {
        $sql = "SELECT * FROM {$this->tableName}";
        $params = [];
        
        if (!empty($conditions)) {
            $where = [];
            foreach ($conditions as $column => $value) {
                $where[] = "$column = ?";
                $params[] = $value;
            }
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        
        $sql .= " ORDER BY $orderBy";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll();
    }
    
    /**
     * Obtener registro por ID
     */
    protected function findById($id, $idColumn = 'id') {
        $sql = "SELECT * FROM {$this->tableName} WHERE $idColumn = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        
        return $stmt->fetch();
    }
    
    /**
     * Crear nuevo registro
     */
    protected function create($data) {
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        $sql = "INSERT INTO {$this->tableName} ($columns) VALUES ($placeholders)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(array_values($data));
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Actualizar registro
     */
    protected function update($id, $data = null, $idColumn = 'id') {
        if (is_array($id) && $data === null) {
            // Llamada con $this->update($data, $idColumn)
            $data = $id;
            $id = $data[$idColumn] ?? null;
        }
        
        $set = implode(', ', array_map(fn($col) => "$col = ?", array_keys($data)));
        
        $sql = "UPDATE {$this->tableName} SET $set WHERE $idColumn = ?";
        $params = array_values($data);
        $params[] = $id;
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
    
    /**
     * Eliminar registro
     */
    protected function delete($id, $idColumn = 'id') {
        $sql = "DELETE FROM {$this->tableName} WHERE $idColumn = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    /**
     * Verificar si existe registro
     */
    protected function exists($column, $value) {
        $sql = "SELECT 1 FROM {$this->tableName} WHERE $column = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$value]);
        
        return $stmt->fetch() !== false;
    }
    
    /**
     * Obtener entrada JSON
     */
    protected function getInput() {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            Response::error('JSON inválido', 400);
        }
        
        return $data;
    }
}

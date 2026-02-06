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
     * Obtener conexión a la base de datos
     */
    protected function getDatabase() {
        static $pdo = null;
        
        if ($pdo === null) {
            $host = getenv('DB_HOST') ?: 'localhost';
            $port = getenv('DB_PORT') ?: '3306';
            $dbname = getenv('DB_NAME') ?: 'vc_db';
            $user = getenv('DB_USER') ?: 'root';
            $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
            $charset = getenv('DB_CHARSET') ?: 'utf8mb4';
            
            $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=$charset";
            
            try {
                $pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
            } catch (PDOException $e) {
                Response::error('Error de conexión a la base de datos', 500, $e->getMessage());
            }
        }
        
        return $pdo;
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

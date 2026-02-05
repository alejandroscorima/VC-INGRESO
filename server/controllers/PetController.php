<?php
/**
 * PetController - Gestión de Mascotas
 * 
 * Endpoints para CRUD de mascotas
 */

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../vc_db.php';

class PetController {
    private $pdo;
    
    public function __construct() {
        $this->pdo = getDbConnection();
    }
    
    /**
     * GET /api/v1/pets
     * Lista todas las mascotas con filtros opcionales
     */
    public function index($params = []) {
        try {
            // Verificar autenticación
            requireAuth();
            
            $sql = "SELECT p.*, 
                           o.doc_number as owner_doc,
                           o.first_name as owner_first_name,
                           o.paternal_surname as owner_paternal_surname
                    FROM pets p
                    JOIN persons o ON p.owner_id = o.id
                    WHERE 1=1";
            
            $types = [];
            $values = [];
            
            // Filtro por owner_id
            if (isset($params['owner_id']) && !empty($params['owner_id'])) {
                $sql .= " AND p.owner_id = ?";
                $types[] = 'i';
                $values[] = $params['owner_id'];
            }
            
            // Filtro por status_validated
            if (isset($params['status']) && !empty($params['status'])) {
                $sql .= " AND p.status_validated = ?";
                $types[] = 's';
                $values[] = $params['status'];
            }
            
            // Filtro por species
            if (isset($params['species']) && !empty($params['species'])) {
                $sql .= " AND p.species = ?";
                $types[] = 's';
                $values[] = $params['species'];
            }
            
            $sql .= " ORDER BY p.created_at DESC";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);
            $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::json([
                'success' => true,
                'data' => $pets,
                'count' => count($pets)
            ]);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * GET /api/v1/pets/:id
     * Obtiene una mascota por ID
     */
    public function show($id) {
        try {
            requireAuth();
            
            $stmt = $this->pdo->prepare("SELECT p.*, 
                                                o.doc_number as owner_doc,
                                                o.first_name as owner_first_name,
                                                o.paternal_surname as owner_paternal_surname
                                         FROM pets p
                                         JOIN persons o ON p.owner_id = o.id
                                         WHERE p.id = ?");
            $stmt->execute([$id]);
            $pet = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$pet) {
                Response::json([
                    'success' => false,
                    'error' => 'Mascota no encontrada'
                ], 404);
                return;
            }
            
            Response::json([
                'success' => true,
                'data' => $pet
            ]);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * GET /api/v1/pets/person/:person_id
     * Obtiene las mascotas de un propietario
     */
    public function byOwner($person_id) {
        try {
            requireAuth();
            
            $stmt = $this->pdo->prepare("SELECT * FROM pets WHERE owner_id = ? ORDER BY created_at DESC");
            $stmt->execute([$person_id]);
            $pets = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::json([
                'success' => true,
                'data' => $pets,
                'count' => count($pets)
            ]);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * POST /api/v1/pets
     * Crea una nueva mascota
     */
    public function store($data) {
        try {
            requireAuth();
            
            // Validar datos requeridos
            if (empty($data['name']) || empty($data['species']) || empty($data['owner_id'])) {
                Response::json([
                    'success' => false,
                    'error' => 'Faltan datos requeridos: name, species, owner_id'
                ], 400);
                return;
            }
            
            $sql = "INSERT INTO pets (name, species, breed, color, owner_id, photo_url, status_validated, microchip_id, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data['name'],
                $data['species'],
                $data['breed'] ?? '',
                $data['color'] ?? '',
                $data['owner_id'],
                $data['photo_url'] ?? null,
                $data['status_validated'] ?? 'PERMITIDO',
                $data['microchip_id'] ?? null
            ]);
            
            $id = $this->pdo->lastInsertId();
            
            Response::json([
                'success' => true,
                'data' => ['id' => $id, ...$data],
                'message' => 'Mascota creada exitosamente'
            ], 201);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * PUT /api/v1/pets/:id
     * Actualiza una mascota
     */
    public function update($id, $data) {
        try {
            requireAuth();
            
            // Verificar que existe
            $stmt = $this->pdo->prepare("SELECT id FROM pets WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::json([
                    'success' => false,
                    'error' => 'Mascota no encontrada'
                ], 404);
                return;
            }
            
            $allowedFields = ['name', 'species', 'breed', 'color', 'photo_url', 'status_validated', 'status_reason', 'microchip_id'];
            $updates = [];
            $values = [];
            
            foreach ($data as $key => $value) {
                if (in_array($key, $allowedFields)) {
                    $updates[] = "$key = ?";
                    $values[] = $value;
                }
            }
            
            if (empty($updates)) {
                Response::json([
                    'success' => false,
                    'error' => 'No hay campos válidos para actualizar'
                ], 400);
                return;
            }
            
            $values[] = $id;
            $sql = "UPDATE pets SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($values);
            
            Response::json([
                'success' => true,
                'message' => 'Mascota actualizada exitosamente'
            ]);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * PUT /api/v1/pets/:id/validate
     * Cambia el estado de validación de una mascota
     */
    public function validate($id, $data) {
        try {
            requireAuth();
            
            $allowedStatuses = ['PERMITIDO', 'OBSERVADO', 'DENEGADO'];
            
            if (empty($data['status_validated']) || !in_array($data['status_validated'], $allowedStatuses)) {
                Response::json([
                    'success' => false,
                    'error' => 'Estado inválido. Estados permitidos: PERMITIDO, OBSERVADO, DENEGADO'
                ], 400);
                return;
            }
            
            $stmt = $this->pdo->prepare("UPDATE pets SET status_validated = ?, status_reason = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([
                $data['status_validated'],
                $data['status_reason'] ?? null,
                $id
            ]);
            
            Response::json([
                'success' => true,
                'message' => 'Estado de validación actualizado'
            ]);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * DELETE /api/v1/pets/:id
     * Elimina una mascota
     */
    public function destroy($id) {
        try {
            requireAuth();
            
            $stmt = $this->pdo->prepare("SELECT id FROM pets WHERE id = ?");
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::json([
                    'success' => false,
                    'error' => 'Mascota no encontrada'
                ], 404);
                return;
            }
            
            $stmt = $this->pdo->prepare("DELETE FROM pets WHERE id = ?");
            $stmt->execute([$id]);
            
            Response::json([
                'success' => true,
                'message' => 'Mascota eliminada exitosamente'
            ]);
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * POST /api/v1/pets/:id/photo
     * Sube una foto de la mascota
     */
    public function uploadPhoto($id) {
        try {
            requireAuth();
            
            if (!isset($_FILES['photo'])) {
                Response::json([
                    'success' => false,
                    'error' => 'No se ha subido ninguna imagen'
                ], 400);
                return;
            }
            
            $uploadDir = __DIR__ . '/../../uploads/pets/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $file = $_FILES['photo'];
            $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
            $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
            
            if (!in_array($ext, $allowedExts)) {
                Response::json([
                    'success' => false,
                    'error' => 'Formato de imagen no permitido'
                ], 400);
                return;
            }
            
            $filename = "pet_{$id}_{$file['name']}";
            $filepath = $uploadDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $filepath)) {
                $photoUrl = "/uploads/pets/{$filename}";
                
                $stmt = $this->pdo->prepare("UPDATE pets SET photo_url = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$photoUrl, $id]);
                
                Response::json([
                    'success' => true,
                    'photo_url' => $photoUrl,
                    'message' => 'Foto subida exitosamente'
                ]);
            } else {
                Response::json([
                    'success' => false,
                    'error' => 'Error al subir la imagen'
                ], 500);
            }
        } catch (Exception $e) {
            Response::json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

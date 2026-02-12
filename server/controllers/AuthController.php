<?php
/**
 * AuthController - Login y autenticación
 * Usa db_connection.php y token.php (JWT).
 */

namespace Controllers;

require_once __DIR__ . '/../db_connection.php';
require_once __DIR__ . '/../token.php';
require_once __DIR__ . '/../utils/Response.php';

use Utils\Response;

class AuthController
{
    /**
     * POST /api/v1/auth/login
     * Autentica por username/password. Retorna user, person, my_houses, token.
     */
    public static function login(): void
    {
        $payload = json_decode(file_get_contents('php://input'), true) ?? [];
        $username = trim($payload['username_system'] ?? '');
        $password = $payload['password_system'] ?? '';

        if ($username === '' || $password === '') {
            Response::error('Parámetros requeridos', 400);
            return;
        }

        $pdo = getDbConnection();

        $sql = "SELECT u.user_id, u.person_id, u.is_active, u.role_system, u.house_id,
            u.status_validated, u.status_reason, u.status_system, u.force_password_change, u.password_system
            FROM users u
            WHERE LOWER(u.username_system) = LOWER(:username)";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':username', $username, \PDO::PARAM_STR);
        $stmt->execute();
        $user = $stmt->fetch(\PDO::FETCH_OBJ);

        if (!$user || $user->password_system === null || $user->password_system === '') {
            Response::error('Credenciales inválidas', 401);
            return;
        }

        if (isset($user->is_active) && (int)$user->is_active === 0) {
            Response::error('Cuenta deshabilitada', 401);
            return;
        }

        $stored = (string) $user->password_system;
        $isHashed = (strlen($stored) >= 60 && (strpos($stored, '$2y$') === 0 || strpos($stored, '$2a$') === 0))
            || strpos($stored, '$argon2') === 0;
        $validPassword = $isHashed
            ? password_verify($password, $stored)
            : hash_equals($stored, (string) $password);

        if (!$validPassword) {
            Response::error('Credenciales inválidas', 401);
            return;
        }

        $person = null;
        if (!empty($user->person_id)) {
            $stmtPerson = $pdo->prepare("SELECT id, type_doc, doc_number, first_name, paternal_surname, maternal_surname, gender, birth_date, cel_number, email, address, district, province, region, civil_status, person_type, house_id, photo_url, status_validated, status_system FROM persons WHERE id = ?");
            $stmtPerson->execute([$user->person_id]);
            $person = $stmtPerson->fetch(\PDO::FETCH_OBJ);
        }

        $my_houses = [];
        if (!empty($user->person_id)) {
            $stmtHouses = $pdo->prepare("
                SELECT h.house_id, h.house_type, h.block_house, h.lot, h.apartment, hm.relation_type, hm.is_primary
                FROM house_members hm
                JOIN houses h ON h.house_id = hm.house_id
                WHERE hm.person_id = ? AND hm.is_active = 1
                ORDER BY hm.is_primary DESC, hm.id
            ");
            $stmtHouses->execute([$user->person_id]);
            $my_houses = $stmtHouses->fetchAll(\PDO::FETCH_OBJ);
        }
        if (empty($my_houses) && !empty($user->house_id)) {
            $stmtLegacy = $pdo->prepare("SELECT house_id, house_type, block_house, lot, apartment FROM houses WHERE house_id = ?");
            $stmtLegacy->execute([$user->house_id]);
            $h = $stmtLegacy->fetch(\PDO::FETCH_OBJ);
            if ($h) {
                $h->relation_type = 'RESIDENTE';
                $h->is_primary = 1;
                $my_houses = [$h];
            }
        }

        unset($user->password_system);

        // Fusionar datos de person en user para que el frontend tenga photo_url, first_name, etc. en un solo objeto (persistencia de foto de perfil al re-login).
        if ($person) {
            foreach (get_object_vars($person) as $key => $value) {
                if (!isset($user->{$key})) {
                    $user->{$key} = $value;
                }
            }
        }

        // Añadir manzana, lote y departamento de la vivienda principal para side-nav y nav-bar (getUserDomicilio).
        $primaryHouse = $my_houses[0] ?? null;
        if ($primaryHouse) {
            $user->block_house = $primaryHouse->block_house ?? null;
            $user->lot = $primaryHouse->lot ?? null;
            $user->apartment = $primaryHouse->apartment ?? null;
        }

        $tokenPayload = [
            'user_id' => $user->user_id,
            'role_system' => $user->role_system,
            'house_id' => $user->house_id,
        ];
        if (!empty($user->person_id)) {
            $tokenPayload['person_id'] = (int) $user->person_id;
        }
        $token = generateToken($tokenPayload);

        Response::json([
            'user' => $user,
            'person' => $person,
            'my_houses' => $my_houses,
            'token' => $token,
        ]);
    }
}

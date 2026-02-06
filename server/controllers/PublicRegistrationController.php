<?php
/**
 * PublicRegistrationController - Registro público sin login
 *
 * POST /api/v1/public/register
 * Acepta el formulario completo: vivienda + propietario(s) + vehículos + mascotas.
 * No requiere autenticación.
 */

namespace Controllers;

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../db_connection.php';

use Utils\Response;

class PublicRegistrationController
{
    private $pdo;

    public function __construct()
    {
        $this->pdo = getDbConnection();
    }

    private function getInput(): array
    {
        $input = file_get_contents('php://input');
        if ($input === false || $input === '') {
            return [];
        }
        $data = json_decode($input, true);
        return is_array($data) ? $data : [];
    }

    /**
     * POST /api/v1/public/register
     * Body: {
     *   house: { house_type, block_house, lot, apartment? },
     *   owners: [ { doc_number, first_name, paternal_surname, maternal_surname?, cel_number?, email?, type_doc? } ],
     *   vehicles?: [ { license_plate, type_vehicle?, brand?, color?, photo_url? } ],
     *   pets?: [ { species, name, breed?, color?, age_years?, photo_url? } ]
     * }
     */
    public function register(): void
    {
        $data = $this->getInput();

        $house = $data['house'] ?? null;
        $owners = $data['owners'] ?? [];
        $vehicles = $data['vehicles'] ?? [];
        $pets = $data['pets'] ?? [];

        if (!$house || !is_array($house)) {
            Response::json(['success' => false, 'error' => 'Falta objeto house (house_type, block_house, lot)'], 400);
            return;
        }
        if (empty($owners) || !is_array($owners)) {
            Response::json(['success' => false, 'error' => 'Debe enviar al menos un propietario en owners[]'], 400);
            return;
        }

        $houseType = $house['house_type'] ?? '';
        $blockHouse = $house['block_house'] ?? '';
        $lot = $house['lot'] ?? null;
        $apartment = $house['apartment'] ?? null;
        $allowedTypes = ['CASA', 'DEPARTAMENTO', 'LOCAL COMERCIAL', 'OTRO'];
        if (!in_array($houseType, $allowedTypes)) {
            Response::json(['success' => false, 'error' => 'house_type debe ser: CASA, DEPARTAMENTO, LOCAL COMERCIAL u OTRO'], 400);
            return;
        }
        if ($blockHouse === '' || $lot === null || $lot === '') {
            Response::json(['success' => false, 'error' => 'house debe incluir block_house y lot'], 400);
            return;
        }

        foreach ($owners as $i => $o) {
            if (empty($o['doc_number']) || empty($o['first_name']) || empty($o['paternal_surname'])) {
                Response::json(['success' => false, 'error' => "Propietario " . ($i + 1) . ": se requieren doc_number, first_name y paternal_surname"], 400);
                return;
            }
        }

        foreach ($vehicles as $i => $v) {
            if (empty($v['license_plate'])) {
                Response::json(['success' => false, 'error' => "Vehículo " . ($i + 1) . ": se requiere license_plate"], 400);
                return;
            }
        }

        foreach ($pets as $i => $p) {
            if (empty($p['name']) || empty($p['species'])) {
                Response::json(['success' => false, 'error' => "Mascota " . ($i + 1) . ": se requieren name y species (PERRO, GATO, AVE, OTRO)"], 400);
                return;
            }
            $speciesAllowed = ['PERRO', 'GATO', 'AVE', 'OTRO'];
            if (!in_array($p['species'], $speciesAllowed)) {
                Response::json(['success' => false, 'error' => "Mascota " . ($i + 1) . ": species debe ser PERRO, GATO, AVE u OTRO"], 400);
                return;
            }
        }

        try {
            $this->pdo->beginTransaction();

            $stmt = $this->pdo->prepare("INSERT INTO houses (house_type, block_house, lot, apartment, status_system) VALUES (?, ?, ?, ?, 'ACTIVO')");
            $stmt->execute([$houseType, $blockHouse, (int) $lot, $apartment !== '' ? $apartment : null]);
            $houseId = (int) $this->pdo->lastInsertId();

            $personIds = [];
            foreach ($owners as $o) {
                $doc = trim($o['doc_number']);
                $stmt = $this->pdo->prepare("SELECT id FROM persons WHERE doc_number = ? LIMIT 1");
                $stmt->execute([$doc]);
                if ($stmt->fetch()) {
                    $this->pdo->rollBack();
                    Response::json(['success' => false, 'error' => 'Ya existe una persona con documento ' . $doc], 409);
                    return;
                }
                $stmt = $this->pdo->prepare("
                    INSERT INTO persons (type_doc, doc_number, first_name, paternal_surname, maternal_surname, cel_number, email, person_type, house_id, status_validated, status_system)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'PROPIETARIO', ?, 'PERMITIDO', 'ACTIVO')
                ");
                $stmt->execute([
                    $o['type_doc'] ?? 'DNI',
                    $doc,
                    trim($o['first_name']),
                    trim($o['paternal_surname']),
                    isset($o['maternal_surname']) ? trim($o['maternal_surname']) : null,
                    isset($o['cel_number']) ? trim($o['cel_number']) : null,
                    isset($o['email']) ? trim($o['email']) : null,
                    $houseId
                ]);
                $personIds[] = (int) $this->pdo->lastInsertId();
            }

            $firstOwnerId = $personIds[0] ?? null;
            $vehicleIds = [];
            foreach ($vehicles as $v) {
                $plate = trim($v['license_plate']);
                $stmt = $this->pdo->prepare("SELECT vehicle_id FROM vehicles WHERE license_plate = ? LIMIT 1");
                $stmt->execute([$plate]);
                if ($stmt->fetch()) {
                    $this->pdo->rollBack();
                    Response::json(['success' => false, 'error' => 'Ya existe un vehículo con la placa ' . $plate], 409);
                    return;
                }
                $stmt = $this->pdo->prepare("
                    INSERT INTO vehicles (license_plate, type_vehicle, house_id, owner_id, brand, color, photo_url, status_validated, status_system)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'PERMITIDO', 'ACTIVO')
                ");
                $stmt->execute([
                    $plate,
                    $v['type_vehicle'] ?? null,
                    $houseId,
                    $firstOwnerId,
                    $v['brand'] ?? null,
                    $v['color'] ?? null,
                    $v['photo_url'] ?? null
                ]);
                $vehicleIds[] = (int) $this->pdo->lastInsertId();
            }

            $petIds = [];
            foreach ($pets as $p) {
                $stmt = $this->pdo->prepare("
                    INSERT INTO pets (name, species, breed, color, age_years, house_id, owner_id, photo_url, status_validated, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PERMITIDO', NOW(), NOW())
                ");
                $stmt->execute([
                    trim($p['name']),
                    $p['species'],
                    $p['breed'] ?? '',
                    $p['color'] ?? '',
                    isset($p['age_years']) ? (int) $p['age_years'] : null,
                    $houseId,
                    $firstOwnerId,
                    $p['photo_url'] ?? null
                ]);
                $petIds[] = (int) $this->pdo->lastInsertId();
            }

            $this->pdo->commit();

            Response::json([
                'success' => true,
                'data' => [
                    'house_id' => $houseId,
                    'person_ids' => $personIds,
                    'vehicle_ids' => $vehicleIds,
                    'pet_ids' => $petIds
                ],
                'message' => 'Registro completado correctamente'
            ], 201);
        } catch (\Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            Response::json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

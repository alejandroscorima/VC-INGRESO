<?php
/**
 * JWT QR de acceso (vecinos) y escaneo/validación (staff).
 */

namespace Controllers;

require_once __DIR__ . '/../helpers/house_permissions.php';
require_once __DIR__ . '/../helpers/license_plate.php';
require_once __DIR__ . '/../token.php';
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../utils/Response.php';

use Utils\Response;

class AccessQrController
{
    private const QR_TYP = 'vc_access_qr';
    private const TTL_SECONDS = 7776000; // 90 días

    /** @var \PDO */
    private $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function generate(): void
    {
        $auth = requireAuth();
        if (!canGenerateAccessQr($this->pdo, $auth)) {
            Response::error('No autorizado para generar QR de ingreso (persona vinculada, combinación rol/tipo válida y casa asociada).', 403);
            return;
        }

        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $kind = strtolower(trim($body['kind'] ?? ''));

        if ($kind !== 'person' && $kind !== 'vehicle') {
            Response::error('kind requerido: person o vehicle', 400);
            return;
        }

        if ($kind === 'person') {
            $personId = isset($body['person_id']) ? (int) $body['person_id'] : 0;
            if ($personId <= 0) {
                Response::error('person_id requerido', 400);
                return;
            }
            if (!canGenerateQrForPerson($this->pdo, $auth, $personId)) {
                Response::error('No autorizado para generar QR de esta persona', 403);
                return;
            }
            $stmt = $this->pdo->prepare(
                'SELECT id, doc_number, house_id FROM persons WHERE id = ? LIMIT 1'
            );
            $stmt->execute([$personId]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row || $row['doc_number'] === null || $row['doc_number'] === '') {
                Response::error('Persona no encontrada', 404);
                return;
            }
            $hid = (int) ($row['house_id'] ?? 0);
            if ($hid <= 0) {
                $stmtH = $this->pdo->prepare(
                    'SELECT house_id FROM house_members WHERE person_id = ? AND COALESCE(is_active, 1) = 1 ORDER BY is_primary DESC, id ASC LIMIT 1'
                );
                $stmtH->execute([$personId]);
                $hm = $stmtH->fetch(\PDO::FETCH_ASSOC);
                if ($hm && !empty($hm['house_id'])) {
                    $hid = (int) $hm['house_id'];
                }
            }
            if ($hid <= 0) {
                Response::error('Persona sin casa asociada para el QR', 422);
                return;
            }
            $payload = [
                'typ' => self::QR_TYP,
                'v' => 1,
                'k' => 'person',
                'doc' => (string) $row['doc_number'],
                'hid' => $hid,
                'pid' => (int) $row['id'],
            ];
            $token = generateToken($payload, self::TTL_SECONDS);
            $exp = time() + self::TTL_SECONDS;
            Response::success([
                'token' => $token,
                'expires_at' => $exp,
                'kind' => 'person',
                'person_id' => (int) $row['id'],
                'doc_number' => (string) $row['doc_number'],
                'house_id' => $hid,
            ], 'Token generado');
            return;
        }

        $vehicleId = isset($body['vehicle_id']) ? (int) $body['vehicle_id'] : 0;
        if ($vehicleId <= 0) {
            Response::error('vehicle_id requerido', 400);
            return;
        }
        if (!canGenerateQrForVehicle($this->pdo, $auth, $vehicleId)) {
            Response::error('No autorizado para generar QR de este vehículo', 403);
            return;
        }
        $stmt = $this->pdo->prepare(
            'SELECT vehicle_id, license_plate, house_id FROM vehicles WHERE vehicle_id = ? LIMIT 1'
        );
        $stmt->execute([$vehicleId]);
        $row = $stmt->fetch(\PDO::FETCH_ASSOC);
        if (!$row) {
            Response::error('Vehículo no encontrado', 404);
            return;
        }
        $plate = normalize_license_plate((string) ($row['license_plate'] ?? ''));
        $hid = (int) $row['house_id'];
        $payload = [
            'typ' => self::QR_TYP,
            'v' => 1,
            'k' => 'vehicle',
            'plate' => $plate,
            'hid' => $hid,
            'vid' => (int) $row['vehicle_id'],
        ];
        $token = generateToken($payload, self::TTL_SECONDS);
        $exp = time() + self::TTL_SECONDS;
        Response::success([
            'token' => $token,
            'expires_at' => $exp,
            'kind' => 'vehicle',
            'vehicle_id' => (int) $row['vehicle_id'],
            'license_plate' => $plate,
            'house_id' => $hid,
        ], 'Token generado');
    }

    public function validate(): void
    {
        $auth = requireAuth();
        if (!isStaffRole($auth)) {
            Response::error('Solo personal autorizado puede validar QR', 403);
            return;
        }
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $token = trim((string) ($body['token'] ?? ''));
        if ($token === '') {
            Response::error('token requerido', 400);
            return;
        }
        $payload = verifyToken($token);
        if ($payload === false) {
            Response::error('Token inválido o expirado', 400);
            return;
        }
        $data = $this->resolveQrPayload($payload);
        if ($data === null) {
            Response::error('QR de acceso no válido', 400);
            return;
        }
        $data['source'] = 'qr';
        Response::success($data, 'OK');
    }

    public function scan(): void
    {
        $auth = requireAuth();
        if (!isStaffRole($auth)) {
            Response::error('Solo personal autorizado puede escanear', 403);
            return;
        }
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $input = trim((string) ($body['input'] ?? ''));
        if ($input === '') {
            Response::error('input requerido', 400);
            return;
        }

        if ($this->looksLikeJwt($input)) {
            $payload = verifyToken($input);
            if ($payload === false) {
                Response::error('Token inválido o expirado', 400);
                return;
            }
            $data = $this->resolveQrPayload($payload);
            if ($data === null) {
                Response::error('QR de acceso no válido', 400);
                return;
            }
            $data['source'] = 'qr';
            Response::success($data, 'OK');
            return;
        }

        $normalized = preg_replace('/\s+/', '', $input);
        if (preg_match('/^[0-9]{8,15}$/', $normalized)) {
            $stmt = $this->pdo->prepare(
                'SELECT * FROM persons WHERE doc_number = ? LIMIT 1'
            );
            $stmt->execute([$normalized]);
            $person = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($person) {
                $data = $this->buildUnifiedFromPerson($person, 'manual');
                Response::success($data, 'OK');
                return;
            }

            // Doc. responsable de vehículo externo (temporary_visits), mismo criterio numérico
            $stmtTvDoc = $this->pdo->prepare(
                'SELECT * FROM temporary_visits
                 WHERE REPLACE(REPLACE(REPLACE(REPLACE(TRIM(temp_visit_doc), \' \', \'\'), \'-\', \'\'), \'.\', \'\'), \'/\', \'\') = ?
                 ORDER BY temp_visit_id DESC
                 LIMIT 1'
            );
            $stmtTvDoc->execute([$normalized]);
            $tempByDoc = $stmtTvDoc->fetch(\PDO::FETCH_ASSOC);
            if ($tempByDoc) {
                $data = $this->buildUnifiedFromTemporaryVisit($tempByDoc, 'manual');
                Response::success($data, 'OK');
                return;
            }

            Response::success([
                'source' => 'manual',
                'kind' => 'person',
                'person' => null,
                'vehicle' => null,
                'doc_number' => $normalized,
                'status_validated' => 'DENEGADO',
                'allow_entry' => false,
                'is_birthday' => false,
                'message' => 'Documento no registrado',
            ], 'OK');
            return;
        }

        $plateNorm = normalize_license_plate($input);
        if ($plateNorm === '') {
            Response::success([
                'source' => 'manual',
                'kind' => 'vehicle',
                'person' => null,
                'vehicle' => null,
                'license_plate' => null,
                'status_validated' => 'DENEGADO',
                'allow_entry' => false,
                'is_birthday' => false,
                'message' => 'Placa no registrada',
            ], 'OK');
            return;
        }
        $stmt = $this->pdo->prepare(
            'SELECT * FROM vehicles WHERE license_plate = ? LIMIT 1'
        );
        $stmt->execute([$plateNorm]);
        $vehicle = $stmt->fetch(\PDO::FETCH_ASSOC);
        if ($vehicle) {
            $data = $this->buildUnifiedFromVehicle($vehicle, 'manual');
            Response::success($data, 'OK');
            return;
        }

        // Vehículos externos (Mi casa → Vehículos externos): tabla temporary_visits
        $stmtTv = $this->pdo->prepare(
            "SELECT * FROM temporary_visits
             WHERE temp_visit_plate IS NOT NULL AND temp_visit_plate <> ''
               AND REGEXP_REPLACE(UPPER(TRIM(temp_visit_plate)), '[^A-Z0-9]', '') = ?
             ORDER BY temp_visit_id DESC LIMIT 1"
        );
        $stmtTv->execute([$plateNorm]);
        $tempVisit = $stmtTv->fetch(\PDO::FETCH_ASSOC);
        if ($tempVisit) {
            $data = $this->buildUnifiedFromTemporaryVisit($tempVisit, 'manual');
            Response::success($data, 'OK');
            return;
        }

        Response::success([
            'source' => 'manual',
            'kind' => 'vehicle',
            'person' => null,
            'vehicle' => null,
            'license_plate' => $plateNorm,
            'status_validated' => 'DENEGADO',
            'allow_entry' => false,
            'is_birthday' => false,
            'message' => 'Placa no registrada',
        ], 'OK');
    }

    private function looksLikeJwt(string $s): bool
    {
        $parts = explode('.', $s);

        return count($parts) === 3 && strlen($parts[0]) > 0 && strlen($parts[1]) > 0;
    }

    /**
     * @param array<string,mixed> $payload
     * @return array<string,mixed>|null
     */
    private function resolveQrPayload(array $payload): ?array
    {
        if (($payload['typ'] ?? '') !== self::QR_TYP) {
            return null;
        }
        $k = strtolower((string) ($payload['k'] ?? ''));
        if ($k === 'person') {
            $pid = isset($payload['pid']) ? (int) $payload['pid'] : 0;
            $docTok = trim((string) ($payload['doc'] ?? ''));
            if ($pid <= 0 || $docTok === '') {
                return null;
            }
            $stmt = $this->pdo->prepare('SELECT * FROM persons WHERE id = ? LIMIT 1');
            $stmt->execute([$pid]);
            $person = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$person) {
                return null;
            }
            if (trim((string) $person['doc_number']) !== $docTok) {
                return null;
            }
            $hidTok = isset($payload['hid']) ? (int) $payload['hid'] : 0;
            $houseIds = $this->personHouseIds((int) $person['id'], $person);
            if ($hidTok > 0 && !in_array($hidTok, $houseIds, true)) {
                return null;
            }

            $data = $this->buildUnifiedFromPerson($person, 'qr');
            $data['token_house_id'] = $hidTok;

            return $data;
        }
        if ($k === 'vehicle') {
            $vid = isset($payload['vid']) ? (int) $payload['vid'] : 0;
            $plateTok = normalize_license_plate((string) ($payload['plate'] ?? ''));
            if ($vid <= 0 || $plateTok === '') {
                return null;
            }
            $stmt = $this->pdo->prepare('SELECT * FROM vehicles WHERE vehicle_id = ? LIMIT 1');
            $stmt->execute([$vid]);
            $vehicle = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$vehicle) {
                return null;
            }
            if (normalize_license_plate((string) $vehicle['license_plate']) !== $plateTok) {
                return null;
            }
            $hidTok = isset($payload['hid']) ? (int) $payload['hid'] : 0;
            $vhid = (int) ($vehicle['house_id'] ?? 0);
            if ($hidTok > 0 && $vhid > 0 && $hidTok !== $vhid) {
                return null;
            }
            if ($hidTok > 0 && $vhid === 0) {
                return null;
            }

            $data = $this->buildUnifiedFromVehicle($vehicle, 'qr');
            $data['token_house_id'] = $hidTok;

            return $data;
        }

        return null;
    }

    /**
     * @param array<string,mixed> $person
     * @return array<string,mixed>
     */
    private function buildUnifiedFromPerson(array $person, string $source): array
    {
        $status = strtoupper(trim((string) ($person['status_validated'] ?? 'PERMITIDO')));
        if ($status === '') {
            $status = 'PERMITIDO';
        }
        $allow = $status !== 'DENEGADO';
        $bd = $person['birth_date'] ?? null;

        return [
            'source' => $source,
            'kind' => 'person',
            'person' => $this->publicPerson($person),
            'vehicle' => null,
            'person_id' => (int) $person['id'],
            'doc_number' => (string) $person['doc_number'],
            'vehicle_id' => null,
            'license_plate' => null,
            'status_validated' => $status,
            'allow_entry' => $allow,
            'is_birthday' => $this->isBirthdayToday($bd),
            'birth_date' => $bd,
        ];
    }

    /**
     * @param array<string,mixed> $vehicle
     * @return array<string,mixed>
     */
    private function buildUnifiedFromVehicle(array $vehicle, string $source): array
    {
        $status = strtoupper(trim((string) ($vehicle['status_validated'] ?? 'PERMITIDO')));
        if ($status === '') {
            $status = 'PERMITIDO';
        }
        $allow = $status !== 'DENEGADO';

        return [
            'source' => $source,
            'kind' => 'vehicle',
            'person' => null,
            'vehicle' => $this->publicVehicle($vehicle),
            'person_id' => null,
            'doc_number' => null,
            'vehicle_id' => (int) $vehicle['vehicle_id'],
            'license_plate' => normalize_license_plate((string) $vehicle['license_plate']),
            'status_validated' => $status,
            'allow_entry' => $allow,
            'is_birthday' => false,
            'birth_date' => null,
        ];
    }

    /**
     * Visita temporal / vehículo externo (temporary_visits), mismo shape unificado que vehículo residente.
     *
     * @param array<string,mixed> $tv
     * @return array<string,mixed>
     */
    private function buildUnifiedFromTemporaryVisit(array $tv, string $source): array
    {
        $status = strtoupper(trim((string) ($tv['status_validated'] ?? 'PERMITIDO')));
        if ($status === '') {
            $status = 'PERMITIDO';
        }
        $sys = strtoupper(trim((string) ($tv['status_system'] ?? 'ACTIVO')));
        if ($sys !== '' && $sys !== 'ACTIVO') {
            $status = 'DENEGADO';
        }
        $allow = $status !== 'DENEGADO';

        $plate = normalize_license_plate((string) ($tv['temp_visit_plate'] ?? ''));
        $doc = trim((string) ($tv['temp_visit_doc'] ?? ''));

        $vehiclePublic = [
            'vehicle_id' => null,
            'license_plate' => $plate,
            'house_id' => null,
            'brand' => $tv['temp_visit_type'] ?? null,
            'model' => $tv['temp_visit_name'] ?? null,
            'photo_url' => null,
            'status_validated' => $tv['status_validated'] ?? null,
        ];

        return [
            'source' => $source,
            'kind' => 'vehicle',
            'person' => null,
            'vehicle' => $vehiclePublic,
            'person_id' => null,
            'doc_number' => $doc !== '' ? $doc : null,
            'vehicle_id' => null,
            'temp_visit_id' => isset($tv['temp_visit_id']) ? (int) $tv['temp_visit_id'] : null,
            'license_plate' => $plate,
            'status_validated' => $status,
            'allow_entry' => $allow,
            'is_birthday' => false,
            'birth_date' => null,
            'message' => null,
        ];
    }

    /**
     * @param array<string,mixed> $p
     * @return array<string,mixed>
     */
    private function publicPerson(array $p): array
    {
        return [
            'id' => (int) $p['id'],
            'doc_number' => (string) $p['doc_number'],
            'first_name' => $p['first_name'] ?? null,
            'paternal_surname' => $p['paternal_surname'] ?? null,
            'maternal_surname' => $p['maternal_surname'] ?? null,
            'photo_url' => $p['photo_url'] ?? null,
            'birth_date' => $p['birth_date'] ?? null,
            'status_validated' => $p['status_validated'] ?? null,
            'person_type' => $p['person_type'] ?? null,
            'house_id' => isset($p['house_id']) ? (int) $p['house_id'] : null,
        ];
    }

    /**
     * @param array<string,mixed> $v
     * @return array<string,mixed>
     */
    private function publicVehicle(array $v): array
    {
        return [
            'vehicle_id' => (int) $v['vehicle_id'],
            'license_plate' => normalize_license_plate((string) $v['license_plate']),
            'house_id' => isset($v['house_id']) ? (int) $v['house_id'] : null,
            'brand' => $v['brand'] ?? null,
            'model' => $v['model'] ?? null,
            'photo_url' => $v['photo_url'] ?? null,
            'status_validated' => $v['status_validated'] ?? null,
        ];
    }

    /**
     * Casas vinculadas a la persona (persons.house_id + house_members activos).
     *
     * @param array<string,mixed> $personRow
     * @return int[]
     */
    private function personHouseIds(int $personId, array $personRow): array
    {
        $ids = [];
        $h = (int) ($personRow['house_id'] ?? 0);
        if ($h > 0) {
            $ids[] = $h;
        }
        $stmt = $this->pdo->prepare(
            'SELECT DISTINCT house_id FROM house_members WHERE person_id = ? AND COALESCE(is_active, 1) = 1'
        );
        $stmt->execute([$personId]);
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            if (!empty($row['house_id'])) {
                $ids[] = (int) $row['house_id'];
            }
        }

        return array_values(array_unique($ids));
    }

    private function isBirthdayToday($birthDate): bool
    {
        if ($birthDate === null || $birthDate === '') {
            return false;
        }
        $ts = strtotime((string) $birthDate);
        if ($ts === false) {
            return false;
        }
        $m = (int) date('m', $ts);
        $d = (int) date('d', $ts);

        return $m === (int) date('m') && $d === (int) date('d');
    }
}

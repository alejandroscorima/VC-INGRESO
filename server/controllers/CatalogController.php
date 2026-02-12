<?php
/**
 * CatalogController - Áreas, salas, prioridad (desde access_points vc_db).
 * Stubs para collaborator, personal, payment (BDs legacy eliminadas).
 */

namespace Controllers;

require_once __DIR__ . '/../db_connection.php';
require_once __DIR__ . '/../auth_middleware.php';
require_once __DIR__ . '/../utils/Response.php';

use Utils\Response;

class CatalogController
{
    /**
     * GET /api/v1/catalog/areas - Lista de áreas (access_points)
     */
    public static function areas(): void
    {
        requireAuth();
        $pdo = getDbConnection();
        $stmt = $pdo->query("SELECT id, name, type, location, is_active FROM access_points ORDER BY name");
        $rows = $stmt->fetchAll(\PDO::FETCH_OBJ);
        Response::json($rows);
    }

    /**
     * GET /api/v1/catalog/salas - Lista de salas/puntos (access_points)
     */
    public static function salas(): void
    {
        requireAuth();
        $pdo = getDbConnection();
        $stmt = $pdo->query("SELECT id, name, type, location FROM access_points WHERE is_active = 1 ORDER BY name");
        Response::json($stmt->fetchAll(\PDO::FETCH_OBJ));
    }

    /**
     * GET /api/v1/catalog/prioridad - Prioridades (stub)
     */
    public static function prioridad(): void
    {
        requireAuth();
        Response::json([]);
    }

    /**
     * GET /api/v1/catalog/collaborator?user_id= - Stub (bdData eliminado)
     */
    public static function collaboratorByUserId(): void
    {
        requireAuth();
        Response::json(null);
    }

    /**
     * GET /api/v1/catalog/personal?area_id= - Stub
     */
    public static function personal(): void
    {
        requireAuth();
        Response::json([]);
    }

    /**
     * GET /api/v1/catalog/payment-by-client?client_id= - Stub (bdLicense otra BD)
     */
    public static function paymentByClientId(): void
    {
        requireAuth();
        $client_id = $_GET['client_id'] ?? null;
        if ($client_id === null) {
            Response::error('client_id requerido', 400);
            return;
        }
        Response::json(null);
    }

    /** Stubs para entrance (módulos no migrados): devuelven [] */
    public static function activitiesByUser(): void { requireAuth(); Response::json([]); }
    public static function machines(): void { requireAuth(); Response::json([]); }
    public static function machineByRmt(): void { requireAuth(); Response::json(null); }
    public static function problemsByType(): void { requireAuth(); Response::json([]); }
    public static function solutionsByType(): void { requireAuth(); Response::json([]); }
    public static function areasByZone(): void { requireAuth(); Response::json([]); }
    public static function campusByZone(): void { requireAuth(); Response::json([]); }
    public static function incPendientes(): void { requireAuth(); Response::json([]); }
    public static function incProceso(): void { requireAuth(); Response::json([]); }
    public static function incFin(): void { requireAuth(); Response::json([]); }
    public static function campusById(): void { requireAuth(); Response::json(null); }
    public static function campusActiveById(): void { requireAuth(); Response::json(null); }
}

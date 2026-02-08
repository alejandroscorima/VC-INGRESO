
<?php
// CORS se maneja en bdEntrance.php
$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

$sala = $_GET['sala'] ?? '';
$fechaInicio = $_GET['fechaInicio'] ?? '';
$fechaFin = $_GET['fechaFin'] ?? '';
$fechaMes = $_GET['fechaMes'] ?? '';
$dia = $_GET['dia'] ?? '';
$mes = $_GET['mes'] ?? '';

$fecha1 = $_GET['fecha1'] ?? '';
$fecha2 = $_GET['fecha2'] ?? '';
$fecha3 = $_GET['fecha3'] ?? '';
$fecha4 = $_GET['fecha4'] ?? '';
$fecha5 = $_GET['fecha5'] ?? '';

$tables = [
    'PALACIO' => 'visits_palacio',
    'VENEZUELA' => 'visits_venezuela',
    'HUANDOY' => 'visits_huandoy',
    'KANTA' => 'visits_kanta',
    'MEGA' => 'visits_mega',
    'PRO' => 'visits_pro',
    'HUARAL' => 'visits_huaral',
    'GARITA' => 'visits_garita',
    'SAN JUAN I' => 'visits_sji',
    'SAN JUAN II' => 'visits_sjii',
    'SAN JUAN III' => 'visits_sjiii',
    'OLYMPO' => 'visits_olympo',
];

if (!isset($tables[$sala])) {
    http_response_code(400);
    exit(json_encode(['error' => 'Sala no válida']));
}

$table = $tables[$sala];

if ($mes === 'SELECCIONAR') {
    if ($dia === 'SELECCIONAR') {
        $sql = "SELECT age EDAD, count(*) AFORO FROM {$table} WHERE date_entrance >= :inicio AND date_entrance <= :fin GROUP BY EDAD";
        $sentencia = $bd->prepare($sql);
        $sentencia->bindParam(':inicio', $fechaInicio, PDO::PARAM_STR);
        $sentencia->bindParam(':fin', $fechaFin, PDO::PARAM_STR);
    } else {
        $dates = array_values(array_filter([$fecha1, $fecha2, $fecha3, $fecha4, $fecha5], fn($d) => $d !== ''));
        if (empty($dates)) {
            http_response_code(400);
            exit(json_encode(['error' => 'Fechas requeridas']));
        }
        $placeholders = [];
        foreach ($dates as $idx => $d) {
            $placeholders[] = ':d' . $idx;
        }
        $inClause = implode(', ', $placeholders);
        $sql = "SELECT age EDAD, count(*) AFORO FROM {$table} WHERE date_entrance IN ({$inClause}) GROUP BY EDAD";
        $sentencia = $bd->prepare($sql);
        foreach ($dates as $idx => $d) {
            $sentencia->bindValue(':d' . $idx, $d, PDO::PARAM_STR);
        }
    }
} else {
    $fechaLike = "%{$fechaMes}%";
    $sql = "SELECT age EDAD, count(*) AFORO FROM {$table} WHERE date_entrance LIKE :fechaMes GROUP BY EDAD";
    $sentencia = $bd->prepare($sql);
    $sentencia->bindParam(':fechaMes', $fechaLike, PDO::PARAM_STR);
}

$sentencia->execute();
$destacados = $sentencia->fetchAll(PDO::FETCH_OBJ);
echo json_encode($destacados);


<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$date_init=$_GET['date_init'];
$date_end=$_GET['date_end'];

$bd = include_once "vc_db.php";

// Consulta SQL para obtener la cantidad de registros de ingreso por día
$sentencia = $bd->prepare("SELECT DATE(entry_time) as date, COUNT(*) as count
        FROM access_logs
        WHERE status_validated = 'PERMITIDO' -- O cualquier otro filtro que necesites
        GROUP BY DATE(entry_time)
        ORDER BY DATE(entry_time)");

$sentencia -> execute();

$result = $sentencia->fetchAll(PDO::FETCH_OBJ);

$data = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $data[] = [
            'date' => $row['date'],
            'count' => $row['count']
        ];
    }
}


// Devolver los resultados como JSON
echo json_encode($result);
?>

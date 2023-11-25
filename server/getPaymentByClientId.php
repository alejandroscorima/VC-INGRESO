<?php
header("Access-Control-Allow-Origin: *");

try {
    // Obtén el ID del cliente desde la solicitud GET
    $client_id = isset($_GET['client_id']) ? $_GET['client_id'] : null;

    // Validar que se proporcionó el ID del cliente
    if ($client_id === null) {
        throw new Exception("ID de cliente no proporcionado en la solicitud");
    }

    // Incluir el archivo de configuración y conexión a la base de datos
    $bd = include_once "bdLicense.php";

    // Consulta preparada con comparación de fechas
    $sql = "SELECT payment_id, client_id, date_start, date_expire, payment_date FROM payment WHERE client_id = :client_id AND STR_TO_DATE(date_expire, '%Y-%m-%d') >= STR_TO_DATE(:current_date, '%Y-%m-%d')";
    $stmt = $bd->prepare($sql);

    // Asignar valores a los parámetros de la consulta
    $stmt->bindParam(':client_id', $client_id, PDO::PARAM_INT);

    // Obtener la fecha actual en formato 'YYYY-MM-DD'
    $currentDate = date('Y-m-d');
    $stmt->bindParam(':current_date', $currentDate, PDO::PARAM_STR);

    // Ejecutar la consulta
    $stmt->execute();

    // Obtener el resultado de la consulta
    $payment = $stmt->fetchObject();

    // Verificar si se encontraron resultados
    if ($payment === false) {
        throw new Exception("No se encontraron pagos para la empresa con ID: " . $client_id);
    }

    // Devolver el resultado en formato JSON
    echo json_encode($payment);
} catch (PDOException $e) {
    // Capturar errores de PDO
    echo json_encode(['error' => 'Error de conexión: ' . $e->getMessage()]);
} catch (Exception $e) {
    // Capturar otros errores
    echo json_encode(['error' => $e->getMessage()]);
}
?>
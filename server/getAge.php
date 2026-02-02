
<?php
//header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Origin: *");
//header("Access-Control-Allow-Origin: http://192.168.4.250");

$sala=$_GET['sala'];
$fechaInicio=$_GET['fechaInicio'];
$fechaFin=$_GET['fechaFin'];
$fechaMes=$_GET['fechaMes'];
$dia=$_GET['dia'];
$mes=$_GET['mes'];

$fecha1=$_GET['fecha1'];
$fecha2=$_GET['fecha2'];
$fecha3=$_GET['fecha3'];
$fecha4=$_GET['fecha4'];
$fecha5=$_GET['fecha5'];

$bd = include_once "bdEntrance.php";
require_once __DIR__ . '/auth_middleware.php';
requireAuth();

if($sala=='PALACIO'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_palacio WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_palacio WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_palacio WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='VENEZUELA'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_venezuela WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_venezuela WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_venezuela WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='HUANDOY'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_huandoy WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_huandoy WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_huandoy WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='KANTA'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_kanta WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_kanta WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_kanta WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='MEGA'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_mega WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_mega WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_mega WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='PRO'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_pro WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_pro WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_pro WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='HUARAL'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_huaral WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_huaral WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_huaral WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='SAN JUAN I'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sji WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sji WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sji WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='SAN JUAN II'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sjii WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sjii WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sjii WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

if($sala=='SAN JUAN III'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sjiii WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sjiii WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_sjiii WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}


if($sala=='OLYMPO'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_olympo WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY EDAD");
    }
    else{
      $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_olympo WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY EDAD");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT age EDAD, count(*) AFORO FROM visits_olympo WHERE date_entrance like '%".$fechaMes."%' GROUP BY EDAD");
  }
}

//$sentencia = $bd->query("select id, nombre, raza, edad from mascotas");
//$sentencia = $bd->prepare("select * from actas.actas where estado= '".$estado."'");
//where birth_date like '%?%'
$sentencia -> execute();
//[$fecha_cumple]
//$mascotas = $sentencia->fetchAll(PDO::FETCH_OBJ);
$destacados = $sentencia->fetchAll(PDO::FETCH_OBJ);
//echo json_encode($mascotas);
echo json_encode($destacados);

?>

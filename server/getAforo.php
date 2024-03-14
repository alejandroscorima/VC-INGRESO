
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

if(true){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_vc5 WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_vc5 WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_vc5 WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }

}

if($sala=='PALACIO'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_palacio WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_palacio WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_palacio WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }

}

if($sala=='VENEZUELA'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_venezuela WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_venezuela WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_venezuela WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }

}

if($sala=='HUANDOY'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_huandoy WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_huandoy WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_huandoy WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }

}

if($sala=='KANTA'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_kanta WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_kanta WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_kanta WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }

}

if($sala=='MEGA'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_mega WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_mega WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_mega WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }

}

if($sala=='PRO'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_pro WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_pro WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_pro WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }

}

if($sala=='HUARAL'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_huaral WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_huaral WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_huaral WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }
}

if($sala=='SAN JUAN I'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sji WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_sji WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sji WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }
}

if($sala=='SAN JUAN II'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sjii WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_sjii WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sjii WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }
}

if($sala=='SAN JUAN III'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sjiii WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_sjiii WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_sjiii WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
  }
}

if($sala=='OLYMPO'){
  if($mes=='SELECCIONAR'){
    if($dia=='SELECCIONAR'){
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_olympo WHERE date_entrance>='".$fechaInicio."' AND date_entrance<='".$fechaFin."' GROUP BY FECHA HAVING AFORO>0");
    }
    else{
      $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(date_entrance) AFORO FROM visits_olympo WHERE date_entrance='".$fecha1."' OR date_entrance='".$fecha2."' OR date_entrance='".$fecha3."' OR date_entrance='".$fecha4."' OR date_entrance='".$fecha5."' GROUP BY FECHA HAVING AFORO>0");
    }
  }
  else{
    $sentencia = $bd->prepare("SELECT date_entrance FECHA, count(*) AFORO FROM visits_olympo WHERE date_entrance like '%".$fechaMes."%' GROUP BY FECHA HAVING AFORO>0");
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

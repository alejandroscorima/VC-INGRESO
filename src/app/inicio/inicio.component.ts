
import { Component, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ClientesService } from "../clientes.service"
import { Person } from "../person"
import * as XLSX from 'xlsx';

import { User } from '../user';
import { UsersService } from '../users.service';


import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette, } from '@angular/material/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Item } from '../item';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MAT_SORT_HEADER_INTL_PROVIDER_FACTORY } from '@angular/material/sort';
import { Sale } from '../sale';
import { PersonalService } from '../personal.service';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../product';
import { CookiesService } from '../cookies.service';
import { Collaborator } from '../collaborator';
import { AccessPoint } from '../accessPoint';
import { EntranceService } from '../entrance.service';
import { Console } from 'console';
import { initFlowbite } from 'flowbite';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  clientes: Person[] = [
    new Person("none", "Jugador Prueba", '', "none",'','','','','','','','','','','','','','','','','',0,0,'','')
  ];
  


  dias=['SELECCIONAR','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO','DOMINGO'];

  meses=['SELECCIONAR','ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SETIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];


  rowHeightValue;


  salaDisabled;
  mesDisabled;
  diaDisabled;
  fechaDisabled;

  numberClients;
  numberClientsNew;
  numberClientsAverage;
  edadTop;
  distritoTop;
  horaTop;

  sala;

  logoSrc;




  //salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III','OLYMPO'];
  actualUser:User;
  //col:Collaborator;
  //camp:Campus;


  accessPoints: AccessPoint[]=[];
  //salasVision: string[]=['MEGA','PRO','HUARAL'];
  //salasZoom: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','OLYMPO'];
  


  supply_role;
  salaVar:string[];


  salaUsuario:string;
  

  


  
  typeAforo="ComboChart";
  typeAge="PieChart";
  typeMensual="ComboChart";
  typeAddress="BarChart";
  typeFechas="ComboChart";
  typeHours="BarChart";
  typeHoraWargos="ComboChart";


  optionsAforo = {
    hAxis: {
       title: 'Fecha'
    },
    vAxis:{
       title: 'Clientes'
    },
    seriesType: 'bar',
    series: {2: {type: 'line'}}
  };

  optionsAge = {
    hAxis: {
       title: 'Clientes'
    },
    vAxis:{
       title: 'Edad'
    },
    seriesType: 'bar',
    series: {2: {type: 'line'}}
  };

  optionsMensual = {
    hAxis: {
      title: 'Fecha',
    
      textStyle : {
        fontSize: 10 // or the number you want
      },
    },
    vAxis:{
       title: 'Clientes'
    },
    colors:['#E67E22','#27AE60'],
    
    seriesType: 'bar',
    series: {2: {type: 'line'}}
  };

  optionsHoraWargos = {
    hAxis: {
      title: 'Hora',
      textStyle : {
        fontSize: 10 // or the number you want
      },
    },
    vAxis:{
       title: 'Clientes'
    },
    colors:['#0c5670','#E67E22'],
    seriesType: 'bar',
    series: {2: {type: 'line'}}
  };

  optionsFechas = {
    hAxis: {
      title: 'Fecha',
      textStyle : {
        fontSize: 10 // or the number you want
      },
    },
    vAxis:{
       title: 'Clientes'
    },
    seriesType: 'bar',
    series: {2: {type: 'line'}}
  };

  optionsAddress = {
    //width: 300,
    legend: {position: 'none'},
    annotations: {
      textStyle: {
        fontSize:11
      },
   },
    bar: {
      groupWidth: "35%",
      groupHeight: "35%",
    },
    colors:['#884EA0'],
    hAxis: {
      title: 'Clientes',
      textStyle : {
        fontSize: 15 // or the number you want
      },
    },
    vAxis:{
      title: 'Distrito',
      textStyle : {
        fontSize: 14 // or the number you want
      },
    }
  };

  optionsHours = {
    //width: 300,
    legend: {position: 'none'},
    annotations: {
      textStyle: {
      },
    },
    isStacked: true,
    bar: {
      groupWidth: "60%",
      groupHeight: "120%"
    },
    colors:['#2471A3'],
    hAxis: {
      title: 'Clientes',
      textStyle : {
        fontSize: 15 // or the number you want
      },
    },
    vAxis:{
      title: 'Hora',
      textStyle : {
        fontSize: 10 // or the number you want
      },
    }
  };


  aforo=[['',0],
  ['',0],
  ['',0],
  ['',0],
  ['',0]
  ];

  address=[
  ];

  mensual=[
  ];

  horaWargos=[
  ];

  fechas=[
  ];

  hours=[
  ];

  age=[
  ];

  columnsAddress=[
  ];

  columnsMensual=[
  ];

  columnsHoraWargos=[
  ];

  columnsFechas=[
  ];

  columnsHours=[
  ];

  columnsAge=[
  ];

  titleAforo='AFORO';
  titleAge='EDAD';
  titleMensual='MENSUAL';
  titleHoraWargos='OCUPACION POR HORA - WARGOS';
  titleAddress='DISTRITOS';
  titleFechas='DIAS';
  titleHours='HORAS';

  fecha;
  fechaAux;

  fecha_hoy;

  aux;

  fecha1;
  fecha2;
  fecha3;
  fecha4;
  fecha5;

  fechaMes;

  fechaInicio;
  fechaFin;

  dia;
  mes;
  anio;

  fechaCmbBoxStart;
  fechaCmbBoxEnd;
  salaCmbBox: AccessPoint = new AccessPoint('','','','');
  diaCmbBox;
  mesCmbBox;

  dia_aux;
  mes_aux;
  anio_aux;

  mesActual;
  diaActual;


  dataSourceSale: MatTableDataSource<Item>;

  dataSourceProducts: MatTableDataSource<Product>;


  img = new Image();

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  @ViewChild('tuTabla', { static: true }) table: ElementRef;


  constructor(private clientesService: ClientesService, private dialogo: MatDialog,
    private snackBar: MatSnackBar, private router: Router,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private cookies: CookiesService,
    private userService: UsersService,
    private entranceService: EntranceService,

    ) { }



  applyFilterCompra(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceSale.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceSale.paginator) {
      this.dataSourceSale.paginator.firstPage();
    }
  }

  applyFilterProductos(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceProducts.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceProducts.paginator) {
      this.dataSourceProducts.paginator.firstPage();
    }
  }


  

  ngOnInit() {

    initFlowbite();

    if(this.cookies.checkToken('user_id')){
      this.salaDisabled=false;
      this.mesDisabled=false;
      this.diaDisabled=false;
      this.fechaDisabled=false;

      


      this.userService.getUserById(this.cookies.getToken('user_id')).subscribe((user:User)=>{
        
        this.actualUser=user
        console.log(this.actualUser)

        this.entranceService.getAllAccessPoints().subscribe((campList:AccessPoint[])=>{
          console.log(campList)
          if(campList){
            this.accessPoints=campList;
            //this.defineSalas();
            this.fechaCmbBoxStart= new Date();
            this.fechaCmbBoxEnd= new Date();
            this.diaCmbBox='SELECCIONAR';
            this.mesCmbBox='SELECCIONAR';
            this.salaCmbBox=this.accessPoints[0];
        
            this.logoSrc=this.salaCmbBox.image_url;
            
            this.fecha= new Date();
        
            this.dia = this.fecha.getDate();
            this.mes = this.fecha.getMonth()+1;
            this.anio = this.fecha.getFullYear();
        
            if(this.mes<10){
              this.mes = '0'+this.mes;
            }
        
            if(this.dia<10){
              this.dia = '0'+this.dia;
            }
        
            this.fecha_hoy = this.anio+'-'+this.mes+'-'+this.dia;
        
            this.fecha1 = '';
            this.fecha2 = '';
            this.fecha3 = '';
            this.fecha4 = '';
            this.fecha5 = '';
            this.fechaInicio = this.fecha_hoy;
            this.fechaFin = this.fecha_hoy;
            this.fechaMes = this.anio+'-'+this.mes+'-';
        
            this.mesActual = this.meses[this.fecha.getMonth()];
            this.diaActual = String(this.fecha.getDate());
        
            this.clientesService.getAforoStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((res:any[])=>{
        
              this.aforo=[[String(res[0]['FECHA']),parseInt(res[0]['AFORO']),0]]
      
      
              this.clientesService.getAforoStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((res2:any[])=>{
      
                this.fechas=[];
      
                this.columnsFechas=['Fecha','Total',{ role: 'annotation' },'Nuevos',{ role: 'annotation' }];
      
                this.numberClients=0;
                this.numberClientsNew=0;
      
                for(var i=0,l=res.length;i<l;i++){
                  if(res[i]['FECHA']!='S/N' && res[i]['FECHA']!='--'){
      
                    var ele=[];
                    var flag1=false;
      
                    ele.push(String(res[i]['FECHA']));
                    ele.push(parseInt(res[i]['AFORO']));
                    ele.push(String(res[i]['AFORO']));
      
                    this.numberClients+=parseInt(res[i]['AFORO']);
                    this.numberClientsAverage=(this.numberClients/res.length).toFixed(0);
      
                    if(res2.length>0){
                      res2.forEach(rd2=>{
                        if(rd2['FECHA']==res[i]['FECHA']){
                          flag1=true;
                          ele.push(parseInt(rd2['AFORO']));
                          ele.push(String(rd2['AFORO']));
      
                          this.numberClientsNew+=parseInt(rd2['AFORO']);
                        }
                      })
                      if(!flag1){
                        ele.push(0);
                        ele.push('0');
                      }
                    }
                    else{
                      ele.push(0);
                      ele.push('0');
                    }
                    this.fechas.push(ele);
                  }
                }
      
                this.clientesService.getAddressStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((a:any[])=>{
      
                  a.sort(function(m,n){return n['CANTIDAD'] - m['CANTIDAD'];});
      
                  this.distritoTop=a[0]['DISTRITO'];
      
                  var ndist=0;
      
                  a.forEach(ad=>{
                    if(ad['DISTRITO']!='S/N' && ad['DISTRITO']!='--' && ad['DISTRITO']!='SN'&&ndist<12){
                      var el =[];
      
                      this.columnsAddress=['Dir','Cantidad',{ role: 'annotation' }]
      
                      el.push(String(ad['CANTIDAD']));
                      el.push(parseInt(ad['CANTIDAD']));
                      el.push(ad['DISTRITO']);
                      this.address.push(el);
                      ndist+=1;
                    }
                  })
      
                  this.clientesService.getTotalMonth(this.salaCmbBox.name,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4).subscribe((b:any[])=>{
      
                    this.clientesService.getTotalMonthNew(this.salaCmbBox.name,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4).subscribe((b2:any[])=>{
      
                      this.mensual=[];
      
                      this.columnsMensual=['Fecha','Total',{ role: 'annotation' },'Nuevos',{ role: 'annotation' }]
      
                      for(var i=0, l=b.length;i<l;i++){
                        if(b[i]['FECHA']!='S/N' && b[i]['FECHA']!='--'){
                          var el =[];
                          var flag2=false;
                          el.push(b[i]['FECHA']);
                          el.push(parseInt(b[i]['AFORO']));
                          el.push(String(b[i]['AFORO']));
      
                          if(b2.length>0){
                            b2.forEach(ad2=>{
                              if(ad2['FECHA']==b[i]['FECHA']){
                                flag2=true;
                                el.push(parseInt(ad2['AFORO']));
                                el.push(String(ad2['AFORO']));
                              }
                            })
                            if(!flag2){
                              el.push(0);
                              el.push('0');
                            }
                          }
                          else{
                            el.push(0);
                            el.push('0');
                          }
                          this.mensual.push(el);
                        }
                      }
      
                      this.hours=[];
      
                      this.clientesService.getHourStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((resHours:any[])=>{
                        var horasString=['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
                        this.columnsHours=['Hora','Cantidad',{ role: 'annotation' }];
                        var cantidadXHoras=[24];
                        if(resHours.length>0){
                          var cantHourAux=0;
                          for(var i=0;i<24;i++){
                            var elem=[];
                            var contador=0;
                            resHours.forEach(hItem=>{
                              if(String(hItem['HORA']).substring(0,2)==horasString[i]){
                                contador+=parseInt(hItem['AFORO']);
                              }
                            })
                            elem.push(horasString[i]+':00');
                            elem.push(contador);
                            elem.push(String(contador));
      
                            cantidadXHoras[i]=contador;
                            if(contador>=cantHourAux){
                              cantHourAux=contador;
                              if(i<23){
                                this.horaTop=horasString[i]+':00 a '+horasString[i+1]+':00';
                              }
                              else{
                                this.horaTop=horasString[i]+':00 a 24:00';
                              }
                            }
                            this.hours.push(elem);
                          }
                        }
      
                        this.clientesService.getAgeStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((resAge:any[])=>{
                          if(resAge.length>0){
                            this.columnsAge=['Edad','Cantidad',{ role: 'annotation' }];
                            var count18a30 = 0;
                            var count30a40 = 0;
                            var count40a50 = 0;
                            var count50a60 = 0;
                            var count60amas = 0;
      
                            var cantEdad=0;
      
                            resAge.forEach(clientAge=>{
      
                              if(parseInt(clientAge['EDAD'])<=30){
                                count18a30+=parseInt(clientAge['AFORO']);
                                if(count18a30>cantEdad){
                                  cantEdad=count18a30;
                                  this.edadTop='18 a 30';
                                }
                              }
                              else if(parseInt(clientAge['EDAD'])<=40){
                                count30a40+=parseInt(clientAge['AFORO']);
                                if(count30a40>cantEdad){
                                  cantEdad=count30a40;
                                  this.edadTop='31 a 40';
                                }
                              }
                              else if(parseInt(clientAge['EDAD'])<=50){
                                count40a50+=parseInt(clientAge['AFORO']);
                                if(count40a50>cantEdad){
                                  cantEdad=count40a50;
                                  this.edadTop='41 a 50';
                                }
                              }
                              else if(parseInt(clientAge['EDAD'])<=60){
                                count50a60+=parseInt(clientAge['AFORO']);
                                if(count50a60>cantEdad){
                                  cantEdad=count50a60;
                                  this.edadTop='51 a 60';
                                }
                              }
                              else{
                                count60amas+=parseInt(clientAge['AFORO']);
                                if(count60amas>cantEdad){
                                  cantEdad=count60amas;
                                  this.edadTop='60+';
                                }
                              }
      
                            })
      
                            var elem=[];
      
                            elem.push('18 a 30');
                            elem.push(count18a30);
                            elem.push(String(count18a30));
                            this.age.push(elem);
      
                            elem=[];
                            elem.push('31 a 40');
                            elem.push(count30a40);
                            elem.push(String(count30a40));
                            this.age.push(elem);
      
                            elem=[];
                            elem.push('41 a 50');
                            elem.push(count40a50);
                            elem.push(String(count40a50));
                            this.age.push(elem);
      
                            elem=[];
                            elem.push('51 a 60');
                            elem.push(count50a60);
                            elem.push(String(count50a60));
                            this.age.push(elem);
      
                            elem=[];
                            elem.push('61 a más');
                            elem.push(count60amas);
                            elem.push(String(count60amas));
                            this.age.push(elem);
      
      
                          }
                        })
      
      
                      })
      
                    })
                  })
                })
              })
        
            })
          }


        })


      });

    }
    else{
      this.router.navigateByUrl('/login');
    }

  }
  
 exportExel() {
  console.log('Exporting data...');
  const workbook: XLSX.WorkBook = XLSX.utils.book_new();
  const separator = ',';

 // Agregar hojas de cálculo con datos
  
 // Dividir las cadenas en las columnas 'Age'
    const ageData = this.age.map(row => row.map(cell => (typeof cell === 'string' ? cell.split(separator) : cell)));
    this.addSheet(workbook, 'Age', ageData, this.columnsAge);   

// Dividir las cadenas en las columnas 'Fechas'
    const fechasData = this.fechas.map(row => row.map(cell => (typeof cell === 'string' ? cell.split(separator) : cell)));
    this.addSheet(workbook, 'Fechas', fechasData, this.columnsFechas);

// Invertir la dirección de las columnas 'Address'
    this.columnsAddress.reverse();

// Dividir las cadenas en las columnas 'Address'
    const addressData = this.address.map(row => row.map(cell => (typeof cell === 'string' ? cell.split(separator) : cell)));
    this.addSheet(workbook, 'Address', addressData, this.columnsAddress);

// Dividir las cadenas en las columnas 'Hours'
   const hoursData = this.hours.map(row => row.map(cell => (typeof cell === 'string' ? cell.split(separator) : cell)));
   this.addSheet(workbook, 'Hours', hoursData, this.columnsHours);

// Dividir las cadenas en las columnas 'Mensual'
   const mensualData = this.mensual.map(row => row.map(cell => (typeof cell === 'string' ? cell.split(separator) : cell)));
   this.addSheet(workbook, 'Mensual', mensualData, this.columnsMensual);

 // Imprimir los resultados después de la división
      console.log('Age', ageData, this.columnsAge);
      console.log('Fechas', fechasData, this.columnsFechas);
      console.log('Address', addressData, this.columnsAddress);
      console.log('Hours', hoursData, this.columnsHours);
      console.log('Mensual', mensualData, this.columnsMensual);

 // Descargar el archivo Excel
    XLSX.writeFile(workbook, 'exported-data.xlsx');

 }
// Crear una hoja de cálculo con datos
addSheet(workbook: XLSX.WorkBook, sheetName: string, data: any, columns: any): void {
  const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([columns, ...data]);
  XLSX.utils.book_append_sheet(workbook, ws, sheetName);
}






  
  
  
  

  
  defineSalas(){

    //this.userType= this.actualUser.entrance_role;
/*     console.log(this.actualUser.entrance_role);
      if(this.actualUser.entrance_role=="ADMINISTRADOR"){
        console.log(this.actualUser.entrance_role);
        this.salaVar= this.salas;
      }
      else {
        this.salaUsuario= this.camp.name.toString();
        console.log(this.camp.name);
       // console.log(this.salaUsuario)
          if(this.camp.name=='OFICINA VISION'){

            this.salaVar=this.salasVision;
            this.salaCmbBox=this.salaVar[0];
            this.salaChange(this.salaCmbBox);
          
          }
          else if(this.camp.name=='OFICINA SUN'){


            this.salaVar=this.salasZoom;
            this.salaCmbBox=this.salaVar[0];
            this.salaChange(this.salaCmbBox);


          }
          else if( this.camp.name!='OFICINA VISION' && this.camp.name!='OFICINA ZOOM'){
            this.salaVar=[];
        
            this.salaVar.push(this.camp.name)
            this.salaCmbBox=this.camp.name;
            this.salaChange(this.salaCmbBox);
            console.log(this.salaVar)
          }
      //verificar en que oficina o sala está asignado.

      //vision:MEGA, Pro, Huaral.
      //zoom: PALACIO, VENEZUELA,KANTA,HUANDOY,OLYMPO

    } */
  }
  salaChange(sala: AccessPoint){
    this.salaCmbBox=sala;
    this.getStats();
  }

  mesChange(mes: string){
    this.diaCmbBox='SELECCIONAR';
    this.mesCmbBox=mes;
    if(this.mesCmbBox=='ENERO'){
      this.fechaMes=this.anio+'-01-';
    }
    if(this.mesCmbBox=='FEBRERO'){
      this.fechaMes=this.anio+'-02-';
    }
    if(this.mesCmbBox=='MARZO'){
      this.fechaMes=this.anio+'-03-';
    }
    if(this.mesCmbBox=='ABRIL'){
      this.fechaMes=this.anio+'-04-';
    }
    if(this.mesCmbBox=='MAYO'){
      this.fechaMes=this.anio+'-05-';
    }
    if(this.mesCmbBox=='JUNIO'){
      this.fechaMes=this.anio+'-06-';
    }
    if(this.mesCmbBox=='JULIO'){
      this.fechaMes=this.anio+'-07-';
    }
    if(this.mesCmbBox=='AGOSTO'){
      this.fechaMes=this.anio+'-08-';
    }
    if(this.mesCmbBox=='SETIEMBRE'){
      this.fechaMes=this.anio+'-09-';
    }
    if(this.mesCmbBox=='OCTUBRE'){
      this.fechaMes=this.anio+'-10-';
    }
    if(this.mesCmbBox=='NOVIEMBRE'){
      this.fechaMes=this.anio+'-11-';
    }
    if(this.mesCmbBox=='DICIEMBRE'){
      this.fechaMes=this.anio+'-12-';
    }

    this.getStats();
  }

  diaChange(dia: string){
    this.mesCmbBox='SELECCIONAR';
    this.diaCmbBox=dia;
    var diaInd;
    if(this.diaCmbBox=='LUNES'){
      diaInd=1;
    }
    if(this.diaCmbBox=='MARTES'){
      diaInd=2;
    }
    if(this.diaCmbBox=='MIERCOLES'){
      diaInd=3;
    }
    if(this.diaCmbBox=='JUEVES'){
      diaInd=4;
    }
    if(this.diaCmbBox=='VIERNES'){
      diaInd=5;
    }
    if(this.diaCmbBox=='SABADO'){
      diaInd=6;
    }
    if(this.diaCmbBox=='DOMINGO'){
      diaInd=0;
    }
    this.fechaAux=this.fechaPorDia(diaInd);

    this.dia_aux = this.fechaAux.getDate();
    this.mes_aux = this.fechaAux.getMonth()+1;
    this.anio_aux = this.fechaAux.getFullYear();

    if(this.mes_aux<10){
      this.mes_aux = '0'+this.mes_aux;
    }

    if(this.dia_aux<10){
      this.dia_aux = '0'+this.dia_aux;
    }

    this.fecha1 = this.anio_aux+'-'+this.mes_aux+'-'+this.dia_aux;

    this.fechaMes='-'+this.mes_aux+'-';

    this.fechaAux.setDate(this.fechaAux.getDate() - 7);

    this.dia_aux = this.fechaAux.getDate();
    this.mes_aux = this.fechaAux.getMonth()+1;
    this.anio_aux = this.fechaAux.getFullYear();

    if(this.mes_aux<10){
      this.mes_aux = '0'+this.mes_aux;
    }

    if(this.dia_aux<10){
      this.dia_aux = '0'+this.dia_aux;
    }

    this.fecha2 = this.anio_aux+'-'+this.mes_aux+'-'+this.dia_aux;

    this.fechaAux.setDate(this.fechaAux.getDate() - 7);

    this.dia_aux = this.fechaAux.getDate();
    this.mes_aux = this.fechaAux.getMonth()+1;
    this.anio_aux = this.fechaAux.getFullYear();

    if(this.mes_aux<10){
      this.mes_aux = '0'+this.mes_aux;
    }

    if(this.dia_aux<10){
      this.dia_aux = '0'+this.dia_aux;
    }

    this.fecha3 = this.anio_aux+'-'+this.mes_aux+'-'+this.dia_aux;

    this.fechaAux.setDate(this.fechaAux.getDate() - 7);

    this.dia_aux = this.fechaAux.getDate();
    this.mes_aux = this.fechaAux.getMonth()+1;
    this.anio_aux = this.fechaAux.getFullYear();

    if(this.mes_aux<10){
      this.mes_aux = '0'+this.mes_aux;
    }

    if(this.dia_aux<10){
      this.dia_aux = '0'+this.dia_aux;
    }

    this.fecha4 = this.anio_aux+'-'+this.mes_aux+'-'+this.dia_aux;

    this.getStats();
  }

  fechaChange(){
    this.diaCmbBox='SELECCIONAR';
    this.mesCmbBox='SELECCIONAR';

    if(this.fechaCmbBoxEnd){
      this.fechaAux=this.fechaCmbBoxStart;

      this.dia_aux = this.fechaAux.getDate();
      this.mes_aux = this.fechaAux.getMonth()+1;
      this.anio_aux = this.fechaAux.getFullYear();

      if(this.mes_aux<10){
        this.mes_aux = '0'+this.mes_aux;
      }

      if(this.dia_aux<10){
        this.dia_aux = '0'+this.dia_aux;
      }

      this.fechaInicio = this.anio_aux+'-'+this.mes_aux+'-'+this.dia_aux;

      var fechaAux2;
      var dia_aux2;
      var mes_aux2;
      var anio_aux2;

      fechaAux2=this.fechaCmbBoxEnd;

      dia_aux2 = fechaAux2.getDate();
      mes_aux2 = fechaAux2.getMonth()+1;
      anio_aux2 = fechaAux2.getFullYear();

      if(mes_aux2<10){
        mes_aux2 = '0'+mes_aux2;
      }

      if(dia_aux2<10){
        dia_aux2 = '0'+dia_aux2;
      }

      this.fechaFin = anio_aux2+'-'+mes_aux2+'-'+dia_aux2;

      this.fechaMes=anio_aux2+'-'+mes_aux2+'-';

      this.getStats();
    }


  }

  getStats(){
    this.aforo=[];
    this.fechas=[];
    this.address=[];
    this.mensual=[];

    this.logoSrc="assets/logo"+this.salaCmbBox+".png"

    this.clientesService.getAforoStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((res:any[])=>{
      if(res.length>0){

        this.aforo=[[String(res[0]['FECHA']),parseInt(res[0]['AFORO']),0]];

        this.fechas=[];

        this.clientesService.getAforoStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((res2:any[])=>{

          this.columnsFechas=['Fecha','Total',{role:'annotation'},'Nuevos',{role:'annotation'}]

          this.numberClients=0;
          this.numberClientsNew=0;

          for(var i=0,l=res.length;i<l;i++){
            var flag3=false;
            var ele=[];
            ele.push(String(res[i]['FECHA']));
            ele.push(parseInt(res[i]['AFORO']));
            ele.push(String(res[i]['AFORO']));

            this.numberClients+=parseInt(res[i]['AFORO']);
            this.numberClientsAverage=(this.numberClients/res.length).toFixed(0);

            if(res2.length>0){
              res2.forEach(rd=>{
                if(rd['FECHA']==res[i]['FECHA']){
                  flag3=true;
                  ele.push(parseInt(rd['AFORO']));
                  ele.push(String(rd['AFORO']))

                  this.numberClientsNew+=parseInt(rd['AFORO']);

                }
              })
              if(!flag3){
                ele.push(0);
                ele.push('0');
              }
            }
            else{
              ele.push(0);
              ele.push('0');
            }
            this.fechas.push(ele);
          }

        })

      }
      else[
        this.aforo=[['No hay datos',0]],
        this.fechas=[['No hay datos',0]]
      ]

      this.clientesService.getAddressStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((a:any[])=>{
        if(a.length>0){
          this.address=[];
          a.sort(function(m,n){return n['CANTIDAD'] - m['CANTIDAD'];});

          this.distritoTop=a[0]['DISTRITO'];

          var ndist=0;

          a.forEach(ad=>{
            if(ad['DISTRITO']!='S/N' && ad['DISTRITO']!='--' && ad['DISTRITO']!='SN'&&ndist<12){
              var el =[];

              this.columnsAddress=['Dir','Cantidad',{ role: 'annotation' }]


              el.push(String(ad['CANTIDAD']));
              el.push(parseInt(ad['CANTIDAD']));
              el.push(ad['DISTRITO']);
              this.address.push(el);
              ndist+=1;
            }
          })
        }

        else{
          this.address=[['No hay datos',0,'SN']]
        }


        this.clientesService.getTotalMonth(this.salaCmbBox.name,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4).subscribe((b:any[])=>{
          if(b.length>0){
            this.mensual=[];

            this.clientesService.getTotalMonthNew(this.salaCmbBox.name,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4).subscribe((b2:any[])=>{

              this.columnsMensual=['Fecha','Total',{ role: 'annotation' },'Nuevos',{role:'annotation'}];

              for(var i=0, l=b.length;i<l;i++){
                var el =[];
                var flag4=false;
                el.push(b[i]['FECHA']);
                el.push(parseInt(b[i]['AFORO']));
                el.push(String(b[i]['AFORO']));
                if(b2.length>0){
                  b2.forEach(ad=>{
                    if(ad['FECHA']==b[i]['FECHA']){
                      flag4=true;
                      el.push(parseInt(ad['AFORO']));
                      el.push(String(ad['AFORO']));
                    }
                  })
                  if(!flag4){
                    el.push(0);
                    el.push('0');
                  }
                }
                else{
                  el.push(0);
                  el.push('0');
                }
                this.mensual.push(el);
              }

            })

          }
          else{
            this.mensual=[['No hay datos',0]]
          }

          this.hours=[];

          this.clientesService.getHourStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((resHours:any[])=>{
            var horasString=['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
            this.columnsHours=['Hora','Cantidad',{ role: 'annotation' }];
            var cantidadXHoras=[24];
            if(resHours.length>0){

              var cantHourAux=0;

              for(var i=0;i<24;i++){
                var elem=[];
                var contador=0;
                resHours.forEach(hItem=>{
                  if(String(hItem['HORA']).substring(0,2)==horasString[i]){
                    contador+=parseInt(hItem['AFORO']);
                  }
                })
                elem.push(horasString[i]+':00');
                elem.push(contador);
                elem.push(String(contador));
                cantidadXHoras[i]=contador;

                if(contador>=cantHourAux){
                  cantHourAux=contador;
                  if(i<23){
                    this.horaTop=horasString[i]+':00 a '+horasString[i+1]+':00';
                  }
                  else{
                    this.horaTop=horasString[i]+':00 a 24:00';
                  }
                }

                this.hours.push(elem);
              }
            }

            this.age=[];

            this.clientesService.getAgeStat(this.salaCmbBox.name,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe((resAge:any[])=>{
              if(resAge.length>0){
                this.columnsAge=['Edad','Cantidad',{ role: 'annotation' }];
                var count18a30 = 0;
                var count30a40 = 0;
                var count40a50 = 0;
                var count50a60 = 0;
                var count60amas = 0;

                var cantEdad=0;


                resAge.forEach(clientAge=>{

                  if(parseInt(clientAge['EDAD'])<=30){
                    count18a30+=parseInt(clientAge['AFORO']);
                    if(count18a30>cantEdad){
                      cantEdad=count18a30;
                      this.edadTop='18 a 30';
                    }
                  }
                  else if(parseInt(clientAge['EDAD'])<=40){
                    count30a40+=parseInt(clientAge['AFORO']);
                    if(count30a40>cantEdad){
                      cantEdad=count30a40;
                      this.edadTop='31 a 40';
                    }
                  }
                  else if(parseInt(clientAge['EDAD'])<=50){
                    count40a50+=parseInt(clientAge['AFORO']);
                    if(count40a50>cantEdad){
                      cantEdad=count40a50;
                      this.edadTop='41 a 50';
                    }
                  }
                  else if(parseInt(clientAge['EDAD'])<=60){
                    count50a60+=parseInt(clientAge['AFORO']);
                    if(count50a60>cantEdad){
                      cantEdad=count50a60;
                      this.edadTop='51 a 60';
                    }
                  }
                  else{
                    count60amas+=parseInt(clientAge['AFORO']);
                    if(count60amas>cantEdad){
                      cantEdad=count60amas;
                      this.edadTop='60+';
                    }
                  }
                })

                var elem=[];

                elem.push('18 a 30');
                elem.push(count18a30);
                elem.push(String(count18a30));
                this.age.push(elem);

                elem=[];
                elem.push('31 a 40');
                elem.push(count30a40);
                elem.push(String(count30a40));
                this.age.push(elem);

                elem=[];
                elem.push('41 a 50');
                elem.push(count40a50);
                elem.push(String(count40a50));
                this.age.push(elem);

                elem=[];
                elem.push('51 a 60');
                elem.push(count50a60);
                elem.push(String(count50a60));
                this.age.push(elem);

                elem=[];
                elem.push('61 a más');
                elem.push(count60amas);
                elem.push(String(count60amas));
                this.age.push(elem);


/*                 this.clientesService.getHourWargos(this.salaCmbBox,this.fechaInicio,this.fechaFin,'','','','','','','','').subscribe((ans:any[])=>{
                  if(ans.length>0){
                    var contHW1;
                    var contHW2;
                    var horaHWStr;
                    var flagAdd;
                    if(ans.length>48){
                      ans.splice(0,48);
                    }


                    var ultimoElem = ans[ans.length-1]['fechaHora'];

                    var fechaHoraArrayAux = String(ultimoElem).split(' ');
                    var horaWargosArrayAux = String(fechaHoraArrayAux[1]).split(':');
                    var horaWargosNumAux = parseInt(horaWargosArrayAux[0]);
                    var minWargosNumAux = parseInt(horaWargosArrayAux[1]);
                    if(horaWargosNumAux==8&&minWargosNumAux==0){
                      ans.splice(ans.length-1-24,25);
                    }


                    console.log(ans);
                    this.horaWargos=[];
                    this.columnsHoraWargos=['Hora','Total',{ role: 'annotation' },'Logueados',{ role: 'annotation' }]
                    for(var t=0; t<24; t++){
                      contHW1=0;
                      contHW2=0;
                      var elemHW =[];
                      flagAdd=false;
                      ans.forEach(ansItem=>{

                        var fechaHoraArray = String(ansItem['fechaHora']).split(' ');
                        var horaWargosArray = String(fechaHoraArray[1]).split(':');
                        var horaWargosNum = parseInt(horaWargosArray[0]);
                        var minWargosNum = parseInt(horaWargosArray[1]);
                        if(t==horaWargosNum&&minWargosNum==0){
                          horaHWStr= horaWargosArray[0]+':'+horaWargosArray[1];
                          console.log(horaWargosArray[0]+':'+horaWargosArray[1]);

                          contHW1+=parseInt(ansItem['played']);
                          contHW2+=parseInt(ansItem['logged']);
                          flagAdd=true;
                        }

                      })
                      if(flagAdd){
                        elemHW.push(horaHWStr);
                        elemHW.push(contHW1);
                        elemHW.push(String(contHW1));
                        elemHW.push(contHW2);
                        elemHW.push(String(contHW2));
                        this.horaWargos.push(elemHW);
                      }
                    }
                  }
                }) */
              }

/*               this.clientesService.getHourReal(this.salaCmbBox,this.fechaInicio,this.fechaFin,this.fechaMes,this.mesCmbBox,this.diaCmbBox,this.fecha1,this.fecha2,this.fecha3,this.fecha4,this.fecha5).subscribe(r=>{
                console.log(r);
              }) */
            })
          })

        })
      })
    })

  }

  fechaPorDia(dia_index:number):Date{
    var dias1;
    var fecha_actualisima= new Date();
    var dia_act=fecha_actualisima.getDate();
    var mes_act=fecha_actualisima.getMonth();
    var anio_act=fecha_actualisima.getFullYear();
    var fecha1 = new Date(anio_act,mes_act,dia_act);
    var diapararestar=fecha1.getUTCDay();
    if(diapararestar<dia_index){
        dias1=(-diapararestar-(dia_index+1));
    }else{
        dias1=(diapararestar-dia_index)*(-1);
    }

    fecha1.setDate(fecha1.getDate() + dias1);
    return fecha1;
  }

}

@Component({
  selector: 'dialog-revalidar',
  templateUrl: 'dialog-revalidar.html',
  styleUrls: ['./inicio.component.css']
})
export class DialogRevalidar implements OnInit {


  btnRevalidarEnabled ;


  fecha;

  anio;
  mes;
  dia;
  diaSemana;
  hora;
  mesIndex;




  img = new Image();

  constructor(
    public dialogRef: MatDialogRef<DialogRevalidar>,
    @Inject(MAT_DIALOG_DATA) public data:Product,
    private fb: FormBuilder,
    private personalService: PersonalService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {

    this.btnRevalidarEnabled=true;

  }

  btnRevalidar(){
    this.dialogRef.close(this.data);
  }

  btnRechazar(){
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}


@Component({
  selector: 'dialog-select-sala',
  templateUrl: 'dialog-select-sala.html',
  styleUrls: ['./inicio.component.css']
})
export class DialogSelectSala implements OnInit {


  img = new Image();

  constructor(
    public dialogRef: MatDialogRef<DialogRevalidar>,
    @Inject(MAT_DIALOG_DATA) public data:String,
    private fb: FormBuilder,
    private personalService: PersonalService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {

  }

  btnMega(){
    this.data = 'mega';
    this.dialogRef.close(this.data);
  }

  btnPro(){
    this.data = 'pro';
    this.dialogRef.close(this.data);
  }

  btnHuaral(){
    this.data = 'huaral';
    this.dialogRef.close(this.data);
  }

  btnOlympo(){
    this.data = 'huaral';
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}

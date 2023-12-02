
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientesService } from "../clientes.service"
import { Cliente } from '../cliente';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl } from '@angular/forms';
import { Sale } from '../sale';
import { PersonalService } from '../personal.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Item } from '../item';
import { Product } from '../product';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-generar-acta',
  templateUrl: './generar-acta.component.html',
  styleUrls: ['./generar-acta.component.css']
})
export class GenerarActaComponent implements OnInit {


  meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Setiembre','Octubre','Noviembre','Diciembre'];
  dias=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  diasSorteo=['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  centenas=['','CIEN','DOSCIENTOS','TRESCIENTOS','CUATROCIENTOS','QUINIENTOS','SEISCIENTOS','SETECIENTOS','OCHOCIENTOS','NOVECIENTOS'];
  decenas=['','DIEZ','VEINTE','TREINTA','CUARENTA','CINCUENTA','SESENTA','SETENTA','OCHENTA','NOVENTA'];

  nombreSala;


  fecha;

  anio;
  mes;
  dia;
  diaSemana;
  hora;
  mesIndex;

  fechaSorteo;
  horaSorteo;
  horaLongSorteo;
  direccionSorteo;
  nombreSorteo;
  nombreDeSorteo;
  premioSorteo;
  premioLongSorteo: string;
  doc_number: string;
  cupon_number: string;
  fechaLongSorteo;
  sala;
  admin_nombre;
  admin_doc;
  adj_nombre;
  adj_doc;
  seguridad_nombre;
  estado;

  direccionInput;
  horaInput;
  nombreInput;
  nombreSorteoInput;
  premioInput;

  linkLogo:string;


  cliente: Cliente = new Cliente('','','','','','','','','','','','','','','');

  doc = new jsPDF();
  img = new Image();

  letterSize;
  tituloSala;
  posTituloSala;
  direccionSala;
  posDireccionSala;



  constructor(private route: ActivatedRoute,
    private router: Router, private personalService: PersonalService, private clientesService: ClientesService,
    private snackBar: MatSnackBar, public location: Location,
    private toastr: ToastrService) { }

  ngOnInit() {
    this.direccionInput=true;
    this.horaInput=true;
    this.nombreInput=true;
    this.nombreSorteoInput=true;
    this.premioInput=true;
    this.sala = this.route.snapshot.paramMap.get('sala');
    this.nombreSala = String(this.sala).toUpperCase();
    this.direccionSala = '';
    this.nombreSorteo = '';
    this.direccionSorteo = '';
    this.nombreDeSorteo = '';
    this.premioSorteo = '';
    this.doc_number = '';
    this.cupon_number = '';
    this.fecha = new Date();
    this.anio = this.fecha.getFullYear();
    this.mesIndex = this.fecha.getMonth();
    this.mes = this.fecha.getMonth()+1;
    this.dia = this.fecha.getDate();
    this.diaSemana = this.fecha.getDay();
    this.hora = this.fecha.getHours();

    this.premioLongSorteo = '';

    this.admin_nombre = '';
    this.admin_doc = '';
    this.adj_nombre = '';
    this.adj_doc = '';
    this.seguridad_nombre = '';
    this.estado = '';

    if(this.sala=='mega'){
      this.linkLogo = 'assets/logoMega.png';
      this.tituloSala = 'MEGA GAMING';
      this.posTituloSala = 74;
      this.direccionSala = 'Av. Alfredo Mendiola 3503 Urb. Panam. Norte Los Olivos';
    }
    if(this.sala=='pro'){
      this.linkLogo = 'assets/logoPro.png';
      this.tituloSala = 'IMPERIO PRO I';
      this.posTituloSala = 72;
      this.direccionSala = 'Av. Alfredo Mendiola 7895 Urb. Pro Los Olivos';
    }
    if(this.sala=='huaral'){
      this.linkLogo = 'assets/logoHuaral.png';
      this.tituloSala = 'IMPERIO HUARAL';
      this.posTituloSala = 69;
      this.direccionSala = 'Calle Derecha 660 - Huaral - Lima';
    }



    var complementoHora='';

    if(this.hora>=12){
      complementoHora='p.m.'
    }
    else{
      complementoHora='a.m.'
    }

/*     if(this.hora>12){
      this.hora=this.hora-12;
    } */


    if(this.mes<10){
      this.mes = '0'+this.mes;
    }
    if(this.dia<10){
      this.dia = '0'+this.dia;
    }
    if(this.hora<10){
      this.hora = '0'+this.hora;
    }

    this.fechaSorteo=this.anio+'-'+this.mes+'-'+this.dia;
    this.horaLongSorteo=this.hora+':00:00 '+complementoHora;
    this.horaSorteo=this.hora+':00:00';


/*     this.aforoService.getSorteo(this.sala,this.diasSorteo[this.diaSemana],this.horaSorteo).subscribe((s:Sorteo)=>{
      if(!s){
        this.premioSorteo='';
        this.toastr.info('No se encontro sorteo finalizado ahora','',{progressBar:true});
      }
      else{
        this.nombreDeSorteo=s.nombre;
        this.premioSorteo=String(s.monto);
        if(s.nombre!=''){
          this.toastr.success(this.nombreDeSorteo,'',{progressBar:true});
        }
        else{
          this.toastr.info('No se encontro sorteo finalizado ahora','',{progressBar:true});
        }

      }

    }); */

    //this.fecha = new FormControl({value: new Date(), disabled:true});
    //this.personalService.getPersonales(this.sala).subscribe((lista:Personal[]) => {
      /*       this.snackBar.open('Cliente actualizado', undefined, {
              duration: 1500,
            }); */

            //this.volver();

    //});
    //let idCliente = this.route.snapshot.paramMap.get("id");
    //this.mascotasService.getCliente(idCliente, "",'').subscribe((cliente: Cliente) => this.cliente = cliente)
  }

  volver() {
    this.router.navigate(['/']);
  }

  onSubmit() {

  }

  changeNombreInput(){
    this.nombreInput=!this.nombreInput;
  }

  changeDireccionInput(){
    this.direccionInput=!this.direccionInput;
  }

  changeHoraInput(){
    this.horaInput=!this.horaInput;
  }

  changeSorteoNombreInput(){
    this.nombreSorteoInput=!this.nombreSorteoInput;
  }

  changePremioInput(){
    this.premioInput=!this.premioInput;
  }


  buscarCliente(){
    this.doc_number=this.doc_number.trim();
    if(this.doc_number != ''){
      this.clientesService.getClient(this.doc_number).subscribe(respuesta => {
        if(respuesta['success']){
          this.cliente.doc_number = respuesta['data']['numero'];
          this.cliente.client_name = respuesta['data']['nombre_completo'];
          this.cliente.address = respuesta['data']['direccion'];
          this.cliente.distrito = respuesta['data']['distrito'];
          this.cliente.provincia = respuesta['data']['provincia'];
          this.cliente.departamento = respuesta['data']['departamento'];
          this.direccionSorteo = this.cliente.address + ' - ' + this.cliente.distrito + ' - ' + this.cliente.provincia + ' - ' + this.cliente.departamento;
          this.nombreSorteo = this.cliente.client_name;
          this.toastr.success('Datos obtenidos correctamente');
        }
        else{
          this.toastr.info('No se obtuvieron datos del cliente');
        }
      }, error =>{
        this.toastr.warning('No se obtuvieron datos del cliente');
      });
    }
    else{
      this.toastr.warning('Ingrese un número de documento válido','',{progressBar:true});
    }
  }



}

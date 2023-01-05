import { Component, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ClientesService } from "../clientes.service"
import { Cliente } from "../cliente"
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ThemePalette } from '@angular/material/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Item } from '../item';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Sale } from '../sale';
import { PersonalService } from '../personal.service';
import { ToastrService } from 'ngx-toastr';

import html2canvas from 'html2canvas';
import { Product } from '../product';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-listas',
  templateUrl: './listas.component.html',
  styleUrls: ['./listas.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ListasComponent implements OnInit {

  expandedElement: Item ;

  cliente: Cliente;

  destacados: Cliente[]= [];
  restringidos: Cliente[] = [];

  fecha;
  fechaString;

  dataSourceDestacados: MatTableDataSource<Cliente>;
  dataSourceRestringidos: MatTableDataSource<Cliente>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();
  day: string;
  month: string;
  year: string;

  constructor(    private clientesService: ClientesService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  searchItem(){

  }

  saveCheck(){

  }

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDestacados.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceDestacados.paginator) {
      this.dataSourceDestacados.paginator.firstPage();
    }
  }

  applyFilterR(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRestringidos.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceRestringidos.paginator) {
      this.dataSourceRestringidos.paginator.firstPage();
    }
  }

  ngOnInit() {

    this.clientesService.getDestacados().subscribe((destacadosList:Cliente[])=>{
      this.destacados=destacadosList;
      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
        this.restringidos=restringidosList;

        this.dataSourceDestacados = new MatTableDataSource(this.destacados);
        this.dataSourceDestacados.paginator = this.paginator.toArray()[0];
        this.dataSourceDestacados.sort = this.sort.toArray()[0];

        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
        this.dataSourceRestringidos.sort = this.sort.toArray()[1];
      });
    });
  }

  onSubmit() {
  }

  delete(c:Cliente){
    c.condicion='PERMITIDO';
    c.motivo='';
    c.sala_list='';
    c.fecha_list='';
    this.clientesService.deleteCliente(c).subscribe(a=>{
      if(a){
        this.toastr.success('Eliminado');

        this.clientesService.getDestacados().subscribe((destacadosList:Cliente[])=>{
          this.destacados=destacadosList;
          this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
            this.restringidos=restringidosList;

            this.dataSourceDestacados = new MatTableDataSource(this.destacados);
            this.dataSourceDestacados.paginator = this.paginator.toArray()[0];
            this.dataSourceDestacados.sort = this.sort.toArray()[0];

            this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
            this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
            this.dataSourceRestringidos.sort = this.sort.toArray()[1];
          });
        });
      }
    })
  }

  newD(){
    var dialogRef;
   
    this.fecha=new Date();

    this.year=this.fecha.getFullYear();
    this.month=(this.fecha.getMonth())+1;
    this.day=this.fecha.getDate();

    if(parseInt(this.month)<10){
      this.month='0'+this.month;
    }

    if(parseInt(this.day)<10){
      this.day='0'+this.day;
    }

    this.fechaString=this.year+'-'+this.month+'-'+this.day;

    /* console.log(this.fechaString); */

    this.cliente = new Cliente('','','','','','','','','','','DESTACADO','','','')

    dialogRef=this.dialog.open(DialogNewD,{
      data:this.cliente,
    })

    dialogRef.afterClosed().subscribe((res:Cliente) => {
      /*console.log(res);*/
      if(res){
        this.clientesService.getClient(res.doc_number).subscribe((c:Cliente)=>{
          // console.log(this.fechaString);       
          if(c){
            c.condicion=res.condicion;
            c.motivo=res.motivo;
            c.fecha_list=this.fechaString;
            c.sala_list=res.sala_list;
  
            this.clientesService.updateClient(c).subscribe(r=>{
              if(r){
                this.toastr.success('Observación añadida');
  
                this.clientesService.getDestacados().subscribe((destacadosList:Cliente[])=>{
                  this.destacados=destacadosList;
                  this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                    this.restringidos=restringidosList;
  
                    this.dataSourceDestacados = new MatTableDataSource(this.destacados);
                    this.dataSourceDestacados.paginator = this.paginator.toArray()[0];
                    this.dataSourceDestacados.sort = this.sort.toArray()[0];
  
                    this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                    this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                    this.dataSourceRestringidos.sort = this.sort.toArray()[1];
                  });
                });
              }
            })
          }
          else{
            this.clientesService.getClientFromReniec(res.doc_number).subscribe(response=>{
              if(res['success']){
                var clienteNew = new Cliente('','','','','','','','','','','','','','');
                clienteNew.doc_number = res['data']['numero'];
                clienteNew.client_name = res['data']['nombre_completo'];
                clienteNew.birth_date = res['data']['fecha_nacimiento'];
                clienteNew.gender = res['data']['sexo'];
                clienteNew.departamento = res['data']['departamento'];
                clienteNew.provincia = res['data']['provincia'];
                clienteNew.distrito = res['data']['distrito'];
                clienteNew.address = res['data']['direccion'];
                clienteNew.condicion = res.condicion;
                clienteNew.motivo = res.motivo;
                clienteNew.sala_list = res.sala_list;
                clienteNew.fecha_list = this.fechaString;
  
                this.clientesService.addCliente(clienteNew).subscribe(n=>{
                  if(n){
                    this.toastr.success('Observación añadida');
  
                    this.clientesService.getDestacados().subscribe((destacadosList:Cliente[])=>{
                      this.destacados=destacadosList;
                      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                        this.restringidos=restringidosList;
  
                        this.dataSourceDestacados = new MatTableDataSource(this.destacados);
                        this.dataSourceDestacados.paginator = this.paginator.toArray()[0];
                        this.dataSourceDestacados.sort = this.sort.toArray()[0];
  
                        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                        this.dataSourceRestringidos.sort = this.sort.toArray()[1];
                      });
                    });
                  }
                });
              }
            })
          }
        })
      }   
    })
  }

  newR(){
    var dialogRef;

    this.fecha=new Date();

    this.year=this.fecha.getFullYear();
    this.month=(this.fecha.getMonth())+1;
    this.day=this.fecha.getDate();

    if(parseInt(this.month)<10){
      this.month='0'+this.month;
    }

    if(parseInt(this.day)<10){
      this.day='0'+this.day;
    }

    this.fechaString=this.year+'-'+this.month+'-'+this.day;

    // console.log(this.fechaString);

    this.cliente = new Cliente('','','','','','','','','','','RESTRINGIDO','','','')

    dialogRef=this.dialog.open(DialogNewR,{
      data:this.cliente,
    })

    dialogRef.afterClosed().subscribe((res:Cliente) => {
      if(res){
        this.clientesService.getClient(res.doc_number).subscribe((c:Cliente)=>{
        
          if(c){
            c.condicion=res.condicion;
            c.motivo=res.motivo;
            c.fecha_list=this.fechaString;
            c.sala_list=res.sala_list;
  
            this.clientesService.updateClient(c).subscribe(r=>{
              if(r){
                this.toastr.success('Restricción añadida');
  
                this.clientesService.getDestacados().subscribe((destacadosList:Cliente[])=>{
                  this.destacados=destacadosList;
                  this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                    this.restringidos=restringidosList;
  
                    this.dataSourceDestacados = new MatTableDataSource(this.destacados);
                    this.dataSourceDestacados.paginator = this.paginator.toArray()[0];
                    this.dataSourceDestacados.sort = this.sort.toArray()[0];
  
                    this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                    this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                    this.dataSourceRestringidos.sort = this.sort.toArray()[1];
                  });
                });
              }
            })
          }
          else{
            this.clientesService.getClientFromReniec(res.doc_number).subscribe(response=>{
              if(res['success']){
                var clienteNew = new Cliente('','','','','','','','','','','','','','');
                clienteNew.doc_number = res['data']['numero'];
                clienteNew.client_name = res['data']['nombre_completo'];
                clienteNew.birth_date = res['data']['fecha_nacimiento'];
                clienteNew.gender = res['data']['sexo'];
                clienteNew.departamento = res['data']['departamento'];
                clienteNew.provincia = res['data']['provincia'];
                clienteNew.distrito = res['data']['distrito'];
                clienteNew.address = res['data']['direccion'];
                clienteNew.condicion = res.condicion;
                clienteNew.motivo = res.motivo;
                clienteNew.sala_list = res.sala_list;
                clienteNew.fecha_list = this.fechaString;
  
                this.clientesService.addCliente(clienteNew).subscribe(n=>{
                  if(n){
                    this.toastr.success('Restricción añadida');
  
                    this.clientesService.getDestacados().subscribe((destacadosList:Cliente[])=>{
                      this.destacados=destacadosList;
                      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                        this.restringidos=restringidosList;
  
                        this.dataSourceDestacados = new MatTableDataSource(this.destacados);
                        this.dataSourceDestacados.paginator = this.paginator.toArray()[0];
                        this.dataSourceDestacados.sort = this.sort.toArray()[0];
  
                        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                        this.dataSourceRestringidos.sort = this.sort.toArray()[1];
                      });
                    });
                  }
                });
              }
            })
          }
        })
      }
    })
  }

}



@Component({
  selector: 'dialog-newD',
  templateUrl: 'dialog-newD.html',
  styleUrls: ['./listas.component.css']
})
export class DialogNewD implements OnInit {

    disableBtnOk;
    sala;
    salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III'];
    

  constructor(
    public dialogRef: MatDialogRef<DialogNewD>,
    @Inject(MAT_DIALOG_DATA) public data:Cliente,
    private clientsService: ClientesService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.disableBtnOk=true;
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onKeyUpEvent(event:any){

  }

  btnSave(){
    if(this.data.doc_number!='' && this.data.sala_list!='' && this.data.motivo!=''){
      this.data.doc_number=this.data.doc_number.toUpperCase();
      this.data.condicion=this.data.condicion.toUpperCase();
      this.data.motivo=this.data.motivo.toUpperCase();
  /*    this.data.fabricante=this.data.fabricante.toUpperCase();
      this.data.lugar=this.data.lugar.toUpperCase();
      this.data.marca=this.data.marca.toUpperCase();
      this.data.modelo=this.data.modelo.toUpperCase();
      this.data.numero=this.data.numero.toUpperCase();
      this.data.observacion=this.data.observacion.toUpperCase();
      this.data.propietario=this.data.propietario.toUpperCase();
      this.data.registro=this.data.registro.toUpperCase();
      this.data.serie=this.data.serie.toUpperCase();
      this.data.tipo=this.data.tipo.toUpperCase();
      this.data.ubicacion=this.data.ubicacion.toUpperCase(); */
      this.dialogRef.close(this.data);
    }
    else {
      this.toastr.warning('¡DESPIERTA! Algo faltó');
    }
  }
}



@Component({
  selector: 'dialog-newR',
  templateUrl: 'dialog-newR.html',
  styleUrls: ['./listas.component.css']
})
export class DialogNewR implements OnInit {

  disableBtnOk;
  sala;
  salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III'];

  constructor(
    public dialogRef: MatDialogRef<DialogNewR>,
    @Inject(MAT_DIALOG_DATA) public data:Cliente,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.disableBtnOk=true;
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onKeyUpEvent(event:any){
    if(this.data.client_name!=''){
      this.disableBtnOk=false;
    }
  }

  btnSave(){
    if(this.data.doc_number!='' && this.data.sala_list!='' && this.data.motivo!=''){
      this.data.doc_number=this.data.doc_number.toUpperCase();
      this.data.condicion=this.data.condicion.toUpperCase();
      this.data.motivo=this.data.motivo.toUpperCase();
/*     this.data.fabricante=this.data.fabricante.toUpperCase();
      this.data.lugar=this.data.lugar.toUpperCase();
      this.data.marca=this.data.marca.toUpperCase();
      this.data.modelo=this.data.modelo.toUpperCase();
      this.data.numero=this.data.numero.toUpperCase();
      this.data.observacion=this.data.observacion.toUpperCase();
      this.data.propietario=this.data.propietario.toUpperCase();
      this.data.registro=this.data.registro.toUpperCase();
      this.data.serie=this.data.serie.toUpperCase();
      this.data.tipo=this.data.tipo.toUpperCase();
      this.data.ubicacion=this.data.ubicacion.toUpperCase(); */
      this.dialogRef.close(this.data);
    }
    else {
      this.toastr.warning('¡DESPIERTA! Algo faltó');
    }
  }

}


@Component({
  selector: 'dialog-confirm',
  templateUrl: 'dialog-confirm.html',
  styleUrls: ['./listas.component.css']
})
export class DialogConfirm implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<DialogConfirm>,
    @Inject(MAT_DIALOG_DATA) public data:Cliente,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {

  }

  delete(): void{
    this.dialogRef.close(true);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

}

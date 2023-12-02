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
import * as XLSX from 'xlsx';


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

  observados: Cliente[]= [];
  restringidos: Cliente[] = [];
  vips: Cliente[] = [];

  fecha;
  fechaString;

  dataSourceObservados: MatTableDataSource<Cliente>;
  dataSourceRestringidos: MatTableDataSource<Cliente>;
  dataSourceVips: MatTableDataSource<Cliente>;

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

  applyFilterO(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceObservados.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceObservados.paginator) {
      this.dataSourceObservados.paginator.firstPage();
    }
  }

  applyFilterR(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRestringidos.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceRestringidos.paginator) {
      this.dataSourceRestringidos.paginator.firstPage();
    }
  }

  applyFilterV(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceVips.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceVips.paginator) {
      this.dataSourceVips.paginator.firstPage();
    }
  }

  ngOnInit() {

    this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
      this.observados=observadosList;
      this.dataSourceObservados = new MatTableDataSource(this.observados);
      this.dataSourceObservados.paginator = this.paginator.toArray()[0];
      this.dataSourceObservados.sort = this.sort.toArray()[0];

      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
        this.restringidos=restringidosList;
        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
        this.dataSourceRestringidos.sort = this.sort.toArray()[1];

        this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
          this.vips=vipsList;
          this.dataSourceVips = new MatTableDataSource(this.vips);
          this.dataSourceVips.paginator = this.paginator.toArray()[2];
          this.dataSourceVips.sort = this.sort.toArray()[2];
        });
      });
    })
  }

  onSubmit() {
  }

  delete(c:Cliente){
    c.condicion='PERMITIDO';
    c.motivo='';
    c.sala_list='';
    c.fecha_list='';
    c.origin_list='';
    this.clientesService.deleteCliente(c).subscribe(a=>{
      if(a){
        this.toastr.success('Eliminado');

        this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
          this.observados=observadosList;
          this.dataSourceObservados = new MatTableDataSource(this.observados);
          this.dataSourceObservados.paginator = this.paginator.toArray()[0];
          this.dataSourceObservados.sort = this.sort.toArray()[0];
    
          this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
            this.restringidos=restringidosList;
            this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
            this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
            this.dataSourceRestringidos.sort = this.sort.toArray()[1];
    
            this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
              this.vips=vipsList;
              this.dataSourceVips = new MatTableDataSource(this.vips);
              this.dataSourceVips.paginator = this.paginator.toArray()[2];
              this.dataSourceVips.sort = this.sort.toArray()[2];
            });
          });
        })
      }
    })
  }

  newO(){
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

    this.cliente = new Cliente('','','','','','','','','','','OBSERVADO','','','','INDIVIDUAL')

    dialogRef=this.dialog.open(DialogNewO,{
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
            c.origin_list=res.origin_list;
  
            this.clientesService.updateClient(c).subscribe(r=>{
              if(r){
                this.toastr.success('Observado añadido correctamente');
  
                this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
                  this.observados=observadosList;
                  this.dataSourceObservados = new MatTableDataSource(this.observados);
                  this.dataSourceObservados.paginator = this.paginator.toArray()[0];
                  this.dataSourceObservados.sort = this.sort.toArray()[0];
            
                  this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                    this.restringidos=restringidosList;
                    this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                    this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                    this.dataSourceRestringidos.sort = this.sort.toArray()[1];
            
                    this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
                      this.vips=vipsList;
                      this.dataSourceVips = new MatTableDataSource(this.vips);
                      this.dataSourceVips.paginator = this.paginator.toArray()[2];
                      this.dataSourceVips.sort = this.sort.toArray()[2];
                    });
                  });
                })
              }
            })
          }
          else{
            this.clientesService.getClientFromReniec(res.doc_number).subscribe(response=>{
              if(res['success']){
                var clienteNew = new Cliente('','','','','','','','','','','','','','','');
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
                clienteNew.origin_list = "INDIVIDUAL";
  
                this.clientesService.addCliente(clienteNew).subscribe(n=>{
                  if(n){
                    this.toastr.success('Observado añadido correctamente');
  
                    this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
                      this.observados=observadosList;
                      this.dataSourceObservados = new MatTableDataSource(this.observados);
                      this.dataSourceObservados.paginator = this.paginator.toArray()[0];
                      this.dataSourceObservados.sort = this.sort.toArray()[0];
                
                      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                        this.restringidos=restringidosList;
                        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                        this.dataSourceRestringidos.sort = this.sort.toArray()[1];
                
                        this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
                          this.vips=vipsList;
                          this.dataSourceVips = new MatTableDataSource(this.vips);
                          this.dataSourceVips.paginator = this.paginator.toArray()[2];
                          this.dataSourceVips.sort = this.sort.toArray()[2];
                        });
                      });
                    })
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

    this.cliente = new Cliente('','','','','','','','','','','RESTRINGIDO','','','','INDIVIDUAL')

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
            c.origin_list=res.origin_list;
  
            this.clientesService.updateClient(c).subscribe(r=>{
              if(r){
                this.toastr.success('Restringido añadido correctamente');
  
                this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
                  this.observados=observadosList;
                  this.dataSourceObservados = new MatTableDataSource(this.observados);
                  this.dataSourceObservados.paginator = this.paginator.toArray()[0];
                  this.dataSourceObservados.sort = this.sort.toArray()[0];
            
                  this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                    this.restringidos=restringidosList;
                    this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                    this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                    this.dataSourceRestringidos.sort = this.sort.toArray()[1];
            
                    this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
                      this.vips=vipsList;
                      this.dataSourceVips = new MatTableDataSource(this.vips);
                      this.dataSourceVips.paginator = this.paginator.toArray()[2];
                      this.dataSourceVips.sort = this.sort.toArray()[2];
                    });
                  });
                })
              }
            })
          }
          else{
            this.clientesService.getClientFromReniec(res.doc_number).subscribe(response=>{
              if(res['success']){
                var clienteNew = new Cliente('','','','','','','','','','','','','','','');
                clienteNew.doc_number = response['data']['numero'];
                clienteNew.client_name = response['data']['nombre_completo'];
                clienteNew.birth_date = response['data']['fecha_nacimiento'];
                clienteNew.gender = response['data']['sexo'];
                clienteNew.departamento = response['data']['departamento'];
                clienteNew.provincia = response['data']['provincia'];
                clienteNew.distrito = response['data']['distrito'];
                clienteNew.address = response['data']['direccion'];
                clienteNew.condicion = res.condicion;
                clienteNew.motivo = res.motivo;
                clienteNew.sala_list = res.sala_list;
                clienteNew.fecha_list = this.fechaString;
                clienteNew.origin_list = 'INDIVIDUAL';
  
                this.clientesService.addCliente(clienteNew).subscribe(n=>{
                  if(n){
                    this.toastr.success('Restringido añadido correctamente');
  
                    this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
                      this.observados=observadosList;
                      this.dataSourceObservados = new MatTableDataSource(this.observados);
                      this.dataSourceObservados.paginator = this.paginator.toArray()[0];
                      this.dataSourceObservados.sort = this.sort.toArray()[0];
                
                      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                        this.restringidos=restringidosList;
                        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                        this.dataSourceRestringidos.sort = this.sort.toArray()[1];
                
                        this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
                          this.vips=vipsList;
                          this.dataSourceVips = new MatTableDataSource(this.vips);
                          this.dataSourceVips.paginator = this.paginator.toArray()[2];
                          this.dataSourceVips.sort = this.sort.toArray()[2];
                        });
                      });
                    })
                  }
                });
              }
            })
          }
        })
      }
    })
  }

  newV(){
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

    this.cliente = new Cliente('','','','','','','','','','','VIP','CLIENTE VIP','','','INDIVIDUAL')

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
            c.origin_list='INDIVIDUAL';
  
            this.clientesService.updateClient(c).subscribe(r=>{
              if(r){
                this.toastr.success('VIP añadido correctamente');
  
                this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
                  this.observados=observadosList;
                  this.dataSourceObservados = new MatTableDataSource(this.observados);
                  this.dataSourceObservados.paginator = this.paginator.toArray()[0];
                  this.dataSourceObservados.sort = this.sort.toArray()[0];
            
                  this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                    this.restringidos=restringidosList;
                    this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                    this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                    this.dataSourceRestringidos.sort = this.sort.toArray()[1];
            
                    this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
                      this.vips=vipsList;
                      this.dataSourceVips = new MatTableDataSource(this.vips);
                      this.dataSourceVips.paginator = this.paginator.toArray()[2];
                      this.dataSourceVips.sort = this.sort.toArray()[2];
                    });
                  });
                })
              }
            })
          }
          else{
            this.clientesService.getClientFromReniec(res.doc_number).subscribe(response=>{
              if(response['success']){
                var clienteNew = new Cliente('','','','','','','','','','','','','','','');
                clienteNew.doc_number = response['data']['numero'];
                clienteNew.client_name = response['data']['nombre_completo'];
                clienteNew.birth_date = response['data']['fecha_nacimiento'];
                clienteNew.gender = response['data']['sexo'];
                clienteNew.departamento = response['data']['departamento'];
                clienteNew.provincia = response['data']['provincia'];
                clienteNew.distrito = response['data']['distrito'];
                clienteNew.address = response['data']['direccion'];
                clienteNew.condicion = res.condicion;
                clienteNew.motivo = res.motivo;
                clienteNew.sala_list = res.sala_list;
                clienteNew.fecha_list = this.fechaString;
                clienteNew.origin_list = 'INDIVIDUAL'
  
                this.clientesService.addCliente(clienteNew).subscribe(n=>{
                  if(n){
                    this.toastr.success('VIP añadido correctamente');
  
                    this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
                      this.observados=observadosList;
                      this.dataSourceObservados = new MatTableDataSource(this.observados);
                      this.dataSourceObservados.paginator = this.paginator.toArray()[0];
                      this.dataSourceObservados.sort = this.sort.toArray()[0];
                
                      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
                        this.restringidos=restringidosList;
                        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
                        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
                        this.dataSourceRestringidos.sort = this.sort.toArray()[1];
                
                        this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
                          this.vips=vipsList;
                          this.dataSourceVips = new MatTableDataSource(this.vips);
                          this.dataSourceVips.paginator = this.paginator.toArray()[2];
                          this.dataSourceVips.sort = this.sort.toArray()[2];
                        });
                      });
                    })
                  }
                });
              }
            })
          }
        })
      }
    })
  }

  async actualizarListasClientes() {
    this.clientesService.getObservados().subscribe((observadosList:Cliente[])=>{
      this.observados=observadosList;
      this.dataSourceObservados = new MatTableDataSource(this.observados);
      this.dataSourceObservados.paginator = this.paginator.toArray()[0];
      this.dataSourceObservados.sort = this.sort.toArray()[0];

      this.clientesService.getRestringidos().subscribe((restringidosList:Cliente[])=>{
        this.restringidos=restringidosList;
        this.dataSourceRestringidos = new MatTableDataSource(this.restringidos);
        this.dataSourceRestringidos.paginator = this.paginator.toArray()[1];
        this.dataSourceRestringidos.sort = this.sort.toArray()[1];

        this.clientesService.getVips().subscribe((vipsList:Cliente[])=>{
          this.vips=vipsList;
          this.dataSourceVips = new MatTableDataSource(this.vips);
          this.dataSourceVips.paginator = this.paginator.toArray()[2];
          this.dataSourceVips.sort = this.sort.toArray()[2];
        });
      });
    })
  }



  async procesarCliente(cliente: Cliente) {
    try {

      if(cliente.sala_list.trim().toUpperCase()!=''&&cliente.sala_list.trim().toUpperCase()!='UNDEFINED'){
        const existente:Cliente|any = await this.clientesService.getClient(cliente.doc_number).toPromise();
  
        if (existente) {
          // Cliente existe, actualiza
          existente.fecha_list = this.fechaString;
          existente.origin_list = cliente.origin_list;
          existente.sala_list = cliente.sala_list;
          existente.motivo = cliente.motivo;
          existente.condicion = cliente.condicion;
    
          var resUpdExist = await this.clientesService.updateClient(existente).toPromise();
          if(resUpdExist){
            //this.toastr.success('Agregado');
          }
          else{
            this.toastr.warning('Algo salió mal: '+cliente.doc_number);
          }
        } else {
          // Cliente no existe, agrega
          const reniecResponse = await this.clientesService.getClientFromReniec(cliente.doc_number).toPromise();
    
          if (reniecResponse['success']) {
            // Construye el nuevo cliente con datos de Reniec y otros
            cliente.doc_number = reniecResponse['data']['numero'];
            cliente.client_name = reniecResponse['data']['nombre_completo'];
            cliente.birth_date = reniecResponse['data']['fecha_nacimiento'];
            cliente.gender = reniecResponse['data']['sexo'];
            cliente.departamento = reniecResponse['data']['departamento'];
            cliente.provincia = reniecResponse['data']['provincia'];
            cliente.distrito = reniecResponse['data']['distrito'];
            cliente.address = reniecResponse['data']['direccion'];
            cliente.fecha_list = this.fechaString;
            cliente.fecha_registro = this.fechaString;
    
            var resAddRec = await this.clientesService.addCliente(cliente).toPromise();
            if(resAddRec){
              //this.toastr.success('Agregado');
            }
            else{
              this.toastr.warning('Algo salió mal: '+cliente.doc_number);
            }
          } else {
            // Handle error de Reniec
            cliente.fecha_list = this.fechaString;
            cliente.fecha_registro = this.fechaString;
            var resAddNoExistRec = await this.clientesService.addCliente(cliente).toPromise();
            if(resAddNoExistRec){
              //this.toastr.success('Agregado');
            }
            else{
              this.toastr.warning('Algo salió mal: '+cliente.doc_number);
            }
          }
        }
      }
      else{
        this.toastr.warning('No se guardó: '+cliente.doc_number+'. No tiene sala asignada');
      }

  
    } catch (error) {
      console.error(`Error al procesar el cliente ${cliente.doc_number}:`, error);
      // Puedes manejar errores aquí según tus necesidades
    }
  }

  async masiveV(){
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

    var clientes: Cliente[] = [];

    dialogRef=this.dialog.open(DialogMasiveV,{
      data:clientes,
    })

    dialogRef.afterClosed().subscribe(async (res:Cliente[]) => {
      console.log(res);
      if(res.length>0){

        this.toastr.info('Procesando... Espere la confirmación');

        for (let i = 0; i < res.length; i++) {
          const cliente = res[i];
          this.snackBar.open(`Procesando cliente (${i + 1} de ${res.length}): ${cliente.doc_number}`, 'Cerrar', {
            duration: 800, // Duración en milisegundos
            panelClass: ['success-snackbar'] // Clase de estilo CSS personalizada (puedes definirla en tu archivo de estilos)
          });
          console.log(cliente);
          await this.procesarCliente(cliente);
        }
        console.log('Carga masiva completada');
        this.toastr.success('Procesamiento de archivo completo...');
        this.snackBar.open('Proceso finalizado', 'Cerrar', {
          duration: 0, // Duración 0 para que no se cierre automáticamente
          panelClass: ['success-snackbar'], // Clase de estilo CSS personalizada
        });
        this.actualizarListasClientes();



      
      }
    })
  }


}



@Component({
  selector: 'dialog-newO',
  templateUrl: 'dialog-newO.html',
  styleUrls: ['./listas.component.css']
})
export class DialogNewO implements OnInit {

    disableBtnOk;
    sala;
    salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III','OLYMPO'];
    

  constructor(
    public dialogRef: MatDialogRef<DialogNewO>,
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
  salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III','OLYMPO'];

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
  selector: 'dialog-newV',
  templateUrl: 'dialog-newV.html',
  styleUrls: ['./listas.component.css']
})
export class DialogNewV implements OnInit {

  disableBtnOk;
  sala;
  salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III','OLYMPO'];

  constructor(
    public dialogRef: MatDialogRef<DialogNewV>,
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
  selector: 'dialog-masiveV',
  templateUrl: 'dialog-masiveV.html',
  styleUrls: ['./listas.component.css']
})
export class DialogMasiveV implements OnInit {

  disableBtnOk;
  sala;
  salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III','OLYMPO'];
  nombreArchivoSeleccionado='';
  datos:any[]=[];

  constructor(
    public dialogRef: MatDialogRef<DialogMasiveV>,
    @Inject(MAT_DIALOG_DATA) public data:Cliente[],
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.disableBtnOk=true;
  }


  onNoClick(): void {
    this.dialogRef.close(false);
  }


  onFileSelected(e): void {
    const archivoSeleccionado = e.target.files[0];
    if (archivoSeleccionado) {
      this.nombreArchivoSeleccionado = archivoSeleccionado.name;
      console.log('Archivo seleccionado:', archivoSeleccionado);
  
      const reader: FileReader = new FileReader();
  
      reader.onload = (evento: any) => {
        /* Lees el contenido del archivo como una cadena binaria */
        const data: string = evento.target.result;
        /* Conviertes la cadena binaria a una estructura de datos entendible por xlsx */
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'binary' });
  
        // Inicializamos el array para contener todos los datos
        this.datos = [];
  
        // Iteramos sobre todas las hojas del libro de trabajo
        workbook.SheetNames.forEach(sheetName => {
          // Obtienes cada hoja de trabajo
          const hoja: XLSX.WorkSheet = workbook.Sheets[sheetName];
          // Conviertes la hoja de trabajo a un objeto JSON y la fusionas con el array existente
          const datosHoja = XLSX.utils.sheet_to_json(hoja, { header: 1 });
        
          // Filtras los elementos que cumplen con la condición deseada
          const datosFiltrados = datosHoja.filter(elemento => String(elemento[2]).trim().toUpperCase() !== 'SALA' && String(elemento[1]).trim().toUpperCase() !== '' && Array.isArray(elemento) && elemento.length!=0);
  
          // Concatenas los datos filtrados al array existente
          this.datos = this.datos.concat(datosFiltrados);
        });
  
        /* Puedes hacer lo que quieras con los datos aquí. Por ejemplo, imprimir en la consola */
        console.log(this.datos);
      };
  
      // Lees el archivo como una cadena binaria
      reader.readAsBinaryString(archivoSeleccionado);
    }
  }
  

  btnSave(){

    this.data=this.datos.map(elemento=>{
      return new Cliente(String(elemento[1]).trim(),String(elemento[0]).trim().toUpperCase(),'','','','','','','',String(elemento[2]).trim().toUpperCase(),'VIP','CLIENTE SIGMA',String(elemento[2]).trim().toUpperCase(),'','MASIVO');
    })

    console.log(this.data);

    this.dialogRef.close(this.data);
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

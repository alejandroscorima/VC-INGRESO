import { Component, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UsersService } from '../users.service';
import { User } from "../user"
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Product } from '../product';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-birthday',
  templateUrl: './birthday.component.html',
  styleUrls: ['./birthday.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class BirthdayComponent implements OnInit {

  expandedElement: Item ;

  neighbor: User= new User('','','','','','','','','','','','','',0,'','','','','','','','','','','',0,'',0);
  neighbors: User[] = [];

  fecha;
  fecha_cumple;
  fechaString;
  day;
  month;
  year;

  dataSourceHB: MatTableDataSource<User>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(
    private usersServices: UsersService,
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }

  searchItem(){

  }

  saveCheck(){

  }

  applyFilterList(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceHB.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceHB.paginator) {
      this.dataSourceHB.paginator.firstPage();
    }
  }


  change(a:any){
    this.initializeDateFields();
    this.loadBirthdays(this.fecha_cumple);
  }

  ngOnInit() {

    this.fecha = new Date();
    console.log(this.fecha)
    this.initializeDateFields();
    this.loadBirthdays(this.fecha_cumple);
  }


  onSubmit() {
  }

  private initializeDateFields() {
    this.year = this.fecha.getFullYear();
    this.month = (this.fecha.getMonth() + 1).toString().padStart(2, '0'); // Agrega ceros si es necesario
    this.day = this.fecha.getDate().toString().padStart(2, '0'); // Agrega ceros si es necesario

    this.fecha_cumple = `${this.month}-${this.day}`;
    this.fechaString = `${this.year}-${this.month}-${this.day}`;
    console.log(this.fecha_cumple);
    const opciones = { day: '2-digit', month: 'long'};
    this.fechaString = this.fecha.toLocaleDateString('es-ES', opciones);
    console.log(this.fechaString);
  }

  private loadBirthdays(fecha_cumple: string) {
    this.usersServices.getUsersByBirthday(fecha_cumple).subscribe((nList: User[]) => {
      this.neighbors = nList;
      this.dataSourceHB = new MatTableDataSource(this.neighbors);
      this.dataSourceHB.paginator = this.paginator.toArray()[0];
      this.dataSourceHB.sort = this.sort.toArray()[0];
    });
  }

}



@Component({
  selector: 'dialog-datos',
  templateUrl: 'dialog-datos.html',
  styleUrls: ['./birthday.component.css']
})
export class DialogDatos implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<DialogDatos>,
    @Inject(MAT_DIALOG_DATA) public data:Item,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {


    //this.btnValidarEnabled=this.biometricoChecked&&this.noMultasChecked&&this.noCaducadoChecked&&this.data.seguridad_nombre;
    //this.btnRechazarEnabled=Boolean(this.data.seguridad_nombre);
  }


  onNoClick(): void {
    this.dialogRef.close();
  }

  onKeyUpEvent(event:any){

  }

  btnSave(){
    this.data.area=this.data.area.toUpperCase();
    this.data.codigo=this.data.codigo.toUpperCase();
    this.data.descripcion=this.data.descripcion.toUpperCase();
    this.data.estado=this.data.estado.toUpperCase();
    this.data.fabricante=this.data.fabricante.toUpperCase();
    this.data.lugar=this.data.lugar.toUpperCase();
    this.data.marca=this.data.marca.toUpperCase();
    this.data.modelo=this.data.modelo.toUpperCase();
    this.data.numero=this.data.numero.toUpperCase();
    this.data.observacion=this.data.observacion.toUpperCase();
    this.data.propietario=this.data.propietario.toUpperCase();
    this.data.registro=this.data.registro.toUpperCase();
    this.data.serie=this.data.serie.toUpperCase();
    this.data.tipo=this.data.tipo.toUpperCase();
    this.data.ubicacion=this.data.ubicacion.toUpperCase();
    this.dialogRef.close(this.data);
  }

}

import { Component, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { UsersService } from "../users.service"
import { User } from "../user"
import { AccessLogService } from "../access-log.service"
import { Visit } from "../visit"
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
import { EntranceService } from '../entrance.service';
import { ToastrService } from 'ngx-toastr';
import html2canvas from 'html2canvas';
import { Product } from '../product';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { AccessPoint } from '../accessPoint';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display:'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HistoryComponent implements OnInit {

  expandedElement: Item ;

  visit: Visit= new Visit('','','','','','','');
  visits: Visit[] = [];

  salas: string[]=[];

  fecha;
  fecha_inicial;
  fecha_final;
  fechaString;
  fechaString_inicial;
  fechaString_final;

  access_point;

  day;
  month;
  year;

  dataSourceHistory: MatTableDataSource<Visit>;

  accessPoints: AccessPoint[] = [];

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(
    private accessLogService: AccessLogService,
    private entranceService: EntranceService,
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

  applyFilterList(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceHistory.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceHistory.paginator) {
      this.dataSourceHistory.paginator.firstPage();
    }
  }

  salaChange(){
    this.accessLogService.getHistoryByRange(this.fechaString_inicial,this.fechaString_final,this.access_point).subscribe((vrange:Visit[])=>{
      this.visits=vrange;
      this.dataSourceHistory = new MatTableDataSource(this.visits);
      this.dataSourceHistory.paginator = this.paginator.toArray()[0];
      this.dataSourceHistory.sort = this.sort.toArray()[0];
    })
  }

  change(a){
    if(this.fecha_final!=null){

      this.year=this.fecha_inicial.getFullYear();
      this.month=parseInt(this.fecha_inicial.getMonth())+1;
      this.day=this.fecha_inicial.getDate();
    
      if(parseInt(this.month)<10){
          this.month='0'+this.month;
      }
    
      if(parseInt(this.day)<10){
          this.day='0'+this.day;
      }
    
      this.fechaString_inicial=this.year+'-'+this.month+'-'+this.day+' 00:00:00';
  
      this.year=this.fecha_final.getFullYear();
      this.month=parseInt(this.fecha_final.getMonth())+1;
      this.day=this.fecha_final.getDate();
    
      if(parseInt(this.month)<10){
          this.month='0'+this.month;
      }
    
      if(parseInt(this.day)<10){
          this.day='0'+this.day;
      }
    
      this.fechaString_final=this.year+'-'+this.month+'-'+this.day+' 23:59:59';
  
      if(this.access_point!=''){
  
  
        this.accessLogService.getHistoryByRange(this.fechaString_inicial,this.fechaString_final,this.access_point).subscribe((vrange:Visit[])=>{
          this.visits=vrange;
          this.dataSourceHistory = new MatTableDataSource(this.visits);
          this.dataSourceHistory.paginator = this.paginator.toArray()[0];
          this.dataSourceHistory.sort = this.sort.toArray()[0];
        })
      }
      else{
        this.toastr.warning('Selecciona un Punto de Acceso');
      }
    }
  }

  viewDetail(vis: Visit){
    var dialogRef;

    dialogRef=this.dialog.open(DialogHistoryDetail,{
      data:{data:vis,dataSala:this.access_point}
    })

    dialogRef.afterClosed().subscribe((res:User) => {
    })
  }

  viewLudops(){
    var dialogRef;

    dialogRef=this.dialog.open(DialogLudops,{
      data:""
    })

    dialogRef.afterClosed().subscribe((res:User) => {
    })
  }

  ngOnInit() {
    // Punto de acceso predefinido
    this.access_point='GARITA';
    // Configurar la fecha inicial y final como la fecha actual
    const today = new Date();
    this.fecha_inicial = today;
    this.fecha_final = today;
    // Formato de fecha en cadena para el rango
    this.year = today.getFullYear();
    this.month = (today.getMonth() + 1).toString().padStart(2, '0');
    this.day = today.getDate().toString().padStart(2, '0');
    this.fechaString_inicial = `${this.year}-${this.month}-${this.day}`+' 00:00:00';
    this.fechaString_final = `${this.year}-${this.month}-${this.day}`+' 23:59:59';
    // obtener todos los putnos de acceso del sql en la lista desplegable
    this.entranceService.getAllAccessPoints().subscribe((campList:AccessPoint[])=>{
      console.log(campList)
      if(campList){
        this.accessPoints=campList;
      }
    });
    this.toastr.success('Mostrando historial del día de hoy: '+this.day+'/'+this.month+'/'+this.year);

  //Cargar historial al inicio basado en valores predefinidos
    this.accessLogService.getHistoryByRange(this.fechaString_inicial, this.fechaString_final, this.access_point).subscribe((vrange: Visit[]) => {
      this.visits = vrange;
      console.log(this.visits);
      this.dataSourceHistory = new MatTableDataSource(this.visits);
      this.dataSourceHistory.paginator = this.paginator.toArray()[0];
      this.dataSourceHistory.sort = this.sort.toArray()[0];
    },
    (error) => {
      console.error('Error al obtener el historial:', error);
      this.toastr.error('Error al cargar el historial.'); // Muestra un mensaje de error
    }
  );
  }

  onSubmit() {
  }

}


@Component({
  selector: 'dialog-history-detail',
  templateUrl: 'dialog-history-detail.html',
  styleUrls: ['./history.component.css']
})
export class DialogHistoryDetail implements OnInit {

  visit: Visit= new Visit('','','','','','','');
  visits: Visit[] = [];

  dataSourceHistoryClient: MatTableDataSource<Visit>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();


  constructor(
    public dialogRef: MatDialogRef<DialogHistoryDetail>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private accessLogService: AccessLogService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {

    this.accessLogService.getHistoryByClient(this.data['data'].date_entrance,this.data['dataSala'],this.data['data'].doc_number).subscribe((vList:Visit[])=>{
      vList.unshift(this.data['data']);
      this.visits=vList;
      this.dataSourceHistoryClient = new MatTableDataSource(this.visits);
      this.dataSourceHistoryClient.paginator = this.paginator.toArray()[0];
      this.dataSourceHistoryClient.sort = this.sort.toArray()[0];
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}



@Component({
  selector: 'dialog-ludops',
  templateUrl: 'dialog-ludops.html',
  styleUrls: ['./history.component.css']
})
export class DialogLudops implements OnInit {

  visit: Visit= new Visit('','','','','','','');
  visits: Visit[] = [];

  dataSourceHistoryClient: MatTableDataSource<Visit>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();


  constructor(
    public dialogRef: MatDialogRef<DialogLudops>,
    @Inject(MAT_DIALOG_DATA) public data,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}

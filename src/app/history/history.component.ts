import { Component, ElementRef, HostListener, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ClientesService } from "../clientes.service"
import { Cliente } from "../cliente"
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
import { PersonalService } from '../personal.service';
import { ToastrService } from 'ngx-toastr';

import html2canvas from 'html2canvas';
import { Product } from '../product';
import { animate, state, style, transition, trigger } from '@angular/animations';


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

  salas: string[]=['PALACIO','VENEZUELA','HUANDOY','KANTA','MEGA','PRO','HUARAL','SAN JUAN I','SAN JUAN II','SAN JUAN III'];

  fecha;
  fechaString;

  sala;

  day;
  month;
  year;

  dataSourceHistory: MatTableDataSource<Visit>;

  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(
    private clientesService: ClientesService,
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
    this.clientesService.getHistoryByDate(this.fechaString,this.sala).subscribe((vList:Visit[])=>{
      this.visits=vList;
      this.dataSourceHistory = new MatTableDataSource(this.visits);
      this.dataSourceHistory.paginator = this.paginator.toArray()[0];
      this.dataSourceHistory.sort = this.sort.toArray()[0];
    });
  }

  change(a){
    this.year=this.fecha.getFullYear();
    this.month=parseInt(this.fecha.getMonth())+1;
    this.day=this.fecha.getDate();

    if(parseInt(this.month)<10){
      this.month='0'+this.month;
    }

    if(parseInt(this.day)<10){
      this.day='0'+this.day;
    }

    this.fechaString=this.year+'-'+this.month+'-'+this.day;

    if(this.sala!=''){

      this.clientesService.getHistoryByDate(this.fechaString,this.sala).subscribe((vList:Visit[])=>{
        this.visits=vList;
        this.dataSourceHistory = new MatTableDataSource(this.visits);
        this.dataSourceHistory.paginator = this.paginator.toArray()[0];
        this.dataSourceHistory.sort = this.sort.toArray()[0];
      });
    }
    else{
      this.toastr.warning('Selecciona una sala');
    }
  }

  viewDetail(vis: Visit){
    var dialogRef;

    dialogRef=this.dialog.open(DialogHistoryDetail,{
      data:{data:vis,dataSala:this.sala}
    })

    dialogRef.afterClosed().subscribe((res:Cliente) => {
    })
  }

  viewLudops(){
    var dialogRef;

    dialogRef=this.dialog.open(DialogLudops,{
      data:""
    })

    dialogRef.afterClosed().subscribe((res:Cliente) => {
    })
  }

  ngOnInit() {

    this.sala='';

    this.fecha=new Date();

    this.year=this.fecha.getFullYear();
    this.month=parseInt(this.fecha.getMonth())+1;
    this.day=this.fecha.getDate();

    if(parseInt(this.month)<10){
      this.month='0'+this.month;
    }

    if(parseInt(this.day)<10){
      this.day='0'+this.day;
    }

    this.fechaString=this.year+'-'+this.month+'-'+this.day;

    this.toastr.info('Selecciona una sala y fecha para mostrar el historial');
/*     this.clientesService.getHistoryByDate(this.fechaString,this.sala).subscribe((vList:Visit[])=>{
      this.visits=vList;
      this.dataSourceHistory = new MatTableDataSource(this.visits);
      this.dataSourceHistory.paginator = this.paginator.toArray()[0];
      this.dataSourceHistory.sort = this.sort.toArray()[0];
    }); */
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
    private clientesService: ClientesService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {

    this.clientesService.getHistoryByClient(this.data['data'].date_entrance,this.data['dataSala'],this.data['data'].doc_number).subscribe((vList:Visit[])=>{
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
    private clientesService: ClientesService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}

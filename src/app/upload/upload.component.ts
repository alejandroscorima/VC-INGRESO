import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadService } from '../file-upload.service';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  docname = '';

  constructor(private fileupload:FileUploadService,
    public dialog: MatDialog,) { }

  ngOnInit(): void {  
    /* this.logisticaService.getDaily().subscribe((resd:Daily[])=>{
      if(resd.length!=0){
        this.regList=[];
        this.regList=resd;

        console.log(this.regList);
        this.dataSourceDaily = new MatTableDataSource(this.regList);
        this.dataSourceDaily.paginator = this.paginator.toArray()[0];
        this.dataSourceDaily.sort = this.sort.toArray()[0];
      }
    }); */

  }
  
  applyFilterD(event: Event) {
    /* const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceDaily.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceDaily.paginator) {
      this.dataSourceDaily.paginator.firstPage();
    } */
  }

  onFileChange(e){
    var dialogRef;

    dialogRef=this.dialog.open(DialogStatus,{
      data:e.target.files[0],
    })

    dialogRef.afterClosed().subscribe((result:any) => {
    })
    console.log(e)
    this.docname = e.target.files[0].name;

  }

}

@Component({
  selector: 'dialog-status',
  templateUrl: 'dialog-status.html',
  styleUrls: ['./upload.component.css']
})
export class DialogStatus implements OnInit {

  img = new Image();

  urlResult;

  hideCheck=true;
  hideLoad=true;
  urlGif = "";
  respuesta = "";

  constructor(
    public dialogRef: MatDialogRef<DialogStatus>,
    @Inject(MAT_DIALOG_DATA) public data:File,
    private fb: FormBuilder,
    private fileupload:FileUploadService,
  ) {}

  ngOnInit(): void {

    this.urlGif='/Ingreso-v1.0/assets/upload-head.gif'
    this.respuesta= "Tómese un café..."
    
    try {
      this.fileupload.upload(this.data).subscribe(resp=>{
        console.log("subida exitosa");
        console.log(resp);
        this.urlGif='/Ingreso-v1.0/assets/success-boy.gif';
        this.respuesta = "LISTO ¡A trabajar!";
      });
    } catch (error) {
      this.urlGif='/Ingreso-v1.0/assets/failed-cat.gif'
      this.respuesta = "Algo salió mal! Comuníquese con Sistemas"
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
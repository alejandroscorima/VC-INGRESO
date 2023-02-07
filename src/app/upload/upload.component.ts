import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadService } from '../file-upload.service';

import * as pdfjsLib from 'pdfjs-dist';
import { LudopatiaService } from '../ludopatia.service';
import { Ludopata } from '../ludopata';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  docname = '';

  ludopatas=[];
  toAdd=[];
  toRemove=[];

  constructor(private fileupload:FileUploadService,
  private ludopatiaService:LudopatiaService,
  private toastr:ToastrService,
  public dialog: MatDialog,) { }

  
  async loadLudop(){


    pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdn.jsdelivr.net/npm/pdfjs-dist@2.14.305/build/pdf.worker.js';

    //var loadingTask = pdfjsLib.getDocument('http://192.168.4.250/Sistema consulta de Ludopatía.pdf');
    var loadingTask = pdfjsLib.getDocument('http://34.207.60.246/Sistema consulta de Ludopatía.pdf');

    
    this.ludopatas = await loadingTask.promise.then(function(pdf) {

      var pages=pdf.numPages;

      var lista=[];

      for(let i=1;i<=pages;i++){
        pdf.getPage(i).then(function(page) {
          page.getTextContent().then(txt=>{
            txt.items.forEach(function(word,ind){

              if(String(word['str']).includes('Dni')){
                lista.push(txt.items[ind+1]['str']);
              }
              else if(String(word['str']).includes('Carnet')){
                lista.push(txt.items[ind+2]['str']);
              }

            })
          })
        });
      }
      return lista;
    })

    console.log(this.ludopatas.length);


    this.ludopatiaService.getLudopatas().subscribe((resLudops:Ludopata[])=>{
      console.log('listaLudopsBD',resLudops)
      if(true){
        console.log('2remove');
        resLudops.forEach(l=>{
          if(this.ludopatas.find((lar:Ludopata,indLar)=>l.doc_number==lar.doc_number)){
          }
          else{
            this.toRemove.push(l);
          }
        })

        console.log('2add');
        console.log(this.ludopatas.length);
        this.ludopatas.forEach(lar=>{
          if(resLudops.find((l:Ludopata,indLar)=>l.doc_number==lar.doc_number)){
            console.log('encontrado');
          }
          else{
            console.log('no esta',lar);
            this.toAdd.push(lar);
          }
        })

        this.toRemove.forEach(l2r=>{
          this.ludopatiaService.deleteLudopata(l2r).subscribe();
        })

        this.toAdd.forEach(l2a=>{
          this.ludopatiaService.addLudopata(l2a).subscribe();
        })
      }
    })

  }


  ngOnInit(): void {  



  }

  onFileChange(e){
    var dialogRef;

    this.loadLudop();

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

/*     this.urlGif='/Ingreso-v1.0/assets/upload-head.gif'
    this.respuesta= "Tómese un café..." */
    
/*     try {
      this.fileupload.upload(this.data).subscribe(resp=>{
        console.log("subida exitosa");
        console.log(resp);
        this.urlGif='/Ingreso-v1.0/assets/success-boy.gif';
        this.respuesta = "LISTO ¡A trabajar!";
      });
    } catch (error) {
      this.urlGif='/Ingreso-v1.0/assets/failed-cat.gif'
      this.respuesta = "Algo salió mal! Comuníquese con Sistemas"
    } */

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
import { Component, Inject, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileUploadService } from '../file-upload.service';

import * as pdfjsLib from 'pdfjs-dist';
import { LudopatiaService } from '../ludopatia.service';
import { Ludopata } from '../ludopata';
import { ToastrService } from 'ngx-toastr';
import { ClientesService } from '../clientes.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {

  docname = '';
  dataSourceLudop:MatTableDataSource<Ludopata>;
  @ViewChildren(MatPaginator) paginator= new QueryList<MatPaginator>();
  @ViewChildren(MatSort) sort= new QueryList<MatSort>();

  constructor(private fileupload:FileUploadService,
  private clientesService:ClientesService,
  private ludopatiaService:LudopatiaService,
  private toastr:ToastrService,
  public dialog: MatDialog,) { }



  ngOnInit(): void {

    this.ludopatiaService.getLudopatas().subscribe((resl:Ludopata[])=>{
      if(resl.length!=0){
        this.dataSourceLudop= new MatTableDataSource(resl);
        this.dataSourceLudop.paginator = this.paginator.toArray()[0];
        this.dataSourceLudop.sort = this.sort.toArray()[0];
      }
    });

  }

  applyFilterD(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceLudop.filter = filterValue.trim().toLowerCase();

    if (this.dataSourceLudop.paginator) {
      this.dataSourceLudop.paginator.firstPage();
    }
  }

  editarLudop(ludo:Ludopata){
    var dialogRef;

    dialogRef=this.dialog.open(DialogEditLudop,{
      data:ludo,
    })

    dialogRef.afterClosed().subscribe(res=>{
      if(res){
        this.ludopatiaService.getLudopatas().subscribe((resl:Ludopata[])=>{
          if(resl.length!=0){
            this.dataSourceLudop= new MatTableDataSource(resl);
            this.dataSourceLudop.paginator = this.paginator.toArray()[0];
            this.dataSourceLudop.sort = this.sort.toArray()[0];
          }
        });
      }
    })
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

  ludopatas: Ludopata[]=[];
  toAdd: Ludopata[]=[];
  toRemove: Ludopata[]=[];

  constructor(
    public dialogRef: MatDialogRef<DialogStatus>,
    @Inject(MAT_DIALOG_DATA) public data:File,
    private fb: FormBuilder,
    private fileupload:FileUploadService,
    private clientesService:ClientesService,
    private ludopatiaService:LudopatiaService,
  ) {}



  async loadLudop(file){

    let promise = new Promise((resolve, reject) => {
      setTimeout(() => resolve("done!"), 2000)
    });
  
    let result = await promise;
  
    pdfjsLib.GlobalWorkerOptions.workerSrc = '//cdn.jsdelivr.net/npm/pdfjs-dist@3.8.162/build/pdf.worker.js';

    //var loadingTask = pdfjsLib.getDocument('http://192.168.4.250/Sistema consulta de Ludopatía.pdf');
    //var loadingTask = pdfjsLib.getDocument('http://52.5.47.64/Sistema consulta de Ludopatía.pdf');

    var loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));


    this.ludopatas = await loadingTask.promise.then(async function(pdf) {

      var pages=pdf.numPages;

      var lista=[];

      for(let i=1;i<=pages;i++){
        var page = await pdf.getPage(i);
        var txt = await page.getTextContent();
        console.log(txt);
        txt.items.forEach((word,ind)=>{
          if(String(word['str']).includes('Dni')){
            var per = new Ludopata('','','','');
            if(String(txt.items[ind]['str']).split(' ')[0]!='Dni'){
              per.code = String(txt.items[ind]['str']).split(' ')[0];
            }
            else{
              per.code = txt.items[ind-2]['str'];
            }
            per.type_doc = 'DNI';
            if(txt.items[ind+1]['str']!=''){
              per.doc_number = txt.items[ind+1]['str'];
            }
            else{
              per.doc_number = txt.items[ind+2]['str']; 
            }
            lista.push(per);
          }
          else if(String(word['str']).includes('Carnet')){
            var ext = new Ludopata('','','','');
            ext.code = txt.items[ind-1]['str'];
            ext.type_doc = 'CE';
            if(txt.items[ind+2]['str']!=''&&txt.items[ind+2]['str']!='Extranjeria'){
              ext.doc_number = txt.items[ind+2]['str'];
            }
            else{
              if(txt.items[ind+3]['str']!=''&&txt.items[ind+3]['str']!='Extranjeria'){
                ext.doc_number = txt.items[ind+3]['str'];
              }
              else{
                ext.doc_number = txt.items[ind+4]['str'];
              }
            }
            ext.name = 'EXTRANJERO';
            lista.push(ext);
          }
        })
        if(i==pages){
          console.log(lista);
        }

      }

      return lista;

    });


    if(this.ludopatas.length>0){

      this.ludopatiaService.getLudopatas().subscribe((resLudops:Ludopata[])=>{
        console.log('listaLudopsBD',resLudops)
        if(true){
          resLudops.forEach(l=>{
            if(this.ludopatas.find((lar,indLar)=>l.doc_number==lar.doc_number)){
            }
            else{
              this.toRemove.push(l);
            }
          })
  
          console.log('toRemove',this.toRemove);
  
          this.ludopatas.forEach(lar=>{
            if(resLudops.find((l:Ludopata,indLar)=>l.doc_number==lar.doc_number)){
            }
            else{
              this.toAdd.push(lar);
            }
          })
  
          console.log('toAdd',this.toAdd);
  
          if(this.toAdd.length==0&&this.toRemove.length==0){
            this.urlGif='/ingreso-v1.0/assets/success-boy.gif';
            this.respuesta = "LISTO ¡A trabajar!";
          }
          else{
            this.toRemove.forEach((l2r,indice)=>{
              this.ludopatiaService.deleteLudopata(l2r).subscribe(resRemove=>{
                if(resRemove){
                  if(indice==this.toRemove.length-1){
                    if(this.toRemove.length>this.toAdd.length){
                      this.urlGif='/ingreso-v1.0/assets/success-boy.gif';
                      this.respuesta = "LISTO ¡A trabajar!";
                    }
                  }
                }
              });
            })
    
    
    
            this.toAdd.forEach((l2a,indice)=>{
              console.log(l2a);
              if(l2a.type_doc=='DNI'){
                this.clientesService.getUserFromReniec(l2a.doc_number).subscribe(personReniec=>{
                  if(personReniec&&personReniec['success']){
                    l2a.name=personReniec['data']['nombre_completo'];
                    this.ludopatiaService.addLudopata(l2a).subscribe(resAdd=>{
                      if(resAdd){
                        if(indice==this.toAdd.length-1){
                          if(this.toAdd.length>=this.toRemove.length){
                            this.urlGif='/ingreso-v1.0/assets/success-boy.gif';
                            this.respuesta = "LISTO ¡A trabajar!";
                          }
                        }
                      }
                    });
                  }
                  else{
                    l2a.name='ludopata';
                    this.ludopatiaService.addLudopata(l2a).subscribe(resAdd=>{
                      if(resAdd){
                        if(indice==this.toAdd.length-1){
                          if(this.toAdd.length>=this.toRemove.length){
                            this.urlGif='/ingreso-v1.0/assets/success-boy.gif';
                            this.respuesta = "LISTO ¡A trabajar!";
                          }
                        }
                      }
                    });
                  }
                },error=>{
                  l2a.name='ludopata';
                  this.ludopatiaService.addLudopata(l2a).subscribe(resAdd=>{
                    if(resAdd){
                      if(indice==this.toAdd.length-1){
                        if(this.toAdd.length>=this.toRemove.length){
                          this.urlGif='/ingreso-v1.0/assets/success-boy.gif';
                          this.respuesta = "LISTO ¡A trabajar!";
                        }
                      }
                    }
                  });
                })
              }
              else if(l2a.type_doc=='CE'){
                this.ludopatiaService.addLudopata(l2a).subscribe(resAdd=>{
                  if(resAdd){
                    if(indice==this.toAdd.length-1){
                      if(this.toAdd.length>=this.toRemove.length){
                        this.urlGif='/ingreso-v1.0/assets/success-boy.gif';
                        this.respuesta = "LISTO ¡A trabajar!";
                      }
                    }
                  }
                });
              }
    
            })
          }
  
        }
      })
    }

    else{
      this.respuesta = "ERROR, no se encontraron ludopatas en el archivo";
    }




  }

  ngOnInit(): void {

    this.urlGif='/ingreso-v1.0/assets/upload-head.gif'
    this.respuesta= "Tómese un café..."
    
    try {
      this.loadLudop(this.data);
/*       this.fileupload.upload(this.data).subscribe(resp=>{
        console.log("subida exitosa");
        console.log(resp);

        this.loadLudop();

      },error=>{
        this.urlGif='/ingreso-v1.0/assets/failed-cat.gif'
        this.respuesta = "Algo salió mal! Comuníquese con Sistemas"
      }); */
    } catch (error) {
      this.urlGif='/ingreso-v1.0/assets/failed-cat.gif'
      this.respuesta = "Algo salió mal! Comuníquese con Sistemas"
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'dialog-editLudop',
  templateUrl: 'dialog-editLudop.html',
  styleUrls: ['./upload.component.css']
})
export class DialogEditLudop implements OnInit {

  img = new Image();

  urlResult;

  hideCheck=true;
  hideLoad=true;
  urlGif = "";
  respuesta = "";

  ludopatas: Ludopata[]=[];
  toAdd: Ludopata[]=[];
  toRemove: Ludopata[]=[];

  constructor(
    public dialogRef: MatDialogRef<DialogStatus>,
    @Inject(MAT_DIALOG_DATA) public data:Ludopata,
    private fb: FormBuilder,
    private fileupload:FileUploadService,
    private clientesService:ClientesService,
    private ludopatiaService:LudopatiaService,
    private toastr:ToastrService,
  ) {}

  ngOnInit(): void {

  }

  save(){
    this.ludopatiaService.updateLudopata(this.data).subscribe(resp=>{
      if(resp){
        this.toastr.success('Se han actualizado los datos correctamente!');
        this.dialogRef.close(true);
      }
    });
  }
}
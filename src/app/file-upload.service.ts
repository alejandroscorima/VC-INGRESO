import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  baseApiUrl = "http://52.5.47.64:8088/api2/ingreso/upload"
  constructor(private http:HttpClient) { }
  upload(file):Observable<any>{
    const formData = new FormData();
    formData.append("file",file,file.name);
    return this.http.post(this.baseApiUrl,formData)
  }
}

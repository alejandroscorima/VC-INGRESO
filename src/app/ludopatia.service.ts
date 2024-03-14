import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Person } from "./person";
import { environment } from "../environments/environment";
import { Ludopata } from './ludopata';

@Injectable({
  providedIn: 'root'
})
export class LudopatiaService {

  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getLudopataxDoc(doc_number: string) {
    return this.http.get(`${this.baseUrl}/getLudopataxDoc.php?doc_number=${doc_number}`);
  }

  getLudopatas() {
    return this.http.get(`${this.baseUrl}/getAllLudopatas.php`);
  }

  addLudopata(ludop: Ludopata) {
    return this.http.post(`${this.baseUrl}/postLudopata.php`, ludop);
  }

  deleteLudopata(ludop: Ludopata) {
    return this.http.delete(`${this.baseUrl}/deleteLudopata.php?ludop_id=${ludop.id}`);
  }

  updateLudopata(ludop: Ludopata) {
    return this.http.put(`${this.baseUrl}/updateLudopata.php`, ludop);
  }

}

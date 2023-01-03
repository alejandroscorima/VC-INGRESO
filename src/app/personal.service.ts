import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cliente } from "./cliente";
import { environment } from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  baseUrl = environment.baseUrl

  constructor(private http: HttpClient) { }

  getPersonales(sala: string) {
    return this.http.get(`${this.baseUrl}/getAllPersonal.php?sala=${sala}`);
  }

  getPersonal(doc_number: string, date_entrance: string, selectedSala: string) {
    return this.http.get(`${this.baseUrl}/get.php?doc_number=${doc_number}&date_entrance=${date_entrance}&selectedSala=${selectedSala}`);
  }

  addCliente(cliente: Cliente) {
    return this.http.post(`${this.baseUrl}/post.php`, cliente);
  }

  deleteCliente(cliente: Cliente) {
    //return this.http.delete(`${this.baseUrl}/delete.php?idCliente=${cliente.id}`);
  }

  updateCliente(cliente: Cliente) {
    return this.http.put(`${this.baseUrl}/update.php`, cliente);
  }
}

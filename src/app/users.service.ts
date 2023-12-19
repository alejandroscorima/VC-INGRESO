
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from "./user";
import { environment } from "../environments/environment";
import { Observable } from 'rxjs';
import { Item } from './item';

import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseUrl = environment.baseUrl
  respuesta;
  urlconsulta;

  constructor(private http: HttpClient, private cookies: CookieService) { }


  getAllUsers() {
    return this.http.get(`${this.baseUrl}/getAllUsers.php`);
  }



  //Commit change getUserNew

  getUser(username, password) {
    return this.http.get(`${this.baseUrl}/getUserNew.php?username=${username}&password=${password}`);
  }

  getUserById(user_id) {
    return this.http.get(`${this.baseUrl}/getUserByIdNew.php?user_id=${user_id}`);
  }


  getCollaboratorByUserId(user_id) {
    return this.http.get(`${this.baseUrl}/getCollaboratorByUserId.php?user_id=${user_id}`);
  }

  getPersonal(area_id) {
    return this.http.get(`${this.baseUrl}/getPersonal.php?area_id=${area_id}`);
  }


  addUser(u: User) {
    return this.http.post(`${this.baseUrl}/postUser.php`, u);
  }

  updateUser(u: User) {
    return this.http.put(`${this.baseUrl}/updateUser.php`, u);
  }



  getAreas() {
    return this.http.get(`${this.baseUrl}/getAreas.php`);
  }

  getSalas() {
    return this.http.get(`${this.baseUrl}/getSalas.php`);
  }

  getPrioridad() {
    return this.http.get(`${this.baseUrl}/getPrioridad.php`);
  }

  addReqDet(item: Item) {
    return this.http.post(`${this.baseUrl}/postReqDetalle.php`, item);
  }

  getClientes(fecha_cumple: string) {
    return this.http.get(`${this.baseUrl}/getAll.php?fecha_cumple=${fecha_cumple}`);
  }

  getClientsHB(fecha_cumple: string) {
    return this.http.get(`${this.baseUrl}/getClientsHB.php?fecha_cumple=${fecha_cumple}`);
  }

  getHistoryByDate(fecha: string, sala: string) {
    return this.http.get(`${this.baseUrl}/getHistoryByDate.php?fecha=${fecha}&sala=${sala}`);
  }

  getHistoryByClient(fecha: string, sala: string, doc:string) {
    return this.http.get(`${this.baseUrl}/getHistoryByClient.php?fecha=${fecha}&sala=${sala}&doc=${doc}`);
  }

  getDestacados() {
    return this.http.get(`${this.baseUrl}/getDestacados.php`);
  }

  getRestringidos() {
    return this.http.get(`${this.baseUrl}/getRestringidos.php`);
  }

  getClient(doc_number: string) {

    return this.http.get(`${this.baseUrl}/getClient.php?doc_number=${doc_number}`);
  }

  addCliente(cliente: User) {
    return this.http.post(`${this.baseUrl}/postClient.php`, cliente);
  }

  deleteCliente(cliente: User) {
    return this.http.put(`${this.baseUrl}/deleteClient.php`, cliente);
  }

  updateClient(cliente: User) {
    return this.http.put(`${this.baseUrl}/updateClient.php`, cliente);
  }


  getPaymentByClientId(client_id: number) {
    return this.http.get(
      `${this.baseUrl}/getPaymentByClientId.php?client_id=${client_id}`
    );
  }
}

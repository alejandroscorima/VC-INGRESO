
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from "./user";
import { environment } from "../environments/environment";
import {  BehaviorSubject, Observable } from 'rxjs';
import { Item } from './item';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  baseUrl = environment.baseUrl;

  // BehaviorSubject para centralizar el estado del usuario
  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  respuesta;
  urlconsulta;

  constructor(private http: HttpClient, private cookies: CookieService) { }


  getAllUsers() {
    return this.http.get(`${this.baseUrl}/getAllUsers.php`);
  }



  //Commit change getUserNew

  //login
  getUser(username_system, password_system) {
    return this.http.get(`${this.baseUrl}/getUser.php?username_system=${username_system}&password_system=${password_system}`);
  }

  //myhouse
  getUserById(user_id) {
    return this.http.get(`${this.baseUrl}/getUserById.php?user_id=${user_id}`);
  }
  // Establecer el usuario en el estado global
  setUsr(user: User): void {
    this.userSubject.next(user);
  }

  // Obtener el usuario actual del estado global
  getUsr(): User | null {
    return this.userSubject.getValue();
  }

  //users
  getUserByDocNumber(doc_number: string) {
    return this.http.get(`${this.baseUrl}/getUserByDocNumber.php?doc_number=${doc_number}`);
  }

  //usersByBirthday
  getUsersByBirthday(fecha_cumple: string) {
    return this.http.get(`${this.baseUrl}/getUsersByBirthday.php?fecha_cumple=${fecha_cumple}`);
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

  getUserFromReniec(doc_number: string) {

    this.urlconsulta = 'https://my.apidev.pro/api/dni/'+doc_number+'?api_token=e9cc47e67d492cdee675bfb2b365cvcs93611b5141144aa0da34cab5429bb5e8';
    return this.http.get(this.urlconsulta);

  }


  getPaymentByClientId(client_id: number) {
    return this.http.get(
      `${this.baseUrl}/getPaymentByClientId.php?client_id=${client_id}`
    );
  }


  //services para reutilizar

  
}

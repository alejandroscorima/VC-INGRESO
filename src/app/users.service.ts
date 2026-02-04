import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from './user';
import { environment } from '../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private baseUrl = environment.baseUrl;
  private reniecApiUrl = 'https://my.apidev.pro/api/dni';

  // BehaviorSubject para centralizar el estado del usuario
  private userSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  // ==================== USERS CRUD ====================

  getAllUsers(): Observable<any> {
    return this.api.getRaw('getAllUsers.php');
  }

  getUser(username_system: string, password_system: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/getUser.php`, { username_system, password_system });
  }

  getUserById(user_id: number): Observable<any> {
    return this.api.getRaw('getUserById.php', { user_id });
  }

  setUsr(user: User): void {
    this.userSubject.next(user);
  }

  getUsr(): User | null {
    return this.userSubject.getValue();
  }

  getUserByDocNumber(doc_number: string): Observable<any> {
    return this.api.getRaw('getUserByDocNumber.php', { doc_number });
  }

  getUsersByBirthday(fecha_cumple: string): Observable<any> {
    return this.api.getRaw('getUsersByBirthday.php', { fecha_cumple });
  }

  getCollaboratorByUserId(user_id: number): Observable<any> {
    return this.api.getRaw('getCollaboratorByUserId.php', { user_id });
  }

  getPersonal(area_id: number): Observable<any> {
    return this.api.getRaw('getPersonal.php', { area_id });
  }

  addUser(u: User): Observable<any> {
    return this.api.post('postUser.php', u);
  }

  updateUser(u: User): Observable<any> {
    return this.api.put('updateUser.php', u);
  }

  getAreas(): Observable<any> {
    return this.api.getRaw('getAreas.php');
  }

  getSalas(): Observable<any> {
    return this.api.getRaw('getSalas.php');
  }

  getPrioridad(): Observable<any> {
    return this.api.getRaw('getPrioridad.php');
  }

  // ==================== PERSONS UNIFICADO ====================
  // Métodos consolidados de ClientesService + PersonalService
  // Usa endpoints /api/v1/users con filtros de status

  /**
   * Lista todas las personas (usuarios) con filtros opcionales
   */
  getPersons(params?: { 
    fecha_cumple?: string; 
    status?: string;
    house_id?: number;
  }): Observable<any> {
    return this.api.getRaw('api/v1/users', params);
  }

  /**
   * Obtiene persona por ID
   */
  getPersonById(user_id: number): Observable<any> {
    return this.api.getRaw('api/v1/users', { user_id });
  }

  /**
   * Busca persona por número de documento
   */
  getPersonByDocNumber(doc_number: string): Observable<any> {
    return this.api.getRaw('api/v1/users', { doc_number });
  }

  /**
   * Filtra personas por status de validación
   */
  getPersonsByStatus(status: 'PERMITIDO' | 'OBSERVADO' | 'DENEGADO'): Observable<any> {
    return this.api.getRaw('api/v1/users', { status });
  }

  /**
   * Obtiene cumpleaños del mes/día
   */
  getPersonsByBirthday(fecha_cumple: string): Observable<any> {
    return this.api.getRaw('api/v1/users/birthdays', { fecha_cumple });
  }

  /**
   * Obtiene personas por ID de casa
   */
  getPersonsByHouseId(house_id: number): Observable<any> {
    return this.api.getRaw('api/v1/users', { house_id });
  }

  /**
   * Crea una nueva persona
   */
  createPerson(person: Partial<User>): Observable<any> {
    return this.api.post('api/v1/users', person);
  }

  /**
   * Actualiza una persona
   */
  updatePerson(user_id: number, person: Partial<User>): Observable<any> {
    return this.api.put(`api/v1/users/${user_id}`, person);
  }

  /**
   * Elimina una persona (soft delete)
   */
  deletePerson(user_id: number): Observable<any> {
    return this.api.delete(`api/v1/users/${user_id}`);
  }

  // ==================== LEGACY COMPATIBILITY ====================
  // Métodos que serán eliminados después de la refactorización

  getClientes(fecha_cumple: string): Observable<any> {
    return this.api.getRaw('getAll.php', { fecha_cumple });
  }

  getClientsHB(fecha_cumple: string): Observable<any> {
    return this.api.getRaw('getClientsHB.php', { fecha_cumple });
  }

  getHistoryByDate(fecha: string, sala: string): Observable<any> {
    return this.api.getRaw('getHistoryByDate.php', { fecha, sala });
  }

  getHistoryByClient(fecha: string, sala: string, doc: string): Observable<any> {
    return this.api.getRaw('getHistoryByClient.php', { fecha, sala, doc });
  }

  getDestacados(): Observable<any> {
    return this.api.getRaw('getDestacados.php');
  }

  getClient(doc_number: string): Observable<any> {
    return this.api.getRaw('getClient.php', { doc_number });
  }

  addCliente(cliente: any): Observable<any> {
    return this.api.post('postClient.php', cliente);
  }

  deleteCliente(cliente: any): Observable<any> {
    return this.api.put('deleteClient.php', cliente);
  }

  updateClient(cliente: any): Observable<any> {
    return this.api.put('updateClient.php', cliente);
  }

  // ==================== RENIEC ====================

  /**
   * Consultar datos de RENIEC usando token desde environment
   */
  getUserFromReniec(doc_number: string): Observable<any> {
    const reniecToken = environment.reniecApiToken || '';
    const url = `${this.reniecApiUrl}/${doc_number}?api_token=${reniecToken}`;
    return this.http.get(url);
  }

  // ==================== PAYMENTS ====================

  getPaymentByClientId(client_id: number): Observable<any> {
    return this.api.getRaw('getPaymentByClientId.php', { client_id });
  }
}

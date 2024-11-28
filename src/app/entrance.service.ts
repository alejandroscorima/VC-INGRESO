import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { House } from './house';
import { Vehicle } from './vehicle';
import { ExternalVehicle } from './externalVehicle';

@Injectable({
  providedIn: 'root'
})
export class EntranceService {

  baseUrl = environment.baseUrl;

  constructor( private http: HttpClient ) { }

  getActivitiesByUser(user_id:number){
    return this.http.get(`${this.baseUrl}/getActivitiesByUser.php?user_id=${user_id}`);
  }

  getAllMachines(estado: string, campus: string) {
    return this.http.get(`${this.baseUrl}/getAllMachines.php?estado=${estado}&campus=${campus}`);
  }

  getMachineByRMT(rmt: string) {
    return this.http.get(`${this.baseUrl}/getMachineByRMT.php?rmt=${rmt}`);
  }

  getProblemsByType(tipo: string){
    return this.http.get(`${this.baseUrl}/getProblemsByType.php?tipo=${tipo}`);
  }

  getSolutionsByType(tipo: string){
    return this.http.get(`${this.baseUrl}/getSolutionsByType.php?tipo=${tipo}`);
  }

  getAreasByZone(zone: string) {
    return this.http.get(`${this.baseUrl}/getAreasByZone.php?zone=${zone}`);
  }

  getPersonsByHouseId(house_id: number) {
    return this.http.get(`${this.baseUrl}/getPersonsByHouseId.php?house_id=${house_id}`);
  }

  getVehiclesByHouseId(house_id: number) {
    return this.http.get(`${this.baseUrl}/getVehiclesByHouseId.php?house_id=${house_id}`);
  }

  getAllHouses() {
    return this.http.get(`${this.baseUrl}/getAllHouses.php`);
  }

  addHouse(house: House) {
    return this.http.post(`${this.baseUrl}/postHouse.php`, house);
  }

  updateHouse(house: House) {
    return this.http.put(`${this.baseUrl}/updateHouse.php`, house);
  }

  getAllVehicles() {
    return this.http.get(`${this.baseUrl}/getAllVehicles.php`);
  }

  addVehicle(vehicle: Vehicle) {
    return this.http.post(`${this.baseUrl}/postVehicle.php`, vehicle);
  }

  updateVehicle(vehicle: Vehicle) {
    return this.http.put(`${this.baseUrl}/updateVehicle.php`, vehicle);
  }

  getAllExternalVehicles() {
    return this.http.get(`${this.baseUrl}/getAllExternalVehicles.php`);
  }
  addExternalVehicle(externalVehicle: ExternalVehicle) {
    return this.http.post(`${this.baseUrl}/postExternalVehicle.php`, externalVehicle);
  }

  updateExternalVehicle(externalVehicle: ExternalVehicle) {
    return this.http.put(`${this.baseUrl}/updateExternalVehicle.php`, externalVehicle);
  }

  getAllAreas() {
    return this.http.get(`${this.baseUrl}/getAllAreas.php`);
  }

  getAreaById(area_id: number) {
    return this.http.get(`${this.baseUrl}/getAreaById.php?area_id=${area_id}`);
  }

/*   getCampusById(campus_id: number) {
    return this.http.get(`${this.baseUrl}/getCampusById.php?campus_id=${campus_id}`);
  } */

  getCampusActiveById(campus_id: number) {
    return this.http.get(`${this.baseUrl}/getCampusActiveById.php?campus_id=${campus_id}`);
  }

  getAllAccessPoints() {
    return this.http.get(`${this.baseUrl}/getAllAccessPoints.php`);
  }

  getCampusByZone(zone: string) {
    return this.http.get(`${this.baseUrl}/getCampusByZone.php?zone=${zone}`);
  }

  getIncPendientes(tipo_usuario: string, id_assigned:string, user_id:number, campus:string, area:string) {
    return this.http.get(`${this.baseUrl}/getIncPendientes.php?tipo_usuario=${tipo_usuario}&id_assigned=${id_assigned}&user_id=${user_id}&campus=${campus}&area=${area}`);
  }

  getIncProceso(tipo_usuario: string, id_assigned:string, user_id:number, campus:string, area:string) {
    return this.http.get(`${this.baseUrl}/getIncProceso.php?tipo_usuario=${tipo_usuario}&id_assigned=${id_assigned}&user_id=${user_id}&campus=${campus}&area=${area}`);
  }

  getIncFin(tipo_usuario: string, id_assigned:string, user_id:number, campus:string, area:string) {
    return this.http.get(`${this.baseUrl}/getIncFin.php?tipo_usuario=${tipo_usuario}&id_assigned=${id_assigned}&user_id=${user_id}&campus=${campus}&area=${area}`);
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
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

  getActivitiesByUser(user_id: number) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/activities-by-user?user_id=${user_id}`);
  }

  getAllMachines(estado: string, campus: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/machines?estado=${estado}&campus=${campus}`);
  }

  getMachineByRMT(rmt: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/machine-by-rmt?rmt=${rmt}`);
  }

  getProblemsByType(tipo: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/problems-by-type?tipo=${tipo}`);
  }

  getSolutionsByType(tipo: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/solutions-by-type?tipo=${tipo}`);
  }

  getAreasByZone(zone: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/areas-by-zone?zone=${zone}`);
  }

  getPersonsByHouseId(house_id: number) {
    return this.http.get(`${this.baseUrl}/api/v1/houses/${house_id}/members`);
  }

  getVehiclesByHouseId(house_id: number) {
    return this.http.get(`${this.baseUrl}/api/v1/vehicles/by-house?house_id=${house_id}`);
  }

  getAllHouses() {
    return this.http.get(`${this.baseUrl}/api/v1/houses`);
  }

  addHouse(house: House) {
    return this.http.post(`${this.baseUrl}/api/v1/houses`, house);
  }

  updateHouse(house: House) {
    return this.http.put(`${this.baseUrl}/api/v1/houses/${(house as any).house_id}`, house);
  }

  getAllVehicles() {
    return this.http.get(`${this.baseUrl}/api/v1/vehicles`);
  }

  addVehicle(vehicle: Vehicle) {
    return this.http.post(`${this.baseUrl}/api/v1/vehicles`, vehicle);
  }

  updateVehicle(vehicle: Vehicle) {
    return this.http.put(`${this.baseUrl}/api/v1/vehicles/${(vehicle as any).vehicle_id}`, vehicle);
  }

  getAllExternalVehicles() {
    return this.http.get(`${this.baseUrl}/api/v1/external-vehicles`);
  }

  addExternalVehicle(externalVehicle: ExternalVehicle) {
    return this.http.post(`${this.baseUrl}/api/v1/external-vehicles`, externalVehicle);
  }

  updateExternalVehicle(externalVehicle: ExternalVehicle) {
    return this.http.put(`${this.baseUrl}/api/v1/external-vehicles/${(externalVehicle as any).id}`, externalVehicle);
  }

  getAllAreas() {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/areas`);
  }

  getAreaById(area_id: number) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/areas`).pipe(
      map((arr: any) => Array.isArray(arr) ? arr.find((a: any) => a.id === area_id) : null)
    );
  }

  getCampusActiveById(campus_id: number) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/campus-active-by-id?campus_id=${campus_id}`);
  }

  getAllAccessPoints() {
    return this.http.get(`${this.baseUrl}/api/v1/access-logs/access-points`).pipe(
      map((r: any) => r?.data ?? r ?? [])
    );
  }

  getCampusByZone(zone: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/campus-by-zone?zone=${zone}`);
  }

  getIncPendientes(tipo_usuario: string, id_assigned: string, user_id: number, campus: string, area: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/inc-pendientes?tipo_usuario=${tipo_usuario}&id_assigned=${id_assigned}&user_id=${user_id}&campus=${campus}&area=${area}`);
  }

  getIncProceso(tipo_usuario: string, id_assigned: string, user_id: number, campus: string, area: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/inc-proceso?tipo_usuario=${tipo_usuario}&id_assigned=${id_assigned}&user_id=${user_id}&campus=${campus}&area=${area}`);
  }

  getIncFin(tipo_usuario: string, id_assigned: string, user_id: number, campus: string, area: string) {
    return this.http.get(`${this.baseUrl}/api/v1/catalog/inc-fin?tipo_usuario=${tipo_usuario}&id_assigned=${id_assigned}&user_id=${user_id}&campus=${campus}&area=${area}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

  getAllAreas() {
    return this.http.get(`${this.baseUrl}/getAllAreas.php`);
  }

  getAreaById(area_id: number) {
    return this.http.get(`${this.baseUrl}/getAreaById.php?area_id=${area_id}`);
  }

  getCampusById(campus_id: number) {
    return this.http.get(`${this.baseUrl}/getCampusById.php?campus_id=${campus_id}`);
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

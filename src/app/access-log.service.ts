import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AccessLogService {

  baseUrl = environment.baseUrl;

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) { }

  // ==================== ACCESS LOGS (API V1) ====================

  /**
   * Lista logs de acceso con filtros opcionales
   */
  getAccessLogs(params?: {
    fecha?: string;
    fecha_inicial?: string;
    fecha_final?: string;
    access_point?: string;
    user_id?: number;
    doc_number?: string;
  }): Observable<any> {
    return this.api.getRaw('api/v1/access-logs', params);
  }

  /**
   * Obtiene log por ID
   */
  getAccessLogById(access_log_id: number): Observable<any> {
    return this.api.getRaw('api/v1/access-logs', { access_log_id });
  }

  /**
   * Crea un nuevo log de acceso
   */
  createAccessLog(log: any): Observable<any> {
    return this.api.post('api/v1/access-logs', log);
  }

  /**
   * Actualiza un log de acceso (ej. registrar salida)
   */
  updateAccessLog(access_log_id: number, data: any): Observable<any> {
    return this.api.put(`api/v1/access-logs/${access_log_id}`, data);
  }

  // ==================== ACCESS POINTS ====================

  /**
   * Obtiene todos los puntos de acceso
   */
  getAllAccessPoints(): Observable<any> {
    return this.api.getRaw('api/v1/access-points');
  }

  /**
   * Obtiene punto de acceso por ID
   */
  getAccessPointById(ap_id: number): Observable<any> {
    return this.api.getRaw('api/v1/access-points', { ap_id });
  }

  // ==================== LEGACY COMPATIBILITY ====================
  // Métodos legacy que serán reemplazados

  getEntranceByRange(date_init: string, date_end: string): Observable<any> {
    return this.api.getRaw('getEntranceByRange.php', { date_init, date_end });
  }

  getHistoryByDate(fecha: string, sala: string): Observable<any> {
    return this.api.getRaw('getHistoryByDate.php', { fecha, sala });
  }

  getHistoryByRange(fecha_inicial: string, fecha_final: string, access_point: string): Observable<any> {
    return this.api.getRaw('getHistoryByRange.php', { fecha_inicial, fecha_final, access_point });
  }

  getHistoryByClient(fecha: string, sala: string, doc: string): Observable<any> {
    return this.api.getRaw('getHistoryByClient.php', { fecha, sala, doc });
  }
}

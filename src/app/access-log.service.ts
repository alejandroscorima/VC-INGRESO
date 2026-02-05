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

  /** Legacy: estadísticas de aforo (dashboard inicio) */
  getAforoStat(sala: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('getAforo.php', { sala, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }

  /** Legacy: estadísticas por distrito */
  getAddressStat(sala: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('getAddress.php', { sala, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }

  /** Legacy: total mensual */
  getTotalMonth(sala: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string): Observable<any[]> {
    return this.api.getRaw('getTotalMonth.php', { sala, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4 });
  }

  /** Legacy: total mensual (nuevo) */
  getTotalMonthNew(sala: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string): Observable<any[]> {
    return this.api.getRaw('getTotalMonthNew.php', { sala, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4 });
  }

  /** Legacy: estadísticas por hora */
  getHourStat(sala: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('getHours.php', { sala, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }

  /** Legacy: estadísticas por edad */
  getAgeStat(sala: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('getAge.php', { sala, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }
}

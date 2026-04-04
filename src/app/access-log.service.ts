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
    start_date?: string;
    end_date?: string;
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
    return this.api.getRaw('api/v1/access-logs/access-points');
  }

  /**
   * Obtiene punto de acceso por ID
   */
  getAccessPointById(ap_id: number): Observable<any> {
    return this.api.getRaw('api/v1/access-points', { ap_id });
  }

  /**
   * Estadísticas diarias (últimos 30 días por fecha y tipo)
   */
  getStatsDaily(): Observable<{ success: boolean; data: any[] }> {
    return this.api.getRaw('api/v1/access-logs/stats/daily');
  }

  // ==================== LEGACY COMPATIBILITY ====================
  // Métodos legacy que serán reemplazados

  getEntranceByRange(date_init: string, date_end: string): Observable<any> {
    return this.api.getRaw('api/v1/access-logs/entrance-by-range', { date_init, date_end });
  }

  getHistoryByDate(fecha: string, accessPoint: string): Observable<any> {
    return this.api.getRaw('api/v1/access-logs/history-by-date', { fecha, access_point: accessPoint });
  }

  getHistoryByRange(fecha_inicial: string, fecha_final: string, access_point: string): Observable<any> {
    return this.api.getRaw('api/v1/access-logs/history-by-range', { fecha_inicial, fecha_final, access_point });
  }

  /** Movimientos del mismo documento en un día y punto (tabla detalle historial). */
  getHistoryByDocumentDay(fecha: string, accessPoint: string, docNumber: string): Observable<any> {
    return this.api.getRaw('api/v1/access-logs/history-by-client', {
      fecha,
      access_point: accessPoint,
      doc: docNumber,
    });
  }

  /** Estadísticas de aforo (dashboard) */
  getAforoStat(accessPoint: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('api/v1/access-logs/aforo', { access_point: accessPoint, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }

  /** Estadísticas por distrito */
  getAddressStat(accessPoint: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('api/v1/access-logs/address', { access_point: accessPoint, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }

  /** Total mensual */
  getTotalMonth(accessPoint: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string): Observable<any[]> {
    return this.api.getRaw('api/v1/access-logs/total-month', { access_point: accessPoint, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4 });
  }

  /** Total mensual (nuevo) */
  getTotalMonthNew(accessPoint: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string): Observable<any[]> {
    return this.api.getRaw('api/v1/access-logs/total-month-new', { access_point: accessPoint, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4 });
  }

  /** Estadísticas por hora */
  getHourStat(accessPoint: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('api/v1/access-logs/hours', { access_point: accessPoint, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }

  /** Estadísticas por edad */
  getAgeStat(accessPoint: string, fechaInicio: string, fechaFin: string, fechaMes: string, mes: string, dia: string, fecha1: string, fecha2: string, fecha3: string, fecha4: string, fecha5: string): Observable<any[]> {
    return this.api.getRaw('api/v1/access-logs/age', { access_point: accessPoint, fechaInicio, fechaFin, fechaMes, mes, dia, fecha1, fecha2, fecha3, fecha4, fecha5 });
  }
}

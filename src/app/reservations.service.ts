import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { Reservation, TimeSlot } from './reservation';
import { ApiService } from './api.service';
import { AccessPoint } from './accessPoint';

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private baseUrl = environment.baseUrl;
  private apiUrl = `${this.baseUrl}/api/v1/reservations`;

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  /**
   * Lista todas las reservaciones con filtros
   */
  getReservations(params?: {
    access_point_id?: number;
    person_id?: number;
    house_id?: number;
    date?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<{ data: Reservation[], pagination: any }> {
    return this.api.getRaw('api/v1/reservations', params);
  }

  /**
   * Obtiene una reservación por ID
   */
  getReservationById(id: number): Observable<Reservation> {
    return this.api.getRaw(`api/v1/reservations/${id}`);
  }

  /**
   * Crea una nueva reservación
   */
  createReservation(reservation: Partial<Reservation>): Observable<Reservation> {
    return this.api.post('api/v1/reservations', reservation).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  /**
   * Actualiza una reservación
   */
  updateReservation(id: number, reservation: Partial<Reservation>): Observable<Reservation> {
    return this.api.put(`api/v1/reservations/${id}`, reservation).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  /**
   * Cambia el estado de una reservación
   */
  updateStatus(id: number, status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA'): Observable<Reservation> {
    return this.api.put(`api/v1/reservations/${id}/status`, { status }).pipe(
      map((res: any) => res?.data ?? res)
    );
  }

  /**
   * Elimina una reservación
   */
  deleteReservation(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  /**
   * Lista las áreas disponibles para reservación
   */
  getAreas(): Observable<AccessPoint[]> {
    return this.api.getRaw('api/v1/reservations/areas').pipe(
      map((res: any) => {
        const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        return list.map((a: any) => ({ ...a, ap_id: a.id ?? a.ap_id }));
      })
    );
  }

  /**
   * Consulta disponibilidad de un área
   */
  getAvailability(accessPointId: number, date: string): Observable<{ date: string; access_point_id: number; slots: TimeSlot[] }> {
    const params = {
      access_point_id: accessPointId,
      date
    };
    return this.api.getRaw('api/v1/reservations/availability', params);
  }

  /**
   * Obtiene reservaciones por fecha (para calendario)
   */
  getByDateRange(startDate: string, endDate: string, accessPointId?: number): Observable<Reservation[]> {
    let params: any = { start_date: startDate, end_date: endDate };
    if (accessPointId) {
      params.access_point_id = accessPointId;
    }
    return this.api.getRaw('api/v1/reservations', params).pipe(
      map((res: any) => (res && res.data) ? res.data : (Array.isArray(res) ? res : []))
    );
  }
}

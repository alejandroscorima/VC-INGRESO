import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService, ApiResponse } from '../api.service';
import { environment } from '../../environments/environment';

export interface PublicRegisterHouse {
  house_type: string;
  block_house: string;
  lot: number | null;
  apartment: string | null;
}

/** Casa devuelta por GET /api/v1/public/houses (para desplegables Mz/Lt/Apt) */
export interface HouseFromApi {
  house_id: number;
  house_type: string;
  block_house: string;
  lot: number;
  apartment: string | null;
}

export interface PublicRegisterOwner {
  type_doc: string;
  doc_number: string;
  first_name: string;
  paternal_surname: string;
  maternal_surname?: string;
  cel_number?: string;
  email?: string;
  /** Datos RENIEC/apidev para no reconsultar (persistir en persons) */
  gender?: string;
  birth_date?: string | null;
  address?: string | null;
  district?: string | null;
  province?: string | null;
  region?: string | null;
  civil_status?: string | null;
}

export interface PublicRegisterVehicle {
  license_plate: string;
  type_vehicle?: string;
  brand?: string;
  model?: string;
  color?: string;
  photo_url?: string | null;
}

export interface PublicRegisterPet {
  species: string;
  name: string;
  breed?: string;
  color?: string;
  age_years?: number | null;
  photo_url?: string | null;
}

export interface PublicRegisterPayload {
  house: PublicRegisterHouse;
  owners: PublicRegisterOwner[];
  vehicles: PublicRegisterVehicle[];
  pets: PublicRegisterPet[];
}

/** Respuesta del backend POST /api/v1/public/register */
export interface PublicRegisterResponseData {
  house_id: number;
  person_ids: number[];
  vehicle_ids: number[];
  pet_ids: number[];
  created_users?: Array<{ person_id: number; username_system: string; temporary_password: string }>;
}

export interface ReniecDniData {
  numero: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombre_completo?: string;
  fecha_nacimiento?: string;
  sexo?: string;
  direccion?: string;
  direccion_completa?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  [key: string]: unknown;
}

/**
 * Servicio para el registro público (sin login): envío del formulario
 * y consulta DNI a API externa RENIEC.
 */
@Injectable({
  providedIn: 'root'
})
export class PublicRegistrationService {

  /** URL base de la API de registro (mismo backend) */
  private get apiBase(): string {
    return environment.baseUrl;
  }

  /** API externa DNI (my.apidev.pro). Si requiere token, usar reniecApiToken. */
  private readonly reniecDniUrl = 'https://my.apidev.pro/api/dni';

  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {}

  /**
   * Lista todas las casas para los desplegables Mz / Lote / Departamento.
   * GET /api/v1/public/houses (no requiere auth).
   */
  getHouses(): Observable<ApiResponse<HouseFromApi[]>> {
    return this.api.get<HouseFromApi[]>('api/v1/public/houses');
  }

  /**
   * Envía el formulario completo al backend.
   * POST /api/v1/public/register (no requiere auth).
   */
  register(payload: PublicRegisterPayload): Observable<ApiResponse<PublicRegisterResponseData>> {
    return this.api.post<PublicRegisterPayload>('api/v1/public/register', payload);
  }

  /**
   * Consulta datos por DNI en la API externa.
   * Rellena first_name, paternal_surname, maternal_surname (y doc_number).
   */
  getDniData(docNumber: string): Observable<ReniecDniData | null> {
    const num = (docNumber || '').trim();
    if (!num || num.length < 8) {
      return of(null);
    }
    const url = `${this.reniecDniUrl}/${num}`;
    const headers: Record<string, string> = {};
    if (environment.reniecApiToken) {
      headers['Authorization'] = `Bearer ${environment.reniecApiToken}`;
    }
    return this.http.get<{ success: boolean; data?: ReniecDniData }>(url, { headers }).pipe(
      map(res => (res?.success && res?.data) ? res.data : null),
      catchError(() => of(null))
    );
  }
}

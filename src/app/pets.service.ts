import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Pet } from './pet';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PetsService {
  private baseUrl = environment.baseUrl;
  private apiUrl = `${this.baseUrl}/api/v1/pets`;

  constructor(
    private http: HttpClient,
    private api: ApiService
  ) {}

  /**
   * Lista todas las mascotas con filtros opcionales
   */
  getPets(params?: {
    owner_id?: number;
    status?: string;
    species?: string;
  }): Observable<Pet[]> {
    return this.api.getRaw('api/v1/pets', params);
  }

  /**
   * Obtiene una mascota por ID
   */
  getPetById(id: number): Observable<Pet> {
    return this.api.getRaw(`api/v1/pets/${id}`);
  }

  /**
   * Obtiene las mascotas de un propietario
   */
  getPetsByOwnerId(owner_id: number): Observable<Pet[]> {
    return this.api.getRaw(`api/v1/pets/person/${owner_id}`);
  }

  /**
   * Crea una nueva mascota
   */
  createPet(pet: Partial<Pet>): Observable<Pet> {
    return this.api.post('api/v1/pets', pet);
  }

  /**
   * Actualiza una mascota
   */
  updatePet(id: number, pet: Partial<Pet>): Observable<Pet> {
    return this.api.put(`api/v1/pets/${id}`, pet);
  }

  /**
   * Elimina una mascota
   */
  deletePet(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  /**
   * Cambia el estado de validación de una mascota
   */
  validatePet(id: number, status: 'PERMITIDO' | 'OBSERVADO' | 'DENEGADO', reason?: string): Observable<Pet> {
    return this.api.put(`api/v1/pets/${id}/validate`, { status_validated: status, status_reason: reason });
  }

  /**
   * Sube una foto de la mascota
   */
  uploadPetPhoto(petId: number, photo: File): Observable<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('photo', photo);
    return this.http.post<{ photo_url: string }>(`${this.apiUrl}/${petId}/photo`, formData);
  }
}

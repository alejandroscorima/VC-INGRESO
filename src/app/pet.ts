/**
 * Modelo de Mascota para VC-INGRESO
 */
export interface Pet {
  id?: number;
  name: string;
  species: 'PERRO' | 'GATO' | 'AVE' | 'OTRO';
  breed: string;
  color: string;
  age_years?: number;
  /** Casa a la que pertenece la mascota (gestión principal) */
  house_id: number;
  /** Dueño opcional (persona: residente, inquilino, visita) */
  owner_id?: number;
  block_house?: string;
  lot?: number;
  apartment?: string;
  photo_url?: string;
  status_validated: 'PERMITIDO' | 'OBSERVADO' | 'DENEGADO';
  status_reason?: string;
  microchip_id?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Especie de mascota
 */
export const PET_SPECIES = [
  { value: 'PERRO', label: 'Perro' },
  { value: 'GATO', label: 'Gato' },
  { value: 'AVE', label: 'Ave' },
  { value: 'OTRO', label: 'Otro' }
];

/**
 * Estados de validación
 */
export const PET_STATUS = [
  { value: 'PERMITIDO', label: 'Permitido', color: 'green' },
  { value: 'OBSERVADO', label: 'Observado', color: 'orange' },
  { value: 'DENEGADO', label: 'Denegado', color: 'red' }
];

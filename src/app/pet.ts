/**
 * Modelo de Mascota para VC-INGRESO
 */
export interface Pet {
  id?: number;
  name: string;
  species: 'DOG' | 'CAT' | 'BIRD' | 'OTHER';
  breed: string;
  color: string;
  owner_id: number;
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
  { value: 'DOG', label: 'Perro' },
  { value: 'CAT', label: 'Gato' },
  { value: 'BIRD', label: 'Ave' },
  { value: 'OTHER', label: 'Otro' }
];

/**
 * Estados de validación
 */
export const PET_STATUS = [
  { value: 'PERMITIDO', label: 'Permitido', color: 'green' },
  { value: 'OBSERVADO', label: 'Observado', color: 'orange' },
  { value: 'DENEGADO', label: 'Denegado', color: 'red' }
];

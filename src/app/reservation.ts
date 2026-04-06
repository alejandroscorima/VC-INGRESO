/**
 * Modelo de Reservación para VC-INGRESO
 */
export interface Reservation {
  id?: number;
  access_point_id: number;
  person_id?: number;
  house_id: number;
  reservation_date: string;
  end_date?: string;
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'RECHAZADA' | 'COMPLETADA';
  observation?: string;
  num_guests?: number;
  contact_phone?: string;
  created_by_user_id?: number;
  created_at?: string;
  updated_at?: string;
  // Joined fields
  area_name?: string;
  area_type?: string;
}

/**
 * Estados de reservación
 */
export const RESERVATION_STATUS = [
  { value: 'PENDIENTE', label: 'Pendiente', color: 'warn' },
  { value: 'CONFIRMADA', label: 'Confirmada', color: 'primary' },
  { value: 'CANCELADA', label: 'Cancelada', color: 'accent' },
  { value: 'RECHAZADA', label: 'Rechazada', color: 'warn' },
  { value: 'COMPLETADA', label: 'Completada', color: 'basic' }
];

/**
 * Tipo lógico de punto de acceso (catálogo access_points)
 */
export const AREA_TYPES = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'AREA_COMUN', label: 'Área común' },
  { value: 'AREA_LIMITADA', label: 'Área limitada' }
];

/**
 * Horario disponible
 */
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

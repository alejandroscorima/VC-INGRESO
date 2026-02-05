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
  status: 'PENDIENTE' | 'CONFIRMADA' | 'CANCELADA' | 'COMPLETADA';
  observation?: string;
  num_guests?: number;
  contact_phone?: string;
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
  { value: 'COMPLETADA', label: 'Completada', color: 'basic' }
];

/**
 * Tipo de área
 */
export const AREA_TYPES = [
  { value: 'CASA_CLUB', label: 'Casa Club' },
  { value: 'PISCINA', label: 'Piscina' },
  { value: 'OTRO', label: 'Otro' }
];

/**
 * Horario disponible
 */
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

/**
 * Definición única de roles (`users.role_system` / JWT) para alinear front y back.
 *
 * ## Staff
 * - **ADMINISTRADOR**: administración global.
 * - **OPERARIO**: portería / escaneo / historial según API.
 * Domicilio (`house_id`) no es obligatorio para staff.
 *
 * ## Vecino
 * - **USUARIO**: Mi casa, QR, datos acotados a su(s) casa(s).
 *
 * `persons.person_type` (PROPIETARIO, RESIDENTE, INQUILINO, INVITADO) define el vínculo al hogar;
 * INVITADO no debe tener fila en `users` (sin login).
 */
export const ROLE_SYSTEM_VALUES = ['USUARIO', 'OPERARIO', 'ADMINISTRADOR'] as const;

export const STAFF_ROLE_SYSTEM_VALUES = ['ADMINISTRADOR', 'OPERARIO'] as const;

export const NEIGHBOR_ROLE_SYSTEM_VALUES = ['USUARIO'] as const;

export type StaffRoleSystem = (typeof STAFF_ROLE_SYSTEM_VALUES)[number];
export type NeighborRoleSystem = (typeof NEIGHBOR_ROLE_SYSTEM_VALUES)[number];

export function isStaffRoleSystemValue(role: string | null | undefined): boolean {
  const r = String(role ?? '').trim().toUpperCase();
  return (STAFF_ROLE_SYSTEM_VALUES as readonly string[]).includes(r);
}

export function isNeighborRoleSystemValue(role: string | null | undefined): boolean {
  const r = String(role ?? '').trim().toUpperCase();
  return (NEIGHBOR_ROLE_SYSTEM_VALUES as readonly string[]).includes(r);
}

/** USUARIO con vínculo de hogar para lógica "vecino" (excluye INVITADO). */
export function isResidentPersonType(personType: string | null | undefined): boolean {
  const p = String(personType ?? '').trim().toUpperCase();
  return p === 'PROPIETARIO' || p === 'RESIDENTE' || p === 'INQUILINO';
}

/**
 * Definición única de roles (`users.role_system` / JWT) para alinear front y back.
 *
 * ## Staff (personal del condominio)
 * Historial y dashboard **globales**, gestión de usuarios/casas/puntos según permisos del API.
 * - **ADMIN** / **ADMINISTRADOR**: administración de la aplicación.
 * - **OPERARIO** / **GUARDIA**: operación en portería (escaneo, registros de acceso).
 *
 * Domicilio (`house_id`) **no es obligatorio** para estos roles al dar de alta un usuario.
 *
 * ## Vecino
 * - **USUARIO**: acceso a Mi casa, QR de ingreso (si tiene `person_id`), historial y reservas
 *   **acotados a su(s) domicilio(s)** en el backend.
 *
 * Otros valores legacy deben migrarse a esta lista; el API (`auth_middleware` / controladores)
 * es la fuente de verdad para permisos finos.
 */
export const STAFF_ROLE_SYSTEM_VALUES = ['ADMIN', 'ADMINISTRADOR', 'OPERARIO', 'GUARDIA'] as const;

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

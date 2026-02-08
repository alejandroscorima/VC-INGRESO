# Modelo de datos y endpoints (post-migración)

## users vs persons vs house_members

| Concepto | Descripción |
|----------|-------------|
| **persons** | Identidad real: todas las personas (propietarios, residentes, visitas). Sin usuario/contraseña. Usadas en access_logs, reservations, pets.owner_id, vehicles.owner_id. |
| **users** | Solo autenticación y permisos del sistema (login). Tienen `person_id` → una persona real. `house_id` está **deprecado**; las casas accesibles se obtienen desde **house_members**. |
| **house_members** | Fuente de verdad: pertenencia persona ↔ casa. Campos: house_id, person_id, relation_type (PROPIETARIO, RESIDENTE, INQUILINO, FAMILIAR, APODERADO, etc.), is_active, is_primary. |

Regla: **Todos son persons; solo algunos son users.** Operación (ingresos, reservas, dueños) usa persons; vistas y permisos usan users + house_members.

## House-centric: assets y “Mi Casa”

- **pets** y **vehicles**: Tienen `house_id` obligatorio. Pertenecen a la casa. `owner_id` es opcional (responsable); si se asigna, debe ser un miembro activo de esa casa (house_members).
- **Mi Casa**: user → person_id → house_members (is_active=1) → house(s). Para cada casa se listan miembros (house_members + persons), pets por house_id, vehicles por house_id.

## Temporales

- **temporary_visits** / **temporary_access_logs**: visitas temporales (taxis, delivery, mudanza). No crean users. Opcionalmente pueden vincularse a una casa.

## Permisos house-centric (backend)

- **Helper** `server/helpers/house_permissions.php`: `canAccessHouse($pdo, $auth, $houseId)` (ADMIN o miembro activo en house_members), `validateOwnerInHouse($pdo, $houseId, $ownerId)` (owner_id debe ser miembro activo de la casa).
- **Pets / Vehicles / Reservations**: crear, editar, eliminar y en algunos casos listar por casa exigen que el usuario sea ADMIN o miembro activo de esa casa. Si no, se responde **403**.
- **owner_id** en pets/vehicles: si se envía, se valida que la persona sea miembro activo de la misma casa; si no, **400**.

## Endpoints renombrados / nuevos

| Antes / confuso | Nuevo / a usar | Notas |
|------------------|----------------|-------|
| getPersonsByHouseId (devuelve **users** por casa) | **GET /api/v1/houses/:id/members** | Devuelve **persons** + relation_type desde house_members. |
| — | Login (getUser.php) retorna **user** + **person** + **my_houses** | my_houses desde house_members; fallback a user.house_id legacy. |
| — | Token incluye **person_id** (si existe) | Para permisos y “Mi Casa” por membership. |

## Lista de endpoints relevantes (API v1)

- **GET /api/v1/houses** – Listar casas.
- **GET /api/v1/houses/:id** – Una casa.
- **GET /api/v1/houses/:id/members** – Miembros de la casa (house_members + persons). Reemplazo conceptual de getPersonsByHouseId.
- **GET /api/v1/persons** – Listar personas.
- **GET /api/v1/vehicles/by-house?house_id=** – Vehículos por casa.
- **GET /api/v1/pets** (filtro house_id) – Mascotas por casa.
- **GET /api/v1/reservations** – Reservas (filtro person_id, house_id).
- **GET /api/v1/access-logs** – Logs de acceso (auditoría: created_by_user_id).

## Formulario registro público (producción)
- Consulta DNI con apidev solo para rellenar nombres en pantalla; **no se persisten** gender, birth_date, address, district, province, region de esa API en `persons`.
- En `users`: type_doc, doc_number, first_name, etc. son legacy; cuando existe `person_id` los datos de identidad se obtienen de `persons`. Crear usuario desde persona: **POST /api/v1/users/from-person** (person_id, username_system, password_system, role_system).

## Auditoría

- **access_logs**: `created_by_user_id` = guardia/operario que registró el ingreso/egreso.
- **reservations**: `created_by_user_id` = quien creó la reserva.
- **pets / vehicles**: Opcionalmente `created_by_user_id`, `updated_by_user_id`.

## Tests obligatorios (checklist)

1. Propietario y residente de la misma casa ven los mismos pets y vehicles (por house_id).
2. Admin sin casa puede operar el panel (role_system=ADMINISTRADOR, sin house_members).
3. Guardia/operario al registrar access_logs deja registrado created_by_user_id.
4. No se permite asignar owner_id en pet/vehicle a una persona que no sea miembro activo de esa casa (validación en backend).
5. Persona en persons puede obtener login creando/activando un user con user.person_id y users.is_active=1.

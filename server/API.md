# API REST v1 – VC-INGRESO

Base URL: `/api/v1/`. Autenticación: cabecera `Authorization: Bearer <token>` (JWT) en endpoints que usan `requireAuth()`.

Patrón común para CRUD: `GET` listar, `GET /:id` obtener uno, `POST` crear (body JSON), `PUT /:id` actualizar (body JSON), `DELETE /:id` eliminar.

---

## Users

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/users | Listar usuarios |
| GET | /api/v1/users/:id | Obtener usuario por user_id |
| POST | /api/v1/users | Crear usuario (body JSON) |
| PUT | /api/v1/users/:id | Actualizar usuario |
| DELETE | /api/v1/users/:id | Eliminar usuario |
| GET | /api/v1/users/by-birthday?fecha_cumple=MM-DD | Usuarios con cumpleaños ese día (incl. block_house, lot) |

---

## Houses

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/houses | Listar casas |
| GET | /api/v1/houses/:id | Obtener casa por house_id |
| POST | /api/v1/houses | Crear casa |
| PUT | /api/v1/houses/:id | Actualizar casa |
| DELETE | /api/v1/houses/:id | Eliminar casa |

---

## Vehicles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/vehicles | Listar vehículos |
| GET | /api/v1/vehicles/:id | Obtener vehículo |
| POST | /api/v1/vehicles | Crear vehículo |
| PUT | /api/v1/vehicles/:id | Actualizar vehículo |
| DELETE | /api/v1/vehicles/:id | Eliminar vehículo |
| GET | /api/v1/vehicles/by-house?house_id=:id | Vehículos por casa |

---

## Persons

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/persons | Listar personas |
| GET | /api/v1/persons/:id | Obtener persona por id |
| POST | /api/v1/persons | Crear persona |
| PUT | /api/v1/persons/:id | Actualizar persona |
| DELETE | /api/v1/persons/:id | Eliminar persona |
| GET | /api/v1/persons/by-doc-number?doc_number= | Por documento |
| GET | /api/v1/persons/observed | Personas observadas |
| GET | /api/v1/persons/restricted | Personas restringidas |
| PUT | /api/v1/persons/:id/validate | Cambiar estado validación (body: status_validated, status_reason) |

---

## External vehicles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/external-vehicles | Listar |
| GET | /api/v1/external-vehicles/:id | Obtener uno |
| POST | /api/v1/external-vehicles | Crear |
| PUT | /api/v1/external-vehicles/:id | Actualizar |
| DELETE | /api/v1/external-vehicles/:id | Eliminar |

---

## Pets (mascotas – gestión por house_id)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/pets | Listar (query: house_id, owner_id, status, species) |
| GET | /api/v1/pets/:id | Obtener una (incl. block_house, lot) |
| GET | /api/v1/pets/person/:person_id | Mascotas de un propietario |
| POST | /api/v1/pets | Crear (body: name, species, house_id obligatorios; owner_id opcional) |
| PUT | /api/v1/pets/:id | Actualizar |
| PUT | /api/v1/pets/:id/validate | Cambiar estado (body: status_validated, status_reason) |
| POST | /api/v1/pets/:id/photo | Subir foto (multipart/form-data: photo) |
| DELETE | /api/v1/pets/:id | Eliminar |

---

## Access logs

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/access-logs | Listar (query: access_point_id, person_id, type, date, start_date, end_date, page, limit) |
| GET | /api/v1/access-logs/:id | Obtener uno |
| POST | /api/v1/access-logs | Crear registro (body JSON) |
| GET | /api/v1/access-logs/access-points | Listar puntos de acceso |
| GET | /api/v1/access-logs/stats/daily | Estadísticas diarias |

---

## Reservations

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/reservations | Listar (query: access_point_id, person_id, house_id, date, start_date, end_date, status) |
| GET | /api/v1/reservations/:id | Obtener una |
| POST | /api/v1/reservations | Crear |
| PUT | /api/v1/reservations/:id | Actualizar |
| PUT | /api/v1/reservations/:id/status | Cambiar estado |
| DELETE | /api/v1/reservations/:id | Eliminar |
| GET | /api/v1/reservations/areas | Áreas disponibles (access_points tipo PISCINA, CASA_CLUB) |
| GET | /api/v1/reservations/availability | Disponibilidad (query params según controller) |

---

## Respuestas

- Éxito: `{ "success": true, "data": ... }` o según controlador (Response::success / Response::json).
- Error: `{ "success": false, "error": "mensaje" }` con código HTTP 4xx/5xx.
- Listados suelen devolver `data` (array) y a veces `count`.

## Crear nuevos CRUD

1. Añadir tabla en `vc_create_database.sql` (y FK si aplica).
2. Crear `server/controllers/NombreController.php` (extender `Controller` para reutilizar getInput(), getDatabase(), create(), update(), delete(), findById()).
3. En `server/index.php` registrar rutas bajo `/api/v1/nombre-recurso` con el mismo patrón: `preg_match` para `recurso` y `recurso/:id`, switch por método (GET/POST/PUT/DELETE) y subrutas especiales antes del CRUD genérico.

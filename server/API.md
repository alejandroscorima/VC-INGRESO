# API REST v1 – VC-INGRESO

Base URL: `/api/v1/`. **Punto de entrada único:** `index.php` + `db_connection.php`. Ya no se usan archivos `.php` sueltos (legacy eliminado).

Autenticación: cabecera `Authorization: Bearer <token>` (JWT) en endpoints que usan `requireAuth()`. **Excepciones (sin auth):** `POST /api/v1/public/register`, `POST /api/v1/auth/login`.

Patrón común para CRUD: `GET` listar, `GET /:id` obtener uno, `POST` crear (body JSON), `PUT /:id` actualizar (body JSON), `DELETE /:id` eliminar.

---

## Auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/v1/auth/login | No | Login. Body: `{ "username_system", "password_system" }`. Retorna `{ user, person, my_houses, token }`. |

---

## Registro público (sin login)

Para el formulario de registro de propietarios (sin pasar por login).

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/v1/public/register | No | Crea vivienda + propietario(s) + vehículos + mascotas en una sola petición |

**Body JSON:**

```json
{
  "house": {
    "house_type": "CASA",
    "block_house": "A",
    "lot": 101,
    "apartment": null
  },
  "owners": [
    {
      "doc_number": "12345678",
      "first_name": "Juan",
      "paternal_surname": "Pérez",
      "maternal_surname": "García",
      "cel_number": "987654321",
      "email": "juan@email.com",
      "type_doc": "DNI"
    }
  ],
  "vehicles": [
    {
      "license_plate": "ABC-123",
      "type_vehicle": "AUTO",
      "brand": "Toyota",
      "color": "Blanco",
      "photo_url": null
    }
  ],
  "pets": [
    {
      "species": "PERRO",
      "name": "Max",
      "breed": "Labrador",
      "color": "Negro",
      "age_years": 3,
      "photo_url": null
    }
  ]
}
```

- **house**: obligatorio. `house_type`: CASA | DEPARTAMENTO | LOCAL COMERCIAL | OTRO. `block_house`, `lot` obligatorios; `apartment` opcional.
- **owners**: array con al menos un propietario. Obligatorios: `doc_number`, `first_name`, `paternal_surname`. Opcionales: `maternal_surname`, `cel_number`, `email`, `type_doc` (default DNI). No se permite repetir `doc_number`.
- **vehicles**: array opcional. Cada item requiere `license_plate`; opcionales: `type_vehicle`, `brand`, `color`, `photo_url`.
- **pets**: array opcional. Cada item requiere `name` y `species` (PERRO | GATO | AVE | OTRO); opcionales: `breed`, `color`, `age_years`, `photo_url`.

**Respuesta 201:** `{ "success": true, "data": { "house_id", "person_ids", "vehicle_ids", "pet_ids", "created_users" }, "message": "..." }`.

**Subida de fotos (registro público):** Para incluir `photo_url` en vehículos o mascotas, primero subir la imagen con los endpoints siguientes y luego enviar la URL devuelta en el payload de `POST /api/v1/public/register`.

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /api/v1/public/upload/vehicle-photo | No | Sube una foto de vehículo. Body: `multipart/form-data`, campo **photo** (archivo). Máx. 5 MB; formatos: JPG, PNG, GIF. |
| POST | /api/v1/public/upload/pet-photo | No | Sube una foto de mascota. Mismo formato que vehicle-photo. |

**Respuesta 200:** `{ "success": true, "photo_url": "/uploads/public/vehicles/xxx.jpg" }` (o `.../pets/xxx.jpg`).  
**Errores 400:** `{ "success": false, "error": "No se ha subido ninguna imagen" }`, `"Formato no permitido..."`, `"El archivo no debe superar 5 MB."`, etc.

Las URLs devueltas deben servirse como estáticos (proxy o alias `/uploads` en el servidor) para poder mostrar las imágenes en el sistema tras el login.

**RENIEC:** La consulta por DNI para autocompletar (nombre, apellidos, etc.) se hace desde el frontend a la API externa; el endpoint de registro solo recibe los datos ya completos. Ver sección [API RENIEC (consulta por DNI)](#api-reniec-consulta-por-dni) más abajo.

---

## API RENIEC (consulta por DNI)

API externa para autocompletar datos del propietario al ingresar el DNI. Ejemplo de uso: [my.apidev.pro](https://my.apidev.pro/api/dni/). La consulta se realiza desde el **frontend** (p. ej. al perder foco del campo DNI o con un botón “Buscar”).

**Petición (desde el frontend):**  
`GET https://my.apidev.pro/api/dni/{numero_dni}`  
(Revisar en la documentación del proveedor si requiere API key o cabeceras.)

**Respuesta de ejemplo (éxito):**

```json
{
  "success": true,
  "data": {
    "numero": "70416431",
    "nombre_completo": "OSCORIMA PALOMINO, MARTIN ALEJANDRO",
    "nombres": "MARTIN ALEJANDRO",
    "apellido_paterno": "OSCORIMA",
    "apellido_materno": "PALOMINO",
    "codigo_verificacion": 4,
    "fecha_nacimiento": "1999-03-30",
    "sexo": "MASCULINO",
    "estado_civil": "SOLTERO",
    "departamento": "AYACUCHO",
    "provincia": "HUAMANGA",
    "distrito": "AYACUCHO",
    "direccion": "JR. DOS DE MAYO 710",
    "direccion_completa": "JR. DOS DE MAYO 710, AYACUCHO - HUAMANGA - AYACUCHO",
    "ubigeo_reniec": "050101",
    "ubigeo_sunat": "050101",
    "ubigeo": ["05", "0501", "050101"]
  },
  "time": 0.060066938400268555
}
```

**Campos de `data` y uso en el formulario / `POST /api/v1/public/register`:**

| Campo RENIEC       | Uso en registro (owners[])     | Notas |
|--------------------|---------------------------------|--------|
| `numero`           | `doc_number`                   | DNI. |
| `nombres`          | `first_name`                   | Puede venir en mayúsculas; el usuario puede corregir. |
| `apellido_paterno` | `paternal_surname`             | |
| `apellido_materno` | `maternal_surname`             | |
| `fecha_nacimiento` | —                              | Opcional: guardar como `birth_date` si en el futuro persons/users lo usan. |
| `sexo`             | —                              | Opcional: mapear a `gender` (M/F u otro) si se usa. |
| `direccion` / `direccion_completa` | —                    | Opcional: dirección para perfiles. |
| `departamento`, `provincia`, `distrito` | —                      | Opcional: para ubicación. |

El formulario debe rellenar **doc_number**, **first_name**, **paternal_surname** y opcionalmente **maternal_surname** desde `data`; el usuario puede editar antes de enviar a `POST /api/v1/public/register`.

---

## Users

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/users | Listar usuarios |
| GET | /api/v1/users/:id | Obtener usuario por user_id |
| POST | /api/v1/users | Crear usuario (body JSON) |
| PUT | /api/v1/users/:id | Actualizar usuario |
| DELETE | /api/v1/users/:id | Eliminar usuario |
| POST | /api/v1/users/me/photo | **Auth.** Subir foto de perfil. Body: `multipart/form-data`, campo **photo**. Respuesta: usuario actualizado con `photo_url`. |
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
| POST | /api/v1/pets | Crear (body: name, species, house_id obligatorios; breed, color, age_years, owner_id, photo_url opcionales) |
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
| GET | /api/v1/access-logs/entrance-by-range | Reporte ingresos por día (query: date_init, date_end) |
| GET | /api/v1/access-logs/history-by-date | Por fecha y sala (query: fecha, sala) |
| GET | /api/v1/access-logs/history-by-range | Por rango (query: fecha_inicial, fecha_final, access_point) |
| GET | /api/v1/access-logs/history-by-client | Por cliente (query: fecha, sala, doc) |
| GET | /api/v1/access-logs/aforo | Reporte aforo (query: sala, fechaInicio, fechaFin, etc.) |
| GET | /api/v1/access-logs/address | Idem (alias) |
| GET | /api/v1/access-logs/total-month | Total mensual |
| GET | /api/v1/access-logs/total-month-new | Total mensual (nuevo) |
| GET | /api/v1/access-logs/hours | Por hora |
| GET | /api/v1/access-logs/age | Por edad |

---

## Catalog (áreas, salas, stubs)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/catalog/areas | Lista de áreas (access_points) |
| GET | /api/v1/catalog/salas | Lista de salas (access_points activos) |
| GET | /api/v1/catalog/prioridad | Prioridades (stub: []) |
| GET | /api/v1/catalog/collaborator | Por user_id (stub) |
| GET | /api/v1/catalog/personal | Por area_id (stub: []) |
| GET | /api/v1/catalog/payment-by-client | Por client_id (stub) |
| GET | /api/v1/catalog/activities-by-user | Stub [] |
| GET | /api/v1/catalog/machines | Stub [] |
| GET | /api/v1/catalog/inc-pendientes | Stub [] |
| GET | /api/v1/catalog/inc-proceso | Stub [] |
| GET | /api/v1/catalog/inc-fin | Stub [] |

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

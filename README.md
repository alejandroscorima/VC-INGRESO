# VC-INGRESO - Sistema de Control de Acceso Residencial

## Descripción General

**VC-INGRESO** es una aplicación web para gestión y control de acceso de personas y vehículos en condominios.

### Características Principales

- Control de acceso con validación de estado (PERMITIDO/OBSERVADO/DENEGADO)
- Gestión de residentes, visitantes y personal
- Administración de viviendas y vehículos
- Dashboard con estadísticas en tiempo real
- Sistema de autenticación con roles

---

## Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework**: Angular 18.2.11
- **UI**: Angular Material 17.3.10
- **Estilos**: Tailwind CSS 3.4.1
- **Gráficos**: Chart.js 4.4.7

#### Backend
- **Lenguaje**: PHP 8.2 (APIs RESTful)
- **Patrón**: MVC (Model-View-Controller)
- **Base de Datos**: MySQL
- **Servidor**: Apache/Docker

---

## Estructura del Proyecto

```
VC-INGRESO/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── api.service.ts        # Servicio HTTP unificado
│   │   ├── error.interceptor.ts  # Manejo de errores
│   │   ├── auth.service.ts       # Autenticación
│   │   ├── auth.interceptor.ts   # Bearer token
│   │   ├── users.service.ts     # Usuarios/personas
│   │   ├── access-log.service.ts
│   │   ├── pets.service.ts      # Mascotas
│   │   ├── reservations.service.ts
│   │   ├── pet.ts, reservation.ts, user.ts, accessPoint.ts
│   │   ├── pets/                 # Componente mascotas
│   │   ├── calendar/             # Calendario reservas Casa Club
│   │   ├── qr-scanner/           # Escáner QR puertas
│   │   ├── webcam/               # Captura de fotos
│   │   ├── history/, birthday/, users/, houses/, vehicles/
│   │   ├── my-house/, login/, settings/, inicio/, side-nav/
│   │   └── ...
│   └── environments/
│
├── server/                       # Backend PHP
│   ├── controllers/              # Controladores MVC
│   │   ├── Controller.php        # Clase base
│   │   ├── UserController.php    # Usuarios del sistema
│   │   ├── PersonController.php  # Personas (unificado)
│   │   ├── HouseController.php   # Viviendas
│   │   ├── VehicleController.php # Vehículos
│   │   ├── ExternalVehicleController.php
│   │   ├── PetController.php    # Mascotas
│   │   ├── AccessLogController.php  # Logs de acceso
│   │   └── ReservationController.php # Reservaciones
│   ├── utils/
│   │   ├── Response.php          # Respuestas JSON
│   │   └── Router.php            # Enrutamiento
│   ├── index.php                 # Entry point API
│   ├── vc_db.php                 # Conexión BD
│   └── auth_middleware.php       # JWT Auth
│
├── database/                     # Migraciones SQL
│   ├── access_logs_migration.sql # access_logs + access_points
│   ├── pets_migration.sql
│   └── reservations_migration.sql
├── plans/                        # Plan de trabajo y refactor
├── docker-compose.yml
└── README.md
```

---

## API REST v1

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **USERS** |
| GET | `/api/v1/users` | Listar usuarios |
| GET | `/api/v1/users/:id` | Usuario por ID |
| POST | `/api/v1/users` | Crear usuario |
| PUT | `/api/v1/users/:id` | Actualizar |
| DELETE | `/api/v1/users/:id` | Eliminar |
| **PERSONS** |
| GET | `/api/v1/persons` | Listar personas |
| GET | `/api/v1/persons/:id` | Persona por ID |
| GET | `/api/v1/persons/observed` | Solo OBSERVADOS |
| GET | `/api/v1/persons/restricted` | Solo DENEGADOS |
| POST | `/api/v1/persons` | Crear persona |
| PUT | `/api/v1/persons/:id` | Actualizar |
| PUT | `/api/v1/persons/:id/validate` | Cambiar estado |
| DELETE | `/api/v1/persons/:id` | Eliminar |
| **HOUSES** |
| GET | `/api/v1/houses` | Listar viviendas |
| POST | `/api/v1/houses` | Crear vivienda |
| PUT | `/api/v1/houses/:id` | Actualizar |
| DELETE | `/api/v1/houses/:id` | Eliminar |
| **VEHICLES** |
| GET | `/api/v1/vehicles` | Listar vehículos |
| POST | `/api/v1/vehicles` | Crear vehículo |
| PUT | `/api/v1/vehicles/:id` | Actualizar |
| DELETE | `/api/v1/vehicles/:id` | Eliminar |
| **EXTERNAL-VEHICLES** |
| GET | `/api/v1/external-vehicles` | Listar externos |
| POST | `/api/v1/external-vehicles` | Crear |
| PUT | `/api/v1/external-vehicles/:id` | Actualizar |
| DELETE | `/api/v1/external-vehicles/:id` | Eliminar |
| **PETS** |
| GET | `/api/v1/pets` | Listar mascotas |
| GET | `/api/v1/pets/:id` | Mascota por ID |
| GET | `/api/v1/pets/person/:person_id` | Mascotas de un propietario |
| POST | `/api/v1/pets` | Crear mascota |
| PUT | `/api/v1/pets/:id` | Actualizar |
| PUT | `/api/v1/pets/:id/validate` | Cambiar estado |
| POST | `/api/v1/pets/:id/photo` | Subir foto |
| DELETE | `/api/v1/pets/:id` | Eliminar |
| **ACCESS-LOGS** |
| GET | `/api/v1/access-logs` | Listar logs de acceso |
| GET | `/api/v1/access-logs/:id` | Log por ID |
| POST | `/api/v1/access-logs` | Crear registro |
| GET | `/api/v1/access-logs/access-points` | Listar puntos de acceso |
| GET | `/api/v1/access-logs/stats/daily` | Estadísticas diarias |
| **RESERVATIONS** |
| GET | `/api/v1/reservations` | Listar reservaciones |
| GET | `/api/v1/reservations/:id` | Obtener reservación |
| POST | `/api/v1/reservations` | Crear reservación |
| PUT | `/api/v1/reservations/:id` | Actualizar reservación |
| PUT | `/api/v1/reservations/:id/status` | Cambiar estado |
| DELETE | `/api/v1/reservations/:id` | Eliminar reservación |
| GET | `/api/v1/reservations/areas` | Listar áreas disponibles |
| GET | `/api/v1/reservations/availability` | Consultar disponibilidad |

### Estados de Validación (Persons)

| Estado | Significado |
|--------|-------------|
| `PERMITIDO` | Acceso normal (default) |
| `OBSERVADO` | Requiere atención especial |
| `DENEGADO` | Sin acceso |

---

## Instalación

### Docker (Recomendado)

```bash
cp .env.example .env
docker compose up --build

# Backend: http://localhost:8080
# Frontend: http://localhost:4200
```

### Base de datos

Ejecutar las migraciones en `database/` en este orden (si las tablas base ya existen):

1. `access_logs_migration.sql` — crea `access_logs` y `access_points`
2. `pets_migration.sql` — crea `pets` (requiere tabla `persons`)
3. `reservations_migration.sql` — crea `reservations`

### Manual

```bash
# Frontend
npm install
ng serve

# Backend
# Colocar server/ en Apache
# Configurar .env
```

---

## Modelos de Datos

### Person (Persona)
```typescript
{
  id, doc_number, first_name, paternal_surname, maternal_surname,
  gender, birth_date, cel_number, email, address,
  status_validated: 'PERMITIDO' | 'OBSERVADO' | 'DENEGADO',
  status_reason, person_type, house_id, photo_url
}
```

### User (Usuario del Sistema)
```typescript
{
  user_id, doc_number, first_name, paternal_surname, email,
  role_system, username_system, house_id, status_validated
}
```

### House (Vivienda)
```typescript
{
  id, block_house, lot, apartment, status_system
}
```

### Vehicle (Vehículo)
```typescript
{
  id, license_plate, type_vehicle, house_id,
  status_validated, category_entry
}
```

### Pet (Mascota)
```typescript
{
  id, name, species: 'DOG'|'CAT'|'BIRD'|'OTHER',
  breed, color, owner_id, photo_url,
  status_validated: 'PERMITIDO'|'OBSERVADO'|'DENEGADO',
  status_reason, microchip_id
}
```

### AccessLog (Registro de Acceso)
```typescript
{
  id, access_point_id, person_id, doc_number,
  vehicle_id, type: 'INGRESO'|'EGRESO',
  observation, created_at
}
```

### AccessPoint (Punto de Acceso)
```typescript
{
  id, name, type, location, is_active,
  max_capacity, current_capacity
}
```

### Reservation (Reservación)
```typescript
{
  id, access_point_id, person_id, house_id,
  reservation_date, end_date,
  status: 'PENDIENTE'|'CONFIRMADA'|'CANCELADA'|'COMPLETADA',
  observation, num_guests, contact_phone,
  area_name, area_type
}
```

---

## Seguridad

- **Autenticación**: JWT (JSON Web Tokens)
- **Contraseñas**: Hasheadas con `password_hash()`
- **SQL Injection**: Prevenida con PDO prepared statements
- **CORS**: Configurado para desarrollo

---

## Licencia

MIT

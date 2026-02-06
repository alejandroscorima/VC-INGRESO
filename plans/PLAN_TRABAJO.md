# Plan de Trabajo VC-INGRESO

## Resumen del Proyecto

**VC-INGRESO** es un sistema de control de acceso residencial con:

**Entorno:** Las pruebas y el desarrollo se hacen con **docker-compose** para no romper dependencias del sistema operativo (Node, PHP, etc.). Ver README para `docker compose up --build`.

- **Frontend**: Angular 18.2.11 + Angular Material 17.3.10 + Tailwind CSS
- **Backend**: PHP 8.2 + MySQL + MVC
- **Autenticación**: JWT

Detalle del refactor frontend ya realizado: ver [REFACTORIZACION_FRONTEND.md](REFACTORIZACION_FRONTEND.md).

---

## Estado Actual – Completado

### Backend (PHP)

- **Controladores MVC** (todos en `server/controllers/`): `UserController`, `PersonController`, `HouseController`, `VehicleController`, `ExternalVehicleController`, `PetController`, `AccessLogController`, `ReservationController`.
- **Rutas en** `server/index.php`: users, houses, vehicles, persons (observed, restricted, validate), external-vehicles, **pets** (CRUD + photo + validate + byOwner), **access-logs** (CRUD + access-points + stats/daily), **reservations** (CRUD + areas + availability + status).
- **Autenticación**: Los controladores nuevos (`PetController`, `AccessLogController`, `ReservationController`) llaman a `requireAuth()` en sus métodos.
- **CORS**: Cabeceras y preflight OPTIONS enviados desde `server/index.php`; eliminado CORS duplicado de `.htaccess` para evitar `Access-Control-Allow-Origin` múltiple.
- **Conexión DB**: `server/db_connection.php` con `getDbConnection()` para controladores que no extienden `Controller`; `ReservationController` y `AccessLogController` reciben `$pdo` en el constructor desde `index.php`.
- **Namespaces y use**: `PetController`, `ReservationController`, `AccessLogController` con `namespace Controllers` y `use Utils\Response`, `use Utils\Router`; `Utils\Router::getParams()` implementado para parámetros de petición.

### Frontend (Angular)

- **Servicios**: `ApiService`, `AuthService` (con métodos migrados de cookies: `setItem`, `getItem`, `setToken`, etc.), `UsersService`, `AccessLogService`, `PetsService`, `ReservationsService`.
- **Componentes**: History, Birthday, Pets, Webcam; eliminación de `listas/` y `upload/`.
- **Modelos**: `user.ts`, `pet.ts`, `reservation.ts`, `accessPoint.ts`, `house.ts`, `vehicle.ts`, etc.
- **Rutas**: `/pets`, `/calendar`, `/scanner` definidas en `app-routing.module.ts`.
- **Calendar y Scanner**: `CalendarComponent` y `QrScannerComponent` (standalone) importados en `AppModule` (array `imports`); rutas `/calendar` y `/scanner` operativas.
- **Menú lateral**: Enlaces añadidos a Mascotas (`/pets`), Calendario (`/calendar`) y Escáner QR (`/scanner`) en `side-nav.component.html`.
- **CookieService**: Eliminado de `app.module.ts` y de `providers`; dependencia `ngx-cookie-service` eliminada de `package.json`; eliminado `cookies.service.spec.ts` (spec huérfano).
- **Interceptor de errores**: En respuestas HTTP 500 ya no se redirige a `/error` (ruta inexistente); se evita el error de rutas `NG04002`.
- **Accesibilidad**: Eliminado `aria-hidden` del `<aside>` del menú lateral para evitar el aviso de foco oculto a lectores de pantalla.
- **Material**: `MatInputModule` añadido a `CalendarComponent` para corregir el error "mat-form-field must contain a MatFormFieldControl".

### Base de datos (esquema unificado)

- **`database/Creación de tablas VC.sql`** actualizado: script único que recrea toda la DB con orden correcto de DROP/CREATE.
  - Tablas: `houses`, `users`, `access_points` (formato API: `id`, `name`, `type`, `location`, `is_active`, `max_capacity`, `current_capacity`), `persons`, `vehicles`, `temporary_visits`, `access_logs` (formato API: `id`, `access_point_id`, `person_id`, `type`, etc.), `temporary_access_logs` (usa `access_point_id`), `pets`, `reservations`.
  - Claves foráneas al final del script; INSERT inicial de `access_points` (Garita, Entrada Peatonal, Piscina, Casa Club).
- **`database/Relación Claves Foráneas VC.sql`** actualizado al nuevo esquema (`access_points.id`, `persons.id`, etc.).
- Migraciones `pets_migration.sql`, `reservations_migration.sql`, `access_logs_migration.sql` integradas conceptualmente en el script único; pueden seguir usándose como referencia.

### Limpieza realizada

- Eliminados: `clientes.service.ts`, `ludopatia.service.ts`, `personal.service.ts`, directorios `listas/`, `upload/`, `cookies.service.ts`.
- `AuthService` incluye métodos de almacenamiento (reemplazo de cookies); el login usa `AuthService.setToken()`.
- Eliminados: LudopataController, ClientController, ObservedPersonController; terminología ludopatas reemplazada por estado OBSERVADO.

---

## Pendientes – Prioridad alta

- [x] ~~Declarar `CalendarComponent` y `QrScannerComponent` en `AppModule`~~ — Hecho (standalone importados en `imports`).
- [x] ~~Eliminar `CookieService` y `ngx-cookie-service`; eliminar `cookies.service.spec.ts`~~ — Hecho.
- [x] ~~Añadir en el menú lateral enlaces a Mascotas, Calendario y Scanner~~ — Hecho.

---

## Pendientes – Prioridad media

- [ ] Completar **UI de Calendario** (reservas Casa Club) y de **QR Scanner** (puertas).
- [ ] **Dashboard Piscina** (aforo en tiempo real usando access-logs/access-points).
- [ ] Campo **`qr_code`** en tabla `persons` y endpoint generador de QR.
- [ ] **Formulario genérico** para registros futuros.
- [ ] Documentación **OpenAPI/Swagger**, tests unitarios backend.
- [ ] Crear interfaces tipadas para todas las respuestas; loading states globales; retry logic para llamadas fallidas.

---

## Pendientes – Seguridad y despliegue

- [ ] CSRF tokens.
- [ ] Rate limiting para API pública.
- [ ] HTTPS en despliegue.

---

## Estructura objetivo "Mi Casa"

Referencia de producto para el módulo Mi Casa:

```
mi-house/
├── residentes          # Persona con tipo RESIDENTE
├── visitas             # Persona con tipo VISITA
├── inquilinos          # Persona con tipo INQUILINO
├── vehiculos           # Vehículos asociados
├── vehiculos externos  # Visitas temporales
├── mascotas            # Mascotas
├── piscina             # Access point + aforo
├── garita              # Access point
├── formulario          # Registro genérico
└── casa-club           # Reservaciones (calendario)
```

---

## Referencia de endpoints API v1

Ver tabla completa en [README.md](../README.md#api-rest-v1). Resumen por recurso:

| Recurso | CRUD | Endpoints especiales |
|--------|------|------------------------|
| users | Sí | by-birthday |
| persons | Sí | observed, restricted, validate |
| houses | Sí | — |
| vehicles | Sí | by-house |
| external-vehicles | Sí | — |
| pets | Sí | person/:id, validate, photo |
| access-logs | List/Create/Show | access-points, stats/daily |
| reservations | Sí | areas, availability, status |

---

## Diagrama de estados de personas

```mermaid
stateDiagram-v2
    [*] --> PERMITIDO: Nueva persona
    PERMITIDO --> OBSERVADO: Reporte generado
    OBSERVADO --> PERMITIDO: Revision aprobada
    OBSERVADO --> DENEGADO: Incidente grave
    DENEGADO --> OBSERVADO: Apelacion aprobada
    DENEGADO --> PERMITIDO: Rehabilitacion
```

---

## Notas

- Mantener compatibilidad con endpoints legacy hasta que el frontend esté completamente migrado; usar feature flags si es necesario.
- **PENDIENTES.md queda sustituido por este documento.** No mantener información duplicada entre ambos; usar únicamente este archivo para estado y pendientes del proyecto.

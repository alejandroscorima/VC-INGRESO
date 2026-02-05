# Plan de Trabajo VC-INGRESO

## Resumen del Proyecto

**VC-INGRESO** es un sistema de control de acceso residencial con:

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

### Frontend (Angular)

- **Servicios**: `ApiService`, `AuthService` (con métodos migrados de cookies: `setItem`, `getItem`, `setToken`, etc.), `UsersService`, `AccessLogService`, `PetsService`, `ReservationsService`.
- **Componentes**: History, Birthday, Pets, Webcam; eliminación de `listas/` y `upload/`.
- **Modelos**: `user.ts`, `pet.ts`, `reservation.ts`, `accessPoint.ts`, `house.ts`, `vehicle.ts`, etc.
- **Rutas**: `/pets`, `/calendar`, `/scanner` definidas en `app-routing.module.ts`.

### Migraciones de base de datos

- `database/pets_migration.sql` — tabla `pets` (requiere `persons`).
- `database/reservations_migration.sql` — tabla `reservations`.
- `database/access_logs_migration.sql` — tablas `access_logs` y `access_points` (INSERT de `access_points` corregido con columnas `max_capacity` y `current_capacity`).

### Limpieza realizada

- Eliminados: `clientes.service.ts`, `ludopatia.service.ts`, `personal.service.ts`, directorios `listas/`, `upload/`, `cookies.service.ts`.
- `AuthService` incluye métodos de almacenamiento (reemplazo de cookies); el login usa `AuthService.setToken()`.
- Eliminados: LudopataController, ClientController, ObservedPersonController; terminología ludopatas reemplazada por estado OBSERVADO.

---

## Pendientes – Prioridad alta

- [ ] **Declarar `CalendarComponent` y `QrScannerComponent` en `AppModule`** (y crear template/HTML si faltan) para que las rutas `/calendar` y `/scanner` no fallen.
- [ ] **Eliminar `CookieService`** de `app.module.ts` y la dependencia `ngx-cookie-service` si no se usa en ningún otro sitio; eliminar o reescribir `src/app/cookies.service.spec.ts` (spec huérfano).
- [ ] (Opcional) **Añadir en el menú lateral** enlaces a Mascotas, Calendario y Scanner.

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

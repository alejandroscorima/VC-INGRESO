# Pendientes - VC-INGRESO

## Requerimientos del Cliente (Nuevos)

### Alta Prioridad
- [ ] Registro y gestion de Mascotas (tabla + CRUD)
- [ ] Eliminar residuos de "Ludopatas" y "VIP" del frontend
- [ ] Foto/captura desde dispositivo en Vehiculos y Mascotas
- [ ] Nuevo access point para Piscina (control de aforo)
- [ ] Modulo QR/Barcode por usuario para puertas

### Media Prioridad
- [ ] Modulo calendario para reservar Casa Club (centro de convenciones)
- [ ] Garita: control de ingreso con nuevo access point
- [ ] Formulario generico para registros futuros

---

## Backend (PHP)

### Alta Prioridad
- [ ] Agregar `requireAuth()` a todos los endpoints MVC en `index.php`
- [ ] Crear AccessLogController para registro de ingresos
- [ ] Crear PetController (mascotas)
- [ ] Crear ReservationController (casa club)
- [ ] Agregar campo `qr_code` a tabla persons
- [ ] Renombrar tabla `clients` → `persons` (con migracion)
- [ ] Eliminar tabla `ludopatas` (integrar a persons)

### Media Prioridad
- [ ] Endpoint generador de QR por persona
- [ ] Completar integracion de Router.php con index.php
- [ ] Swagger/OpenAPI para documentacion
- [ ] Tests unitarios para controllers

---

## Frontend (Angular)

### Alta Prioridad
- [ ] Renombrar `ClientesService` → `PersonsService`
- [ ] Renombrar `LudopatiaService` → `RestrictedPersonsService`
- [ ] Consolidar `UsersService` y `ClientesService` (duplicacion)
- [ ] Eliminar `CookieService` si no se usa
- [ ] Crear `PetsService`
- [ ] Crear `ReservationsService`
- [ ] Componente captura de fotos (Webcam)

### Media Prioridad
- [ ] Componente QR scanner para puertas
- [ ] Componente calendario para reservas
- [ ] Dashboard Piscina (aforo en tiempo real)
- [ ] Crear interfaces tipadas para todas las respuestas
- [ ] Agregar loading states globales
- [ ] Implementar retry logic para llamadas fallidas

---

## Seguridad

- [ ] CSRF tokens
- [ ] Rate limiting para API publica
- [ ] HTTPS en despliegue

---

## Limpieza General

- [ ] Eliminar endpoints legacy (getAll.php, etc.)
- [ ] Eliminar componentes no usados
- [ ] Actualizar imports en todos los componentes

---

## Estructura Mi Casa (pendiente)

```
mi-house/
├── residentes          # Persona con tipo RESIDENTE
├── visitas             # Persona con tipo VISITA
├── inquilinos          # Persona con tipo INQUILINO
├── vehiculos           # Vehicles asociados
├── vehiculos externos  # Temporary visits
├── mascotas            # Nueva funcionalidad
├── piscina             # Access point + aforo
├── garita              # Access point
├── formulario          # Registro generico
└── casa-club           # Reservaciones (calendario)
```

---

## Estado Actual

| Modulo | Estado |
|--------|--------|
| ApiService (frontend) | ✅ Completado |
| Error Interceptor | ✅ Completado |
| PersonController | ✅ Completado |
| UserController | ✅ Completado |
| HouseController | ✅ Completado |
| VehicleController | ✅ Completado |
| ExternalVehicleController | ✅ Completado |
| README.md | ✅ Actualizado |
| PENDIENTES.md | ✅ Actualizado |

---

## Eliminado (Legacy Casino)

- ❌ LudopataController
- ❌ ClientController  
- ❌ ObservedPersonController
- ✅ Terminologia ludopatas reemplazada por estado OBSERVADO

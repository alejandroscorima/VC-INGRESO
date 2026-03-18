# Mejoras implementadas y actualizadas

Este documento resume las mejoras y correcciones realizadas en el repositorio `VC-INGRESO`.

## Registro de fechas

- 2026-03-16: mejoras base (tablas, fotos, backend house members, domicilio en listados).
- 2026-03-18: actualización de carga de fotos en mascotas/vehículos y estandarización de modales.

## 1. Mi Casa - Tablas (Residentes, Inquilinos, Mascotas, Vehículos)

- Añadida columna `Foto` en las tablas de:
  - Residentes
  - Inquilinos
  - Mascotas
  - Vehículos

- Implementado rendering de foto en miniatura:
  - si existe `photo_url`: `<img class="photo-thumb" src="...">`
  - si no existe: placeholder circular `<div class="photo-avatar"><mat-icon>...</mat-icon></div>` en cada tabla con iconos:
    - Residentes/Inquilinos: `person`
    - Mascotas: `pets`
    - Vehículos: `directions_car`

- Acciones unificadas:
  - icono ojo `visibility` para previsualizar imagen con modal
  - icono lápiz `edit` para edición

## 2. Modal de vista de foto en `my-house`

- En `my-house.component.html`:
  - overlay: `.photo-view-overlay` (fixed 0, z-index alto, fondo semitransparente)
  - modal: `.photo-view-modal` + `.photo-view-header` + `.photo-view-img`
- Métodos en `my-house.component.ts`:
  - `openViewPhoto(item, title)`
  - `closeViewPhoto()`

## 3. Corrección de compile error TS2341 (propiedad `api`)

- En `my-house.component.ts`, constructor:
  - `private api: ApiService` → `public api: ApiService`

## 4. Ajuste de datos en backend de house members

- En `HouseController::members` (`server/controllers/HouseController.php`):
  - SELECT ahora incluye `p.photo_url` para:
    - `house_members` join persons
    - fallback persons by house_id
- Soluciona mostrar foto desde `persons.photo_url` (como en caso de Luis Gustavo)

## 5. Acompañamientos de `canAccessHouse` y house_id fallback (previamente)

- Se mejoró la lógica de acceso a casa para:
  - token house_id
  - cursus `house_members`
  - `persons.house_id` fallback

## 6. Vehicles – Domicilio (Mz/Lt/Dpto)

- Añadido en `vehicles.component.ts`:
  - método `getHouseLocation(v: Vehicle)` con:
    - busqueda de `house` en `this.houses`
    - fallback a `v.block_house` / `v.lot` / `v.apartment`
    - formato: `MZ:<m> LT:<l> DPTO:<d>` (solo si existe d)
    - uppercase con `toUpperCase()`
- Actualizado `vehicles.component.html`:
  - uso: `{{ getHouseLocation(v) }}`

## 7. Users - Domicilio y mayúsculas

- Añadido en `users.component.ts`:
  - método `getHouseLocation(u: User)` igual a vehículos.
- Actualizado `users.component.html`:
  - `{{ getHouseLocation(u) }}`
  - nombre en mayúscula, `toUpperCase()`.

## 8. Nuevo archivo generado

- `Mejoras.md` (este documento) contiene el resumen de trabajo del día.

## 9. Actualizacion 2026-03-18 - Mi Casa (Mascotas y Vehiculos)

- Se agrego en la columna `Acciones` de las tablas de Mascotas y Vehiculos un boton de camara para subir/actualizar foto.
- En `my-house.component.html`:
  - Se incorporaron inputs de tipo `file` por fila para mascotas y vehiculos.
  - Se enlazaron eventos `(change)` a metodos especificos para carga de imagen.
  - Se mantuvo el flujo de acciones existente (`visibility`, `edit`) y se sumo la accion de camara.
- En `my-house.component.ts`:
  - Se inyecto `PublicRegistrationService` para reutilizar el mismo flujo de subida de `public-registration`.
  - Se agregaron:
    - `onVehiclePhotoSelect(vehicleIndex, event)`
    - `onPetPhotoSelect(petIndex, event)`
  - Se agrego estado de carga por fila:
    - `uploadingVehicleIndex`
    - `uploadingPetIndex`

## 10. Actualizacion 2026-03-18 - Estandarizacion de modales

- Revisados y ajustados modales de crear/editar en:
  - Residentes
  - Inquilinos
  - Mascotas
  - Vehiculos
  - Visitas
  - Vehiculos Externos

- Correcciones principales:
  - Tipos de input inconsistentes:
    - `Celular` corregido a `type="text"` donde correspondia.
    - `Fecha de nacimiento` corregida a `type="date"` en edicion de visitas.
  - Titulo de modal corregido en `edit-user-modal` a "Editar usuario".
  - En visitas se ajusto categoria para usar `categories_visits`.

- Campos agregados/completados:
  - Vehiculos (nuevo/edicion): `Marca`, `Modelo`, `Color`.
  - Mascotas (nuevo/edicion): `Edad`, `Especie` (select), `Color` (select), `Estado`.
  - Residentes/Inquilinos: se homogeneizaron campos de `Usuario`, `Rol`, `Estado de Rol`, `Domicilio`.

- Listas de apoyo incorporadas en `my-house.component.ts`:
  - `vehicleColors`
  - `petColors`

## 11. Actualizacion 2026-03-18 - Modelo Vehicle

- Se actualizo `src/app/vehicle.ts` para incluir propiedades opcionales:
  - `brand`
  - `model`
  - `color`
- Se ajusto la inicializacion de `vehicleToAdd` y `vehicleToEdit` en `my-house.component.ts` para soportar estos campos.

## 12. Estado de validacion

- Verificacion de errores en:
  - `src/app/my-house/my-house.component.ts`
  - `src/app/my-house/my-house.component.html`
- Resultado: sin errores de compilacion reportados tras los cambios.

---

### Notas finales

- Se recomienda ejecutar `ng serve` o `npm test` tras estos cambios para validación UI y tests.
- Todas las ediciones se hicieron sobre la rama `main`.

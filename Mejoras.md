# Mejoras implementadas (fecha: 2026-03-16)

Este documento resume todas las mejoras y correcciones realizadas hoy en el repositorio `VC-INGRESO`.

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

---

### Notas finales

- Se recomienda ejecutar `ng serve` o `npm test` tras estos cambios para validación UI y tests.
- Todas las ediciones se hicieron sobre la rama `main`.

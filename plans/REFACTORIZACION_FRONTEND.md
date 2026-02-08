# Plan de Refactorización del Frontend Angular

## 📋 Resumen de Cambios Realizados

### ✅ Servicios Actualizados

| Servicio | Estado | Descripción |
|----------|--------|-------------|
| `UsersService` | ✅ Completado | Consolidado con métodos unificados para Users |
| `AccessLogService` | ✅ Completado | Actualizado con nueva API |

### ✅ Archivos Eliminados

| Archivo | Estado |
|---------|--------|
| `clientes.service.ts` | ✅ Eliminado |
| `ludopatia.service.ts` | ✅ Eliminado |
| `personal.service.ts` | ✅ Eliminado |
| `ludopata.ts` | ✅ Eliminado |
| `systemClient.ts` | ✅ Eliminado |
| `person.ts` | ✅ Eliminado |

### ✅ Componentes Actualizados

| Componente | Estado | Notas |
|------------|--------|-------|
| `HistoryComponent` | ✅ Completado | Usa AccessLogService |
| `BirthdayComponent` | ✅ Completado | Eliminado PersonalService |
| `ListrasComponent` | ⚠️ Pendiente | **Eliminado del scope** (ver nota) |

---

## 📝 Nota sobre ListrasComponent

**El componente `ListrasComponent` ha sido marcado para eliminación del scope** ya que:
- La funcionalidad de gestión de personas (observados/restringidos/permitidos) será reemplazada por una nueva interfaz
- Los métodos `getPersonsByStatus()` están disponibles en `UsersService`
- Se recomienda crear un nuevo componente `PersonsComponent` cuando se implemente la nueva UI

---

## 🛠️ Servicios Creados/Actualizados

### UsersService

```typescript
// src/app/users.service.ts

// Métodos CRUD
getAll(params?: {...})
getById(id: number)
getByDocNumber(doc_number: string)
getByStatus(status: 'PERMITIDO' | 'OBSERVADO' | 'DENEGADO')
getByBirthday(fecha_cumple: string)
getByHouseId(house_id: number)
create(person: Partial<User>)
update(id: number, person: Partial<User>)
delete(id: number)

// Legacy compatibility
getClientes()
getClient()
addCliente()
updateClient()
deleteCliente()
```

### AccessLogService

```typescript
// src/app/access-log.service.ts

// API v1
getAccessLogs(params?: {...})
getAccessLogById(id: number)
createAccessLog(log: any)
updateAccessLog(id: number, data: any)
getAllAccessPoints()
getAccessPointById(id: number)

// Legacy
getHistoryByDate()
getHistoryByRange()
getHistoryByClient()
```

---

## 🔄 Cambios en Componentes

### HistoryComponent ✅

```typescript
// ANTES
import { ClientesService } from "../clientes.service"
import { Person } from "../person"

// DESPUÉS
import { AccessLogService } from "../access-log.service"
import { User } from "../user"
```

### BirthdayComponent ✅

```typescript
// ANTES
import { PersonalService } from '../personal.service';
this.usersServices.getUsersByBirthday(fecha_cumple)

// DESPUÉS
this.usersServices.getPersonsByBirthday(fecha_cumple)
```

---

## 📊 Estado del Proyecto

```
Frontend Angular
├── Servicios
│   ├── UsersService        ✅
│   ├── AccessLogService    ✅
│   ├── AuthService        (existente)
│   ├── ApiService         (existente)
│   └── ErrorInterceptor   (existente)
├── Componentes
│   ├── HistoryComponent    ✅
│   ├── BirthdayComponent   ✅
│   ├── LoginComponent      (existente)
│   ├── UsersComponent      (existente)
│   ├── HousesComponent     (existente)
└── Modelos
    ├── User               ✅ (unificado)
    ├── Visit              (existente)
    ├── House              (existente)
    ├── Vehicle            (existente)
    └── AccessPoint       (existente)
```

----

Formulario de registro público (PublicRegistrationController.php): (*obligatorios) (cualquier campo opcional que no se llene ahora, se podrá actualizar en el sistema posterior al registro)
🔵 SECCIÓN 1 — REGISTRO DE PROPIETARIO PRINCIPAL
Tipo de Vivienda* (house_type)
Manzana* (block_house)
Lote* (lot)
Departamento (apartment)
---
Propietario Principal  (Ingresar los datos solamente del propietario, más adelante se podrá ingresar la información de residentes, inquilinos y visitantes en el sistema)

Tipo de Documento* (type_doc) DNI/CE/Otros
Num DNI/CE/Otros* (doc_number) (Si type_doc es DNI debe aparecer un botón luego del número para utilizar consulta a https://my.apidev.pro/api/dni/ para obtener estos datos, más info: API.md)
Apellidos* (paternal_surname+maternal_surname)
Nombres* (first_name)
Celular / Teléfono de contacto* (cel_number)
email* (email)

Pregunta: “¿Existe un segundo propietario?”

Sí → Ir a Sección 2

No → Ir a Sección 3

🔵 SECCIÓN 2 — SEGUNDO PROPIETARIO

Tipo de Documento* (type_doc) DNI/CE/Otros
Num DNI/CE/Otros* (doc_number) (Si type_doc es DNI debe aparecer un botón luego del número para utilizar consulta a https://my.apidev.pro/api/dni/ para obtener estos datos, más info: API.md)
Apellidos* (paternal_surname+maternal_surname)
Nombres* (first_name)
Celular / Teléfono de contacto* (cel_number)
email* (email)

Al finalizar → Ir a Sección 3

🔵 SECCIÓN 3 — ¿DESEA REGISTRAR VEHÍCULOS?

Sí → Ir a Sección 4 (Vehículo 1)

No → Ir a Sección 7 (¿Desea registrar mascotas?)

🔵 SECCIÓN 4 — PRIMER VEHÍCULO

Placa* (license_plate)
Tipo* (type_vehicle)
Marca* (brand)
Modelo* (model)
Color* (color)
Foto del vehículo (photo_url)

Pregunta: “¿Deseas agregar otro vehículo?”

Sí → Ir a Sección 5 (Vehículo 2)

No → Ir a Sección 7 (¿Registrar Mascotas?)

🔵 SECCIÓN 5 — SEGUNDO VEHÍCULO

Placa* (license_plate)
Tipo* (type_vehicle)
Marca* (brand)
Modelo* (model)
Color* (color)
Foto del vehículo (photo_url)

Pregunta: “¿Deseas agregar otro vehículo?”

Sí → Ir a Sección 6

No → Ir a Sección 7

🔵 SECCIÓN 6 — TERCER VEHÍCULO

Placa* (license_plate)
Tipo* (type_vehicle)
Marca* (brand)
Modelo* (model)
Color* (color)
Foto del vehículo (photo_url)

Finalizar sección → Ir a Sección 7

🔵 SECCIÓN 7 — ¿DESEA REGISTRAR MASCOTAS?

Pregunta:

Sí → Ir a Sección 8 (Mascota 1)

No → Enviar formulario

🔵 SECCIÓN 8 — MASCOTA 1

Campos:

Tipo de mascota* (species) (Perro, Gato, Ave, Otros)
Nombre* (name)
Raza (breed)
color* (color)
Edad (age_years)
Foto de la mascota (photo_url)

Pregunta: “¿Deseas agregar otra mascota?”

Sí → Ir a Sección 9

No → Enviar formulario

🔵 SECCIÓN 9 — MASCOTA 2 (Opcional)

Tipo de mascota* (species) (Perro, Gato, Ave, Otros)
Nombre* (name)
Raza (breed)
color* (color)
Edad (age_years)
Foto de la mascota (photo_url)

Fin → Enviar formulario

NOTA: La cantidad de Vehículos y Mascotas no deberían estar limitadas, sino debería ser un registro recursivo. Los propietarios máximo pueden ser 2
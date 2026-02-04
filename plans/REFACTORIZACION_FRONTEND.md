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
│   └── ListrasComponent    ⚠️ Eliminar (reemplazar)
└── Modelos
    ├── User               ✅ (unificado)
    ├── Visit              (existente)
    ├── House              (existente)
    ├── Vehicle            (existente)
    └── AccessPoint       (existente)
```

---

## 📅 Próximos Pasos

### Inmediatos
1. ~~Actualizar UsersService~~ ✅
2. ~~Actualizar AccessLogService~~ ✅
3. ~~Eliminar servicios legacy~~ ✅
4. ~~Actualizar HistoryComponent~~ ✅
5. ~~Actualizar BirthdayComponent~~ ✅
6. Decidir futuro de ListrasComponent

### Futuro (Nueva UI)
1. Crear nuevo componente `PersonsComponent`
2. Usar `getPersonsByStatus()` para filtrar
3. Implementar nueva interfaz de gestión de personas
4. Eliminar `ListrasComponent` cuando nueva UI esté lista

---

## 🗑️ Archivos para Eliminar (Futuro)

Cuando se implemente la nueva UI:
- `src/app/listas/` (directorio completo)
- `src/app/listas/listas.component.ts`
- `src/app/listas/listas.component.html`
- `src/app/listas/listas.component.css`

---

## 📌 Notas

- Los métodos legacy en `UsersService` están marcados con comentario `// LEGACY COMPATIBILITY`
- La API v1 usa endpoints `/api/v1/users` y `/api/v1/access-logs`
- El modelo `User` ahora es unificado (reemplaza `Person`, `Ludopata`, `SystemClient`)

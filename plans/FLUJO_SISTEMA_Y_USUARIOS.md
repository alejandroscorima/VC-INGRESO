# Flujo del sistema VC-INGRESO y diferencia entre `users` y `persons`

## Resumen rápido

| Concepto | **users** | **persons** |
|----------|-----------|-------------|
| **Qué es** | Cuentas para **iniciar sesión** en el sistema | **Personas** que el sistema conoce (propietarios, residentes, visitas) |
| **¿Tiene usuario/contraseña?** | Sí (`username_system`, `password_system`) | No |
| **¿Para qué se usa?** | Login, roles (Admin, Operario, Guardia, Usuario), pantalla “Mi Casa” cuando tienen `house_id` | Ingresos/egresos, reservas, dueño de mascotas y vehículos |
| **Referencias en otras tablas** | `temporary_access_logs.operario_id` → users | `access_logs.person_id`, `reservations.person_id`, `pets.owner_id`, `vehicles.owner_id` → persons |
| **Registro público** | No crea usuarios | Sí crea persons (propietarios), vehículos y mascotas |

---

## 1. Flujo general del sistema

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     vc_db (BD principal)                │
                    └─────────────────────────────────────────────────────────┘

  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │   houses     │     │   users      │     │   persons    │     │  access_     │
  │ (domicilios) │     │ (login)      │     │ (personas)   │     │  points      │
  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
         │                    │                    │                     │
         │ house_id            │ house_id           │ house_id            │ id
         │                    │                    │                     │
         ▼                    ▼                    ▼                     ▼
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │  vehicles    │     │  (Mi Casa:    │     │ access_logs  │     │ reservations │
  │  pets        │     │   listado     │     │ (ingreso/    │     │ (áreas)      │
  │  (house_id,  │     │   por casa)   │     │  egreso)     │     │              │
  │   owner_id→  │     └──────────────┘     │ person_id ───┼─────┤ person_id    │
  │   persons)   │                          │ vehicle_id   │     │ house_id     │
  └──────────────┘                          └──────────────┘     └──────────────┘
```

- **houses**: domicilios del condominio (manzana, lote, departamento).
- **users**: quienes pueden entrar al sistema con usuario y contraseña; pueden tener `house_id` (ej. residente que ve “Mi Casa”).
- **persons**: personas registradas (propietario, residente, visita); son las que aparecen en ingresos/egresos, reservas y como dueños de mascotas/vehículos.
- **access_logs**: registra quién entró/salió; usa `person_id` (persons), no users.
- **reservations**: quien reserva un área; usa `person_id` (persons) y `house_id`.

---

## 2. Diferencia entre `users` y `persons`

### 2.1 Tabla `users`

- **Rol**: cuentas de **acceso al sistema** (login).
- **Campos clave**: `username_system`, `password_system`, `role_system` (ADMINISTRADOR, OPERARIO, GUARDIA, USUARIO), `house_id` (opcional).
- **Uso**:
  - Login (getUser.php por `username_system`).
  - Pantalla “Mi Casa”: se listan **users** con ese `house_id` (p. ej. getPersonsByHouseId.php en realidad devuelve **users** por casa, no persons).
  - Operarios que registran accesos temporales (`temporary_access_logs.operario_id` → users).
- **No** se usa en access_logs, reservations, ni como dueño de mascotas/vehículos; esas tablas usan **persons**.

### 2.2 Tabla `persons`

- **Rol**: **personas** que el sistema conoce (propietarios, residentes, visitas, etc.).
- **Campos clave**: `doc_number`, `person_type` (PROPIETARIO, RESIDENTE, VISITA, etc.), `house_id`, `status_validated`.
- **Uso**:
  - `access_logs.person_id` → quién ingresó/salió (persona física).
  - `reservations.person_id` → quien hace la reserva.
  - `pets.owner_id` → dueño de la mascota (persons.id).
  - `vehicles.owner_id` → dueño del vehículo (persons.id).
- **No** tienen usuario ni contraseña; no hacen login. Son el “catálogo de personas” del condominio.

### 2.3 Resumen en una frase

- **users** = “quién puede **entrar al sistema** (login)”.
- **persons** = “quién **es** la persona” en ingresos, reservas, mascotas y vehículos.

Una misma persona física podría en teoría estar como **user** (para login) y como **person** (para ingresos/reservas/mascotas), pero en el esquema actual **no hay vínculo** entre ambas tablas (no existe `user_id` en persons ni `person_id` en users). Eso es parte del “vacío lógico” que se comenta más abajo.

---

## 3. Flujo del registro público

1. El propietario llena el formulario público (vivienda, propietarios, vehículos, mascotas).
2. Backend (PublicRegistrationController):
   - Busca o crea **house** (por block_house, lot, apartment).
   - Inserta **persons** (los propietarios del payload).
   - Inserta **vehicles** con `house_id` y `owner_id` → persons.id.
   - Inserta **pets** con `house_id` y `owner_id` → persons.id.
3. **No** se crea ningún registro en **users**.

Consecuencia: el propietario queda registrado como **person** (y sus vehículos y mascotas asociados), pero **no puede iniciar sesión** porque no tiene cuenta en **users**. Para que pueda entrar al sistema, un administrador tendría que crearle un **user** (y hoy no hay enlace explícito entre ese user y la **person** ya creada).

---

## 4. El “vacío lógico”

- **Falta de enlace user ↔ person**  
  No hay columna que relacione un `user` con una `person`. Por tanto:
  - No se puede decir de forma explícita “este user es la misma persona que este person”.
  - “Mi Casa” se basa en **users** con `house_id`, no en **persons** de esa casa.

- **Registro público no da acceso al sistema**  
  El registro público crea **persons** (y vehículos/mascotas) pero no **users**, así que el nuevo propietario no puede iniciar sesión hasta que alguien le cree una cuenta.

- **Nombres confusos**  
  Scripts como `getPersonsByHouseId.php` en realidad devuelven **users** por `house_id`, no **persons**, lo que puede generar confusión.

Posibles direcciones para cerrar el vacío (sin implementar aquí, solo como ideas):

1. Añadir en **users** una columna opcional `person_id` (FK a persons.id) para indicar “este user es esta person”.
2. En el registro público (o en un flujo posterior), crear un **user** por defecto para el propietario (por ejemplo username = doc_number o email, contraseña temporal) y opcionalmente enlazarlo con la **person** creada.
3. Renombrar o aclarar en código/API qué endpoints trabajan con **users** y cuáles con **persons** (p. ej. “getUsersByHouseId” vs “getPersonsByHouseId”) para que el flujo sea más claro.

---

## 5. Referencia rápida de tablas (vc_db)

| Tabla | Relación con users/persons |
|-------|----------------------------|
| **houses** | users.house_id, persons.house_id, vehicles.house_id, pets.house_id, reservations.house_id |
| **users** | Solo login y “Mi Casa”; no participa en access_logs ni como dueño en pets/vehicles |
| **persons** | access_logs.person_id, reservations.person_id, pets.owner_id, vehicles.owner_id |
| **vehicles** | house_id → houses; owner_id → **persons** |
| **pets** | house_id → houses; owner_id → **persons** |
| **access_logs** | person_id → **persons**; no usa users |
| **reservations** | person_id → **persons**; house_id → houses |

Este documento refleja el estado del esquema en `database/vc_create_database.sql` y el uso en el proyecto.

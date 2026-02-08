# Reorganización de bases de datos – VC-INGRESO / Crearttech

## Resumen

| Base de datos              | Variable env       | Uso | Archivo de conexión |
|---------------------------|--------------------|-----|----------------------|
| **vc_db**                 | `DB_NAME`          | Sistema principal del condominio (usuarios, casas, personas, vehículos, mascotas, reservas, access_logs, etc.). Un condominio = una instancia. | vc_db.php, db_connection.php |
| **crearttech_clientes**   | `DB_LICENSE_NAME`  | Licencias y clientes Crearttech: qué empresas/condominios usan el sistema (VC5, Planicie5, etc.). Tablas: `clients`, `payment`. | bdLicense.php |

## Bases legacy (no creadas por vc_create_database.sql)

`DB_ENTRANCE_NAME` y `DB_DATA_NAME` fueron eliminados del proyecto (.env y docker-compose). Las BD **vc_entrance** y **vc_data** ya no se crean en `vc_create_database.sql`. Los archivos bd.php, bdEntrance.php y bdData.php siguen en el servidor con fallback a `vc_entrance`/`vc_data`; esos endpoints solo funcionarán si esas BD existen (creadas a mano o migrando esos scripts a vc_db).

---

## crearttech_clientes (licencias)

- **Objetivo**: Gestionar clientes que adquieren el sistema (Crearttech) y sus licencias/pagos.
- **Tablas**:
  - **clients**: client_id, client_name (razón social), client_phone, client_email, client_ruc, doc_type, client_logo, address, contact_name, notes, is_active, created_at, updated_at.
  - **payment**: payment_id, client_id, date_start, date_expire, payment_date, payment_frequency (MENSUAL|TRIMESTRAL|SEMESTRAL|ANUAL), amount, currency, status, notes, created_at, updated_at.
- **Script**: `database/crearttech_clientes_schema.sql` (crea BD, tablas y datos iniciales para client_id=1 “Villa Club 5” y una licencia vigente).
- **Endpoints que la usan**: getPaymentByClientId.php (tabla `payment`), getSystemClientById.php (tabla `clients`).

---

## vc_db (sistema principal)

- **Objetivo**: Todo el flujo del sistema de control de ingresos de un condominio (Villa Club 5, Planicie 5, etc.).
- **Scripts** (solo estos; no hay migraciones sueltas):
  - **`database/vc_create_database.sql`**: Crea BD vc_db (y otras BDs vacías si se desea), crea todas las tablas en orden correcto, añade claves foráneas e inserta datos iniciales de `access_points` (Garita, Entrada Peatonal, Piscina, Casa Club). Ejecutar una vez para esquema completo.
  - **`database/vc_dev_data.sql`**: Datos de prueba (casas, usuarios, personas, vehículos, mascotas, reservas, access_logs). Ejecutar después de `vc_create_database.sql`.
- **Tablas** (orden de dependencia):

| Tabla                    | Descripción breve |
|--------------------------|--------------------|
| **houses**               | Casas del condominio (block_house, lot, apartment, owner_id, status_system). |
| **users**                | Usuarios del sistema (login, roles, house_id, birth_date, etc.). |
| **access_points**        | Puntos de acceso y áreas (GARITA, PISCINA, CASA_CLUB, ENTRADA_PEATONAL, etc.) con max_capacity, current_capacity. |
| **persons**             | Personas (residentes, propietarios, visitas): doc_number, house_id, status_validated, person_type, etc. |
| **vehicles**             | Vehículos (license_plate, house_id, owner_id, status_validated, category_entry). |
| **temporary_visits**     | Visitas temporales (temp_visit_name, temp_visit_doc, temp_visit_plate, etc.). |
| **access_logs**         | Registro de ingresos/egresos (access_point_id, person_id, doc_number, vehicle_id, type INGRESO/EGRESO, observation). |
| **temporary_access_logs**| Logs de acceso temporal (temp_visit_id, access_point_id, house_id, operario_id, temp_entry_time, temp_exit_time). |
| **pets**                 | Mascotas (name, species, breed, color, **house_id** obligatorio, **owner_id** opcional, status_validated, microchip_id). Gestión por casa. |
| **reservations**         | Reservaciones de áreas (access_point_id, person_id, house_id, reservation_date, end_date, status, num_guests, contact_phone). |

- **Claves foráneas**: Definidas al final de `vc_create_database.sql` (users→houses, persons→houses, vehicles→houses, access_logs→access_points/persons/vehicles, temporary_access_logs→access_points/temporary_visits/houses/users, pets→houses/persons, reservations→access_points/persons/houses).

---

## Orden de ejecución (entorno de pruebas)

1. **vc_db** (esquema + datos de prueba). Sustituir placeholder de contraseña (ver DEPLOY.md):
   ```bash
   sed "s#__MYSQL_ROOT_PASSWORD__#$DB_PASS#g" database/vc_create_database.sql | docker exec -i vc-ingreso-mysql mysql -uroot -p"$DB_PASS"
   docker exec -i vc-ingreso-mysql mysql -uroot -p"$DB_PASS" vc_db < database/vc_dev_data.sql
   ```
2. **crearttech_clientes** (licencias):
   ```bash
   docker exec -i vc-ingreso-mysql mysql -uroot -p"$DB_PASS" < database/crearttech_clientes_schema.sql
   ```

No se usa `vc_foreign_keys.sql`; las FKs están incluidas en `vc_create_database.sql`.

---

## Archivos en database/

| Archivo                        | Uso |
|--------------------------------|-----|
| **vc_create_database.sql**     | Crear vc_db, tablas y FKs; INSERT inicial de access_points. |
| **vc_dev_data.sql**            | Datos de prueba para desarrollo. |
| **crearttech_clientes_schema.sql** | Crear BD crearttech_clientes, tablas clients y payment, datos iniciales. |

Cualquier otro script de migración o renombrado que existiera ha sido eliminado; el estado actual del esquema está en `vc_create_database.sql`.

---

## .env

- **DB_NAME** = vc_db  
- **DB_LICENSE_NAME** = crearttech_clientes  
- DB_ENTRANCE_NAME y DB_DATA_NAME eliminados del proyecto.

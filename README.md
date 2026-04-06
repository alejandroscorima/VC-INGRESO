# VC-INGRESO

Sistema web de **control de acceso residencial**: personas, vehículos, ingresos/egresos, reservas de áreas comunes y registro público de propietarios.

**Stack:** Angular 18 + Angular Material + Tailwind · PHP 8.2 + MySQL · JWT · Docker.

## Capacidades del sistema

### Funcionalidades principales

- **Código QR:** generación y lectura de QR con caducidad, orientados a un uso seguro en portería. Funciona desde **celular, tablet y PC**. El vecino puede generar QR para **sí mismo, familia, visitas, inquilinos y vehículos** registrados en su domicilio.
- **Identificación en portería:** además del QR, admite **escaneo por código de barras** y **registro manual** cuando haga falta.
- **Usuarios y personas:** alta, consulta, edición y **gestión de fotos**; separación clara entre credenciales de sistema y datos de identidad/residencia.
- **Mascotas:** CRUD completo y **fotos** asociadas al hogar.
- **Vehículos:** CRUD completo y **fotos** (residentes y flujos de vehículos externos donde aplique).
- **Puntos de acceso:** el registro de ingresos/egresos se apoya en catálogo **tipificado** de puntos, con opciones como **permitir reservas** y **control de aforo** según el ambiente.
- **Reservaciones (áreas comunes):** flujo para **solicitar, confirmar, rechazar, cancelar y marcar como completada** (p. ej. casa club). Pensado para extenderse a **losas deportivas** u otros espacios reservables. Las solicitudes se visualizan en **vista calendario**.
- **Control de aforo (piscina y similares):** registro de **ingresos y salidas** con **indicador de ocupación en tiempo real**; el mismo enfoque puede aplicarse a otros ambientes con cupo limitado.

### Beneficios para los vecinos

- Autogestión del hogar: residentes, inquilinos, visitas, mascotas y vehículos desde **Mi casa**, con foto y datos ordenados.
- **QR de ingreso** sin depender siempre del DNI físico; útil para familiares y visitas recurrentes.
- **Reservas** de áreas comunes con seguimiento del estado de la solicitud y vista en calendario.
- Transparencia: historial de accesos acotado a **su domicilio** cuando el rol es de vecino (sin ver datos de otras casas).

### Beneficios para administradores

- Visión **global** del condominio: personas, viviendas, vehículos, puntos de acceso, reservas e historial según políticas de rol.
- Configuración de **áreas comunes** (reservas, aforo, capacidad) desde el catálogo de puntos de acceso.
- Base para **auditoría** y reportes (ingresos/egresos, reservas, uso de aforo).
- Registro público de propietarios y flujos de alta que reducen carga operativa en secretaría.

### Beneficios para operadores de seguridad (portería / guardias)

- **Validación rápida:** escaneo de QR, código de barras o captura manual en el mismo flujo de trabajo.
- Menos fricción en horas punta: identificación clara de **persona, vehículo o visita temporal** según el caso.
- **Aforo en vivo** en ambientes controlados (p. ej. piscina) para decidir ingresos sin hojas de cálculo paralelas.
- Coherencia con las reglas del condominio: estados de reserva, límites de horario y políticas definidas en backend.

## Inicio rápido (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- API: `http://localhost:8080`
- Frontend: `http://localhost:4200`

El frontend suele ejecutar `npm install --legacy-peer-deps` y `ng serve` dentro del contenedor; el servicio API monta `./server` para cambios en caliente.

## Documentación

| Archivo | Uso |
|---------|-----|
| [server/API.md](server/API.md) | **Contrato HTTP** — rutas, métodos, auth, registro público, RENIEC (referencia), errores |
| [ESTADO_Y_MEJORAS.md](ESTADO_Y_MEJORAS.md) | Estado del proyecto, roadmap, pendientes, registro de mejoras |
| [plans/REFERENCIA_TECNICA.md](plans/REFERENCIA_TECNICA.md) | Bases de datos, flujos `users`/`persons`/`house_members`, backup y despliegue, modelos, contexto ampliado |

**Base de datos:** en entornos nuevos, crear el esquema con `database/vc_create_database.sql` y datos de prueba con `database/vc_dev_data.sql` (orden y variables en la referencia técnica §4).

## Estructura principal

```
VC-INGRESO/
├── src/app/          # Angular (servicios, componentes, rutas)
├── server/           # API PHP (index.php, controllers/, db_connection.php)
├── database/         # vc_create_database.sql, vc_dev_data.sql, crearttech_clientes_schema.sql
├── server/API.md     # Referencia REST v1
└── plans/            # REFERENCIA_TECNICA.md
```

## Licencia

MIT

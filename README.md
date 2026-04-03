# VC-INGRESO

Sistema web de **control de acceso residencial**: personas, vehículos, ingresos/egresos, reservas de áreas comunes y registro público de propietarios.

**Stack:** Angular 18 + Angular Material + Tailwind · PHP 8.2 + MySQL · JWT · Docker.

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

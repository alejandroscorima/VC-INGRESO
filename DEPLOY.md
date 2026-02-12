# Despliegue VC-INGRESO (Local, Stage, Producción)

## Resumen de entornos

| Entorno | MySQL (puerto) | API (puerto) | Frontend (puerto) | Build Angular |
|--------|-----------------|--------------|-------------------|----------------|
| **Local** | 3306 interno y externo | 8080 | 4200 | `environment.ts` (localhost:8080) |
| **Stage** (nube) | 3306 solo interno | 8089 externo | 8086 externo | `ng build --configuration=stage` → environment.stage.ts |
| **Prod** (contenedores) | 3306 solo interno | 80 | 8080 (nginx) | `ng build --configuration=production` |
| **Prod** (RDS) | — | 80 | 8080 (nginx) | `ng build --configuration=production` |

---

## 1. Variables de entorno

- **Backend (PHP):** `.env` (copiar desde `.env.example`). En Docker, el compose inyecta `DB_HOST=mysql` y `DB_PASS` en el contenedor de la API.
- **Frontend (Angular):** no usa `.env` para la URL de la API; se elige por configuración de build:
  - Desarrollo: `src/environments/environment.ts` → `baseUrl: "http://localhost:8080"`.
  - Stage: `src/environments/environment.stage.ts` → actualizar IP/dominio y puerto (ej. `http://13.218.39.221:8089`).
  - Producción: `src/environments/environment.prod.ts` → poner la URL final con HTTPS.

---

## 2. Local (Docker)

```bash
cp .env.example .env
# Editar .env: DB_PASS y demás si quieres. DB_HOST no hace falta cambiarlo (el compose lo sobreescribe para la API).

docker compose -f docker-compose.dev.yml up -d
```

- MySQL: `localhost:3306`
- API: `http://localhost:8080`
- Frontend: `http://localhost:4200` (el contenedor ejecuta `npm run start`).

Para crear esquema y datos iniciales (primera vez o tras borrar volumen), hay que sustituir el placeholder de contraseña en `vc_create_database.sql`:

- **PowerShell:**  
  `Get-Content database/vc_create_database.sql | ForEach-Object { $_ -replace '__MYSQL_ROOT_PASSWORD__', $env:DB_PASS } | docker exec -i vc-ingreso-mysql mysql -uroot -p"$env:DB_PASS"`  
  Luego: `Get-Content database/vc_dev_data.sql | docker exec -i vc-ingreso-mysql mysql -uroot -p"$env:DB_PASS"`
  También: `Get-Content database/crearttech_clientes_schema.sql | ForEach-Object { $_ -replace '__MYSQL_ROOT_PASSWORD__', $env:DB_PASS } | docker exec -i vc-ingreso-mysql mysql -uroot -p"$env:DB_PASS"`

- **Bash:**  
  `sed "s#__MYSQL_ROOT_PASSWORD__#$DB_PASS#g" database/vc_create_database.sql | docker exec -i vc-ingreso-mysql mysql -uroot -p"$DB_PASS"`  
  Luego: `docker exec -i vc-ingreso-mysql mysql -uroot -p"$DB_PASS" < database/vc_dev_data.sql`

---

## 3. Stage (nube, previo a producción)

```bash
cp .env.example .env
# Ajustar .env: DB_PASS seguro, CORS_ALLOW_ORIGIN (ej. http://13.218.39.221:8086).

docker compose -f docker-compose.stage.yml up -d
```

- Contenedores: **frontend** (Node, live), **api**, **mysql**. MySQL sin puerto externo; API 8089, Frontend 8086.
- El frontend en Stage usa el contenedor con `npm run start` (igual que dev). Para servir estáticos harías antes `ng build --configuration=stage` y usar nginx en otro paso si lo prefieres.
- **Tras `git pull`** (p. ej. si cambió `angular.json`): forzar recreación del frontend para que use el código nuevo:  
  `docker compose -f docker-compose.stage.yml up -d --force-recreate frontend`

---

## 4. Error "Access denied for user 'root'@'172.x.x.x'" (Stage/Local con Docker)

La API corre en otro contenedor (IP tipo `172.x.x.x`). MySQL 8 por defecto solo permite `root@localhost`. Este proyecto incluye un script de init que crea `root@'%'` con la misma contraseña (`MYSQL_ROOT_PASSWORD` / `DB_PASS`), pero **solo se ejecuta cuando el volumen de MySQL se crea por primera vez**.

Si el volumen ya existía con otra contraseña (o vacía), hay que **recrear el volumen** para que se ejecute el init y coincida la contraseña con `.env`:

```bash
docker compose -f docker-compose.stage.yml down
docker volume rm vc-ingreso_mysql_data
docker compose -f docker-compose.stage.yml up -d
```

Esperar a que MySQL esté healthy y luego ejecutar de nuevo los SQL (sustituir `<DB_PASS>` por el valor de `DB_PASS`):

- **Bash:**  
  `sed "s#__MYSQL_ROOT_PASSWORD__#<DB_PASS>#g" database/vc_create_database.sql | docker exec -i vc-ingreso-mysql mysql -uroot -p"<DB_PASS>"`  
  `docker exec -i vc-ingreso-mysql mysql -uroot -p"<DB_PASS>" < database/vc_dev_data.sql`

---

## 5. Producción

Hay **dos archivos** según dónde corra MySQL:

### 5.1 Producción con MySQL en contenedor (frontend + api + mysql)

- Contenedores: **frontend** (nginx sirve `dist/Ingreso`), **api**, **mysql**.
- Antes: `ng build --configuration=production` (genera `dist/Ingreso`).
- En `.env`: `DB_PASS`, `DB_NAME`, `CORS_ALLOW_ORIGIN`, etc. La API usa `DB_HOST=mysql`.

```bash
docker compose -f docker-compose.prod.yml up -d
```

- API en puerto 80, frontend en 8080. Tras el primer arranque (o tras borrar volumen), ejecutar los SQL de datos si hace falta (con `sed` para el placeholder, ver sección 4).

### 5.2 Producción con RDS (frontend + api, sin mysql)

- Contenedores: **frontend** (nginx sirve `dist/Ingreso`), **api**. Sin servicio MySQL.
- En `.env`: `DB_HOST=<rds-endpoint>`, `DB_PORT=3306`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_LICENSE_NAME`, `CORS_ALLOW_ORIGIN`.
- Antes: `ng build --configuration=production`.

```bash
docker compose -f docker-compose.prod-rds.yml up -d
```

### Resumen: 4 archivos compose

| Archivo | Contenedores | Uso |
|---------|--------------|-----|
| **docker-compose.dev.yml** | frontend (Node live), api, mysql | Desarrollo local. Puertos 3306, 8080, 4200. |
| **docker-compose.stage.yml** | frontend (Node live), api, mysql | Stage (nube). Puertos 8089 (API), 8086 (frontend). MySQL solo interno. |
| **docker-compose.prod.yml** | frontend (nginx), api, mysql | Producción todo en contenedores. API 80, frontend 8080. |
| **docker-compose.prod-rds.yml** | frontend (nginx), api | Producción con MySQL en RDS. API 80, frontend 8080. |

- Configurar `environment.prod.ts` con la URL final de la API (HTTPS). Asegurar `DB_PASS` seguro, CORS restringido y JWT/CSRF en `.env`.

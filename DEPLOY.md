# Guia de Backup y Despliegue Seguro - VC-INGRESO

Esta guia describe el flujo recomendado para realizar despliegues sin perder datos, incluyendo respaldo de base de datos e imagenes.

---

## 1. Backup de Base de Datos (Produccion)

Ejecutar dentro del servidor:

```bash
docker exec vc-ingreso-mysql \
  sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" vc_db --single-transaction' \
  > backup_vc_db_$(date +%F_%H-%M-%S).sql
```

Notas:

- --single-transaction evita inconsistencias en bases activas.
- El archivo se guarda en el directorio actual (~/vc-ingreso).

---

## 2. Backup de Imagenes (Volumen Docker)

```bash
docker run --rm \
  -v vc-ingreso_uploads_data:/data:ro \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/uploads_$(date +%F_%H-%M-%S).tar.gz -C /data .
```

Resultado:

- Se genera un .tar.gz con todas las imagenes del sistema.
- Ejemplo: uploads_2026-03-22_07-36-01.tar.gz

Seguridad:

- --rm NO elimina datos del volumen.
- Solo elimina el contenedor temporal.

---

## 3. Flujo de Despliegue Seguro

```bash
set -euo pipefail

cd ~/vc-ingreso

echo "==> 1. Backup de BD"
docker exec vc-ingreso-mysql \
  sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" vc_db --single-transaction' \
  > backup_vc_db_$(date +%F_%H-%M-%S).sql

echo "==> 2. Backup de imagenes"
docker run --rm \
  -v vc-ingreso_uploads_data:/data:ro \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/uploads_$(date +%F_%H-%M-%S).tar.gz -C /data .

echo "==> 3. Actualizar codigo"
git fetch origin
git checkout main
git pull origin main

echo "==> 4. Build"
docker compose -f docker-compose.prod.yml build

echo "==> 5. Reinicio controlado"
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

echo "==> 6. Verificacion"
docker compose -f docker-compose.prod.yml ps

echo "Deploy listo"
```

---

## 4. Restaurar Base de Datos en DEV (Windows PowerShell)

```powershell
Get-Content .\backup_vc_db_YYYY-MM-DD_HH-MM-SS.sql | docker exec -i vc-ingreso-mysql mysql -uroot -pTU_PASSWORD vc_db
```

Reemplazar:

- TU_PASSWORD por tu contrasena local.

---

## 5. Restaurar Imagenes en DEV

```powershell
docker run --rm `
  -v vc-ingreso_uploads_data:/data `
  -v ${PWD}:/backup `
  alpine `
  sh -c "rm -rf /data/* && tar xzf /backup/uploads_YYYY-MM-DD_HH-MM-SS.tar.gz -C /data"
```

Esto:

- Limpia el volumen.
- Restaura exactamente las imagenes de produccion.

---

## 6. Buenas Practicas

- Siempre hacer backup ANTES de hacer pull.
- No confiar solo en la base de datos: las imagenes tambien son datos criticos.
- Mantener backups historicos (no sobrescribir).
- Validar que el .sql tenga INSERT INTO.
- Probar restauracion en DEV regularmente.

---

## 7. Recomendacion a Futuro

Cuando escales:

- Base de datos -> RDS (persistencia real).
- Imagenes -> S3 (no depender de volumenes Docker).

---

## 8. Resultado Final

Con este flujo:

- Nunca pierdes datos.
- Puedes clonar produccion en dev facilmente.
- Tienes rollback inmediato si algo falla.

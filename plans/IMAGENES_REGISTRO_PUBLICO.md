# Plan: Imágenes en el formulario de registro público

## Objetivo

El propietario se registra y registra sus vehículos (y mascotas) **subiendo una fotografía**. Esa foto se guarda como referencia (URL en BD) y debe **visualizarse en el sistema una vez que el usuario pasa por login** (por ejemplo en Mi Casa, listados de vehículos/mascotas, etc.).  
En la pantalla de **registro no es obligatorio visualizar la imagen**; si es sencillo añadir una miniatura o vista previa en el formulario, se puede hacer, pero no es requisito.

---

## Almacenamiento: siempre URL en BD

Se guarda en base de datos la **ruta o URL** de la imagen (`vehicles.photo_url`, `pets.photo_url` — ya existen como `VARCHAR(255)`). No se usan binarios en BD.

---

## Dos alternativas de almacenamiento (diseño)

### Alternativa 1: Subir a una carpeta del servidor

- El archivo se guarda en disco en el propio servidor (ej. `server/uploads/public/vehicles/`, `server/uploads/public/pets/`, `server/uploads/public/profiles/`).
- **Nota:** La carpeta `server/uploads` no es innecesaria aunque aparezca vacía en el repo: su contenido (`uploads/public/...`) se crea en tiempo de ejecución (o por el entrypoint de Docker) y está en `.gitignore`. No eliminarla.
- En BD se guarda una ruta relativa o absoluta (ej. `/uploads/public/vehicles/abc123.jpg`).
- El servidor web (o proxy en dev) sirve la carpeta `uploads/` como estáticos para que las imágenes se puedan mostrar en el front una vez logueado.
- **Ventajas:** Implementación directa, sin dependencias externas, suficiente para arranque y entornos pequeños.
- **Consideración:** En producción, si el servidor se escala o se usan varios nodos, habría que compartir esa carpeta o migrar a storage externo.

### Alternativa 2: Escalable a S3 (u otro bucket) más adelante

- La lógica de “dónde se guarda el archivo” se abstrae detrás de una capa (servicio/clase de almacenamiento).
- **Ahora:** Esa capa escribe en la carpeta del servidor (igual que la Alternativa 1) y devuelve la URL/ruta que se guarda en `photo_url`.
- **Después:** Se puede añadir un driver/adapter que suba a S3 (o compatible S3), genere la URL pública del objeto y esa misma URL se guarde en `photo_url`. El resto del flujo (registro, listados, mostrar foto en el sistema tras login) no cambia.
- **Ventajas:** Misma API de subida y mismo uso de `photo_url`; solo se cambia el backend de almacenamiento. Escalable y preparado para CDN/cloud.

**Recomendación:** Implementar primero la Alternativa 1 (carpeta en servidor) y estructurar el código para que la subida pase por una función o clase que reciba el archivo y devuelva la URL; así después se puede sustituir esa función por una que use S3 sin tocar el flujo de registro ni el frontend.

---

## Estado actual

### Base de datos (`vc_create_database.sql`)

| Tabla     | Columna   | Tipo         | Uso      |
|----------|-----------|--------------|----------|
| vehicles | photo_url | VARCHAR(255) | Ruta/URL |
| pets     | photo_url | VARCHAR(255) | Ruta/URL |

No se requieren cambios en el esquema.

### Backend

- **PublicRegistrationController** (`POST /api/v1/public/register`): ya recibe y persiste `photo_url` en vehículos y mascotas.
- **PetController** tiene `uploadPhoto($id)` para mascotas ya existentes, con auth, y guarda en `uploads/pets/`. No sirve para el registro público (no hay `pet_id` ni login).
- **Vehículos:** no existe endpoint de subida de foto (ni público ni autenticado).

### Frontend (`src/app/public-registration`)

- El formulario ya incluye `photo_url` en vehículos y mascotas y lo envía en el payload.
- UI: botón deshabilitado “Subir o tomar foto (próximamente)”. Falta el input de archivo y la llamada al endpoint de subida.

---

## Qué falta (resumen)

1. **Backend**
   - Dos endpoints **públicos** (sin auth) que reciban la imagen y devuelvan la URL a guardar:
     - `POST /api/v1/public/upload/vehicle-photo`
     - `POST /api/v1/public/upload/pet-photo`
   - Lógica de almacenamiento: por ahora en carpeta del servidor; organizada para poder sustituir después por S3 (Alternativa 2).
   - Asegurar que las URLs devueltas sean servidas (proxy/servidor estático) para que **en el sistema (tras login)** las pantallas que muestran vehículos/mascotas puedan usar `<img [src]="...">` con esa URL.

2. **Frontend – Registro**
   - En cada vehículo y cada mascota: input para **cargar imagen** (archivo; opcional captura con cámara).
   - Al seleccionar archivo: llamar al endpoint de subida → recibir URL → asignar a `photo_url` del control y enviarlo en el payload de registro.
   - **No es obligatorio** mostrar la foto en la pantalla de registro; si es sencillo añadir una vista previa, se puede hacer.

3. **Frontend – Sistema (tras login)**
   - Donde ya se listen o editen vehículos y mascotas (Mi Casa, módulos de mascotas/vehículos): **sí mostrar la fotografía** usando `photo_url` (por ejemplo `<img [src]="baseUrl + vehicle.photo_url">` o la URL completa según configuración).

---

## Plan de implementación

### 1. Backend: endpoints de subida pública

- En el bloque `public/` de `server/index.php`:
  - `POST public/upload/vehicle-photo`
  - `POST public/upload/pet-photo`
- Validar `$_FILES['photo']`, tipo (jpg, jpeg, png, gif) y tamaño máximo (ej. 5 MB).
- **Almacenamiento:** Por ahora guardar en carpeta del servidor (ej. `uploads/public/vehicles/`, `uploads/public/pets/`) con nombre único (ej. `timestamp_uniqid.extension`). Idealmente extraer esta parte a una función/clase “storage” que reciba el archivo y devuelva la URL, para más adelante poder cambiar a S3 sin tocar el flujo.
- Respuesta: `{ "success": true, "photo_url": "/uploads/public/vehicles/xxxx.jpg" }`.
- Seguridad: solo extensiones permitidas, no usar nombre original del usuario en disco (evitar path traversal).

### 2. Documentar en API

- En `server/API.md`: método, ruta, cuerpo (multipart/form-data, campo `photo`), respuesta y errores de ambos endpoints.

### 3. Frontend – Registro: servicio y UI de carga

- En el servicio de registro público: `uploadVehiclePhoto(file)` y `uploadPetPhoto(file)` que hagan POST con `FormData` al endpoint correspondiente y devuelvan la URL.
- En el formulario: reemplazar el botón “próximamente” por un input de archivo (y opcional `capture` para cámara). Al elegir archivo: subir → asignar la URL a `photo_url` del vehículo/mascota. Vista previa en el registro **opcional** (solo si es fácil).

### 4. Servir las imágenes

- Las URLs serán relativas (ej. `/uploads/...`). En desarrollo: proxy para `/uploads`; en producción: alias/location en Apache/Nginx hacia la carpeta `uploads/`. Así las imágenes se pueden **visualizar en el sistema** una vez logueado (Mi Casa, listados, etc.).

### 5. Visualización en el sistema (tras login)

- En las vistas donde se muestran vehículos o mascotas (después del login), usar `photo_url` para mostrar la foto (ej. `<img [src]="...">` con la base URL si aplica). Si no hay `photo_url`, mostrar placeholder o ícono por defecto.

### 6. Preparación para S3 (escalabilidad)

- Mantener la lógica de subida detrás de una abstracción (función o clase que “sube y devuelve URL”). Primera implementación: escritura en carpeta del servidor. Más adelante: implementar un adapter que suba a S3 y devuelva la URL pública; el resto del código (endpoints, frontend, BD) sigue igual.

### 7. .gitignore

- Añadir `uploads/` al `.gitignore` para no versionar archivos subidos.

---

## Orden sugerido de tareas

1. Backend: crear carpetas `uploads/public/vehicles/` y `uploads/public/pets/` y registrar rutas de subida pública en `index.php`.
2. Backend: implementar subida (validación + guardar en disco + devolver `photo_url`), preferiblemente mediante una función/clase de almacenamiento reutilizable.
3. Documentar endpoints en `server/API.md`.
4. Frontend registro: métodos de subida en el servicio e input de archivo en vehículos y mascotas (sin obligar vista previa en registro).
5. Configurar proxy/servidor para servir `/uploads` y comprobar que las URLs funcionan.
6. Asegurar que en las pantallas del sistema (tras login) donde se muestran vehículos y mascotas se use `photo_url` para visualizar la fotografía.
7. Añadir `uploads/` al `.gitignore` si no está.

---

## Resumen

- **Flujo:** Registro → subir foto (vehículo/mascota) → guardar URL en BD. No es necesario mostrar la imagen en la pantalla de registro; **sí** mostrarla en el sistema tras el login.
- **Almacenamiento:** Solo URL en BD. Dos alternativas: (1) carpeta en servidor (implementación inicial), (2) diseño escalable para sustituir después por S3 sin cambiar flujo ni frontend.
- **BD:** Sin cambios; se sigue usando `photo_url` como hasta ahora.

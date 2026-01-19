# VC-INGRESO - Sistema de Control de Acceso Residencial

## 📋 Descripción General

**VC-INGRESO** es una aplicación web completa para la gestión y control de acceso de personas y vehículos en urbanizaciones, condominios o complejos residenciales. El sistema permite registrar ingresos, administrar usuarios, casas, vehículos, y mantener listas de control (observados, restringidos, VIPs y ludópatas).

### Características Principales

- ✅ **Control de Acceso**: Registro y validación de ingresos de personas y vehículos
- 👥 **Gestión de Usuarios**: Administración de residentes, propietarios e inquilinos
- 🏠 **Gestión de Viviendas**: Administración de casas/departamentos por bloques y lotes
- 🚗 **Gestión de Vehículos**: Registro de vehículos residentes y externos
- 📊 **Dashboard y Estadísticas**: Visualización de datos con gráficos y métricas en tiempo real
- 📋 **Listas de Control**: Manejo de personas observadas, restringidas, VIPs y ludópatas
- 📅 **Historial de Ingresos**: Consulta de registros por fecha, rango y cliente
- 🎂 **Cumpleaños**: Gestión de fechas especiales de residentes
- 🔐 **Sistema de Autenticación**: Login con roles y permisos diferenciados
- 📄 **Exportación de Datos**: Generación de reportes en Excel y PDF
- 📤 **Carga Masiva**: Importación de listas desde archivos PDF

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework**: Angular 18.2.11
- **UI Framework**: Angular Material 17.3.10
- **Estilos**: Tailwind CSS 3.4.1 + Flowbite 2.5.2
- **Gráficos**: Chart.js 4.4.7, ng2-charts 7.0.0, angular-google-charts 16.0.1
- **Notificaciones**: ngx-toastr 17.0.2
- **Exportación**: mat-table-exporter 15.0.0, xlsx 0.18.5
- **PDF**: jsPDF 2.5.1, html2canvas 1.4.1, pdfjs-dist 3.8.162

#### Backend
- **Lenguaje**: PHP (APIs RESTful)
- **Base de Datos**: MySQL (vc_db)
- **Servidor**: Apache/XAMPP

#### Control de Versiones
- **Repositorio**: GitHub (alejandroscorima/VC-INGRESO)
- **Branch actual**: feature/settings
- **Branch principal**: main

---

## 📁 Estructura del Proyecto

```
VC-INGRESO/
├── src/                          # Código fuente del frontend
│   ├── app/                      # Módulos y componentes de Angular
│   │   ├── components/           # Componentes de la aplicación
│   │   │   ├── inicio/           # Dashboard principal con estadísticas
│   │   │   ├── login/            # Autenticación de usuarios
│   │   │   ├── listas/           # Gestión de listas de control
│   │   │   ├── history/          # Historial de ingresos
│   │   │   ├── upload/           # Carga de archivos PDF (ludópatas)
│   │   │   ├── birthday/         # Gestión de cumpleaños
│   │   │   ├── settings/         # Configuraciones del sistema
│   │   │   ├── users/            # Administración de usuarios
│   │   │   ├── houses/           # Administración de viviendas
│   │   │   ├── vehicles/         # Administración de vehículos
│   │   │   ├── my-house/         # Vista de residentes
│   │   │   ├── nav-bar/          # Barra de navegación
│   │   │   └── side-nav/         # Menú lateral
│   │   │
│   │   ├── services/             # Servicios de Angular
│   │   │   ├── clientes.service.ts      # Gestión de clientes y personas
│   │   │   ├── users.service.ts         # Gestión de usuarios del sistema
│   │   │   ├── entrance.service.ts      # Control de ingresos
│   │   │   ├── ludopatia.service.ts     # Gestión de ludópatas
│   │   │   ├── access-log.service.ts    # Registro de accesos
│   │   │   ├── personal.service.ts      # Gestión de personal
│   │   │   ├── file-upload.service.ts   # Carga de archivos
│   │   │   ├── cookies.service.ts       # Manejo de cookies
│   │   │   └── ip-service.service.ts    # Gestión de IPs
│   │   │
│   │   ├── models/               # Modelos de datos (TypeScript)
│   │   │   ├── person.ts         # Modelo de persona/cliente
│   │   │   ├── user.ts           # Modelo de usuario del sistema
│   │   │   ├── house.ts          # Modelo de vivienda
│   │   │   ├── vehicle.ts        # Modelo de vehículo
│   │   │   ├── externalVehicle.ts # Modelo de vehículo externo
│   │   │   ├── ludopata.ts       # Modelo de persona ludópata
│   │   │   ├── payment.ts        # Modelo de pago/licencia
│   │   │   ├── accessPoint.ts    # Modelo de punto de acceso
│   │   │   ├── area.ts           # Modelo de área
│   │   │   ├── collaborator.ts   # Modelo de colaborador
│   │   │   ├── item.ts           # Modelo de item genérico
│   │   │   ├── product.ts        # Modelo de producto
│   │   │   ├── sale.ts           # Modelo de venta
│   │   │   ├── systemClient.ts   # Modelo de cliente del sistema
│   │   │   └── visit.ts          # Modelo de visita
│   │   │
│   │   ├── app-routing.module.ts # Configuración de rutas
│   │   ├── app.module.ts         # Módulo principal
│   │   └── app.component.ts      # Componente raíz
│   │
│   ├── assets/                   # Recursos estáticos (imágenes, iconos)
│   ├── environments/             # Configuración de entornos
│   ├── styles.css                # Estilos globales con Tailwind
│   └── index.html                # HTML principal
│
├── server/                       # Backend PHP
│   ├── vc_db.php                # Configuración de base de datos
│   ├── bd*.php                  # Archivos de conexión
│   │
│   ├── GET Endpoints/           # APIs de consulta
│   │   ├── getAll.php           # Obtener todos los clientes
│   │   ├── getClient.php        # Obtener cliente por documento
│   │   ├── getAllUsers.php      # Obtener todos los usuarios
│   │   ├── getUserById.php      # Obtener usuario por ID
│   │   ├── getAllHouses.php     # Obtener todas las viviendas
│   │   ├── getAllVehicles.php   # Obtener todos los vehículos
│   │   ├── getAllLudopatas.php  # Obtener lista de ludópatas
│   │   ├── getHistoryByDate.php # Historial por fecha
│   │   ├── getHistoryByRange.php # Historial por rango
│   │   ├── getObservados.php    # Lista de observados
│   │   ├── getRestringidos.php  # Lista de restringidos
│   │   ├── getVIPs.php          # Lista de VIPs
│   │   ├── getAforo.php         # Control de aforo
│   │   └── ...                  # Más endpoints GET
│   │
│   ├── POST Endpoints/          # APIs de creación
│   │   ├── postClient.php       # Crear cliente
│   │   ├── postUser.php         # Crear usuario
│   │   ├── postHouse.php        # Crear vivienda
│   │   ├── postVehicle.php      # Crear vehículo
│   │   └── postExternalVehicle.php # Crear vehículo externo
│   │
│   ├── PUT Endpoints/           # APIs de actualización
│   │   ├── update.php           # Actualización general
│   │   ├── updateClient.php     # Actualizar cliente
│   │   ├── updateUser.php       # Actualizar usuario
│   │   ├── updateHouse.php      # Actualizar vivienda
│   │   └── updateVehicle.php    # Actualizar vehículo
│   │
│   └── DELETE Endpoints/        # APIs de eliminación
│       ├── deleteClient.php     # Eliminar cliente
│       └── deleteLudopata.php   # Eliminar ludópata
│
├── e2e/                         # Tests end-to-end (Protractor)
├── angular.json                 # Configuración de Angular
├── package.json                 # Dependencias NPM
├── tsconfig.json                # Configuración TypeScript
├── tailwind.config.js           # Configuración Tailwind CSS
└── karma.conf.js                # Configuración de tests

```

---

## 🔄 Flujo de Datos

### Arquitectura Cliente-Servidor

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular)                       │
├─────────────────────────────────────────────────────────────────┤
│  Componentes  →  Servicios  →  HttpClient  →  APIs PHP          │
│     ↓              ↓             ↓                               │
│  Templates   Models/Types   Observable/RxJS                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP Requests (GET/POST/PUT/DELETE)
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (PHP + MySQL)                       │
├─────────────────────────────────────────────────────────────────┤
│  PHP Scripts  →  PDO Connection  →  MySQL Database (vc_db)      │
│     ↓              ↓                     ↓                       │
│  JSON Response  SQL Queries        Tables & Relations           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Modelos de Datos Principales

### Person (Cliente/Visitante)
```typescript
{
  type_doc, doc_number, first_name, paternal_surname, maternal_surname,
  gender, birth_date, civil_status, profession, cel_number, email,
  address, district, province, region, username, password,
  entrance_role, status, reason, house_id, colab_id, photo_url
}
```

### User (Usuario del Sistema)
```typescript
{
  type_doc, doc_number, first_name, paternal_surname, maternal_surname,
  gender, birth_date, cel_number, email, role_system, username_system,
  password_system, property_category, house_id, photo_url,
  status_validated, status_reason, status_system, block_house, lot, apartment
}
```

### House (Vivienda)
```typescript
{
  house_id, block_house, lot, apartment, status_system
}
```

### Vehicle (Vehículo)
```typescript
{
  vehicle_id, license_plate, type_vehicle, house_id,
  status_validated, status_reason, status_system, category_entry
}
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20+ y npm
- Angular CLI 18.2.11
- PHP 7.4+
- MySQL 5.7+
- Apache (XAMPP/WAMP recomendado)

### Instalación del Frontend

```bash
# Clonar el repositorio
git clone https://github.com/alejandroscorima/VC-INGRESO.git
cd VC-INGRESO

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
ng serve

# La aplicación estará disponible en http://localhost:4200/
```

### Configuración del Backend

1. **Configurar Base de Datos**:
   - Crear base de datos MySQL llamada `vc_db`
   - Importar el esquema de base de datos (si está disponible)

2. **Configurar Conexión** en `server/vc_db.php`:
```php
$contraseña = "tu_contraseña";
$usuario = "root";
$nombre_base_de_datos = "vc_db";
```

3. **Configurar Servidor**:
   - Colocar la carpeta `server/` en el directorio del servidor web
   - Asegurarse de que Apache y MySQL estén ejecutándose

4. **Configurar CORS**:
   - Los archivos PHP ya incluyen headers CORS para desarrollo
   - Ajustar según sea necesario para producción

### Configuración de Entornos

Editar `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  baseUrl: 'http://localhost/VC-INGRESO/server'
};
```

---

## 📱 Módulos y Funcionalidades

### 1. Dashboard (Inicio)
- **Ruta**: `/`
- **Componente**: `InicioComponent`
- **Funcionalidades**:
  - Gráficos estadísticos (barras, líneas, donut)
  - Métricas de ingresos en tiempo real
  - Resumen de actividad diaria
  - Alertas y notificaciones

### 2. Login
- **Ruta**: `/login`
- **Componente**: `LoginComponent`
- **Funcionalidades**:
  - Autenticación de usuarios
  - Validación de licencias/pagos
  - Gestión de sesiones con cookies
  - Redirección según rol

### 3. Listas de Control
- **Ruta**: `/listas`
- **Componente**: `ListasComponent`
- **Funcionalidades**:
  - Gestión de personas observadas
  - Gestión de personas restringidas
  - Gestión de VIPs
  - Filtrado y búsqueda
  - Exportación a Excel

### 4. Historial de Ingresos
- **Ruta**: `/history`
- **Componente**: `HistoryComponent`
- **Funcionalidades**:
  - Consulta por fecha específica
  - Consulta por rango de fechas
  - Consulta por cliente
  - Filtros por punto de acceso
  - Exportación de reportes

### 5. Gestión de Usuarios
- **Ruta**: `/users`
- **Componente**: `UsersComponent`
- **Funcionalidades**:
  - CRUD de usuarios del sistema
  - Asignación de roles
  - Validación de estados
  - Vinculación con viviendas

### 6. Gestión de Viviendas
- **Ruta**: `/houses`
- **Componente**: `HousesComponent`
- **Funcionalidades**:
  - CRUD de viviendas
  - Organización por bloques y lotes
  - Gestión de departamentos
  - Estados de sistema (ACTIVO/INACTIVO)

### 7. Gestión de Vehículos
- **Ruta**: `/vehicles`
- **Componente**: `VehiclesComponent`
- **Funcionalidades**:
  - Registro de vehículos residentes
  - Registro de vehículos externos
  - Validación de placas
  - Categorización de entrada

### 8. Mi Casa
- **Ruta**: `/my-house`
- **Componente**: `MyHouseComponent`
- **Funcionalidades**:
  - Vista de residente
  - Información de su vivienda
  - Gestión de autorizaciones

### 9. Cumpleaños
- **Ruta**: `/hb`
- **Componente**: `BirthdayComponent`
- **Funcionalidades**:
  - Lista de cumpleaños
  - Filtros por mes
  - Recordatorios

### 10. Carga de Archivos
- **Ruta**: `/upload`
- **Componente**: `UploadComponent`
- **Funcionalidades**:
  - Carga de PDFs (listas de ludópatas)
  - Procesamiento automático
  - Validación y actualización

### 11. Configuraciones
- **Ruta**: `/settings`
- **Componente**: `SettingsComponent`
- **Funcionalidades**:
  - Configuraciones del sistema
  - Parámetros de acceso
  - Personalización

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start              # Inicia servidor de desarrollo
ng serve               # Mismo que npm start
ng serve --open        # Abre automáticamente en navegador

# Construcción
npm run build          # Build de producción
ng build --prod        # Build optimizado

# Testing
npm test               # Ejecuta tests unitarios (Karma)
npm run e2e            # Ejecuta tests e2e (Protractor)
npm run lint           # Linter (TSLint)

# Generación de componentes
ng generate component nombre-componente
ng generate service nombre-servicio
```

---

## 🔐 Sistema de Autenticación

### Roles de Usuario
- **Admin**: Acceso completo al sistema
- **Supervisor**: Gestión de registros y reportes
- **Guardia**: Registro de ingresos básico
- **Residente**: Vista limitada (Mi Casa)

### Flujo de Autenticación
1. Usuario ingresa credenciales en `/login`
2. `UsersService.getUser()` valida contra base de datos
3. Si es válido, se verifica licencia con `getPaymentByClientId()`
4. Se almacenan datos en cookies (`user_id`, `user_role`, `sala`, `onSession`)
5. Redirección al dashboard según rol

---

## 📊 Base de Datos

### Tablas Principales

- **clients**: Personas/clientes/visitantes
- **users**: Usuarios del sistema
- **houses**: Viviendas del condominio
- **vehicles**: Vehículos registrados
- **external_vehicles**: Vehículos externos/temporales
- **ludopatas**: Lista de personas con ludopatía
- **access_points**: Puntos de acceso/garitas
- **areas**: Áreas del complejo
- **collaborators**: Colaboradores/empleados
- **payments**: Pagos y licencias
- **entrance_logs**: Registro de ingresos (posible)

---

## 🎨 Diseño y UI/UX

### Librerías de Estilos
- **Angular Material**: Componentes Material Design
- **Tailwind CSS**: Utility-first CSS framework
- **Flowbite**: Componentes UI basados en Tailwind
- **Material Icons**: Iconografía

### Características de Diseño
- Diseño responsive (móvil, tablet, desktop)
- Dark mode compatible
- Animaciones suaves con Angular animations
- Notificaciones toast (ngx-toastr)
- Tablas con paginación y ordenamiento
- Diálogos modales para CRUD
- Formularios reactivos con validación

---

## 📈 Exportación y Reportes

### Formatos Soportados
- **Excel (.xlsx)**: mat-table-exporter, xlsx
- **PDF**: jsPDF + html2canvas
- **CSV**: Incluido en mat-table-exporter

### Datos Exportables
- Historial de ingresos
- Listas de control (observados, restringidos, VIPs)
- Lista de usuarios
- Lista de vehículos
- Reportes estadísticos

---

## 🐛 Debugging y Logs

### Herramientas
- Chrome DevTools
- Angular DevTools
- Console.log en componentes
- Network tab para APIs

### Errores Comunes
- **CORS errors**: Verificar headers en PHP
- **404 en APIs**: Verificar baseUrl en environment
- **Cookies no guardadas**: Verificar permisos del navegador
- **Gráficos no se renderizan**: Verificar Chart.js registration

---

## 🚀 Despliegue

### Producción

```bash
# Build de producción
ng build --prod --base-href /VC-INGRESO/

# Los archivos se generan en dist/Ingreso/
# Copiar a servidor web (Apache/Nginx)
```

### Configuración de Servidor

#### Apache (.htaccess)
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Variables de Entorno
- Crear `environment.prod.ts` con URLs de producción
- Configurar baseUrl del backend
- Ajustar CORS en PHP para dominio específico

---

## 📝 Convenciones de Código

### TypeScript/Angular
- Nombres de clases: PascalCase
- Nombres de variables/funciones: camelCase
- Nombres de archivos: kebab-case
- Interfaces: PascalCase con prefijo I (opcional)
- Servicios: Sufijo Service
- Componentes: Sufijo Component

### PHP
- Nombres de archivos: snake_case
- Funciones: camelCase
- Variables: snake_case
- Constantes: UPPER_SNAKE_CASE

---

## 🤝 Contribución

### Flujo de Trabajo
1. Crear rama desde `main`: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits descriptivos
3. Push a GitHub: `git push origin feature/nueva-funcionalidad`
4. Crear Pull Request a `main`
5. Revisión y merge

### Estándares
- Commits en español o inglés (consistente)
- Mensajes descriptivos
- Código comentado en secciones complejas
- Tests para nuevas funcionalidades

---

## 📄 Licencia

Este proyecto es privado y pertenece a los propietarios del repositorio alejandroscorima/VC-INGRESO.

---

## 👥 Autores

- **Desarrollador Principal**: Alejandro Scorima & Luis Gustavo
- **Repositorio**: [alejandroscorima/VC-INGRESO](https://github.com/alejandroscorima/VC-INGRESO)

---

## 📞 Soporte

Para soporte técnico o consultas:
- Abrir un issue en GitHub
- Contactar al equipo de desarrollo

---

## 🔄 Changelog

### Versión Actual (feature/settings)
- Implementación de módulo de configuraciones
- Mejoras en gestión de usuarios
- Optimización de carga de datos

### Versiones Anteriores
- Ver historial de commits en GitHub

---

## 🔮 Roadmap Futuro

- [ ] Autenticación con JWT
- [ ] API RESTful con Node.js/Express (migración desde PHP)
- [ ] Base de datos con Prisma ORM
- [ ] Notificaciones push en tiempo real
- [ ] App móvil (Ionic/React Native)
- [ ] Reconocimiento facial para acceso
- [ ] Integración con sistemas de cámaras
- [ ] Dashboard analítico avanzado
- [ ] Multi-tenancy para múltiples condominios

---

*Última actualización: Enero 2026*

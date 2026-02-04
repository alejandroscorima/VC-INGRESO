# VC-INGRESO - Sistema de Control de Acceso Residencial

## Descripción General

**VC-INGRESO** es una aplicación web para gestión y control de acceso de personas y vehículos en condominios.

### Características Principales

- Control de acceso con validación de estado (PERMITIDO/OBSERVADO/DENEGADO)
- Gestión de residentes, visitantes y personal
- Administración de viviendas y vehículos
- Dashboard con estadísticas en tiempo real
- Sistema de autenticación con roles

---

## Arquitectura del Sistema

### Stack Tecnológico

#### Frontend
- **Framework**: Angular 18.2.11
- **UI**: Angular Material 17.3.10
- **Estilos**: Tailwind CSS 3.4.1
- **Gráficos**: Chart.js 4.4.7

#### Backend
- **Lenguaje**: PHP 8.2 (APIs RESTful)
- **Patrón**: MVC (Model-View-Controller)
- **Base de Datos**: MySQL
- **Servidor**: Apache/Docker

---

## Estructura del Proyecto

```
VC-INGRESO/
├── src/                          # Frontend Angular
│   ├── app/
│   │   ├── api.service.ts        # Servicio HTTP unificado
│   │   ├── error.interceptor.ts  # Manejo de errores
│   │   ├── auth.service.ts       # Autenticación
│   │   ├── auth.interceptor.ts   # Bearer token
│   │   ├── controllers/          # Controladores Angular
│   │   └── components/           # Componentes UI
│   └── environments/
│
├── server/                       # Backend PHP
│   ├── controllers/              # Controladores MVC
│   │   ├── Controller.php        # Clase base
│   │   ├── UserController.php    # Usuarios del sistema
│   │   ├── PersonController.php  # Personas (unificado)
│   │   ├── HouseController.php   # Viviendas
│   │   ├── VehicleController.php # Vehículos
│   │   └── ExternalVehicleController.php
│   ├── utils/
│   │   ├── Response.php          # Respuestas JSON
│   │   └── Router.php            # Enrutamiento
│   ├── index.php                 # Entry point API
│   ├── vc_db.php                 # Conexión BD
│   └── auth_middleware.php       # JWT Auth
│
├── docker-compose.yml            # Docker配置
└── README.md
```

---

## API REST v1

### Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| **USERS** |
| GET | `/api/v1/users` | Listar usuarios |
| GET | `/api/v1/users/:id` | Usuario por ID |
| POST | `/api/v1/users` | Crear usuario |
| PUT | `/api/v1/users/:id` | Actualizar |
| DELETE | `/api/v1/users/:id` | Eliminar |
| **PERSONS** |
| GET | `/api/v1/persons` | Listar personas |
| GET | `/api/v1/persons/:id` | Persona por ID |
| GET | `/api/v1/persons/observed` | Solo OBSERVADOS |
| GET | `/api/v1/persons/restricted` | Solo DENEGADOS |
| POST | `/api/v1/persons` | Crear persona |
| PUT | `/api/v1/persons/:id` | Actualizar |
| PUT | `/api/v1/persons/:id/validate` | Cambiar estado |
| DELETE | `/api/v1/persons/:id` | Eliminar |
| **HOUSES** |
| GET | `/api/v1/houses` | Listar viviendas |
| POST | `/api/v1/houses` | Crear vivienda |
| PUT | `/api/v1/houses/:id` | Actualizar |
| DELETE | `/api/v1/houses/:id` | Eliminar |
| **VEHICLES** |
| GET | `/api/v1/vehicles` | Listar vehículos |
| POST | `/api/v1/vehicles` | Crear vehículo |
| PUT | `/api/v1/vehicles/:id` | Actualizar |
| DELETE | `/api/v1/vehicles/:id` | Eliminar |
| **EXTERNAL-VEHICLES** |
| GET | `/api/v1/external-vehicles` | Listar externos |
| POST | `/api/v1/external-vehicles` | Crear |
| PUT | `/api/v1/external-vehicles/:id` | Actualizar |
| DELETE | `/api/v1/external-vehicles/:id` | Eliminar |

### Estados de Validación (Persons)

| Estado | Significado |
|--------|-------------|
| `PERMITIDO` | Acceso normal (default) |
| `OBSERVADO` | Requiere atención especial |
| `DENEGADO` | Sin acceso |

---

## Instalación

### Docker (Recomendado)

```bash
cp .env.example .env
docker compose up --build

# Backend: http://localhost:8080
# Frontend: http://localhost:4200
```

### Manual

```bash
# Frontend
npm install
ng serve

# Backend
# Colocar server/ en Apache
# Configurar .env
```

---

## Modelos de Datos

### Person (Persona)
```typescript
{
  id, doc_number, first_name, paternal_surname, maternal_surname,
  gender, birth_date, cel_number, email, address,
  status_validated: 'PERMITIDO' | 'OBSERVADO' | 'DENEGADO',
  status_reason, person_type, house_id, photo_url
}
```

### User (Usuario del Sistema)
```typescript
{
  user_id, doc_number, first_name, paternal_surname, email,
  role_system, username_system, house_id, status_validated
}
```

### House (Vivienda)
```typescript
{
  id, block_house, lot, apartment, status_system
}
```

### Vehicle (Vehículo)
```typescript
{
  id, license_plate, type_vehicle, house_id,
  status_validated, category_entry
}
```

---

## Seguridad

- **Autenticación**: JWT (JSON Web Tokens)
- **Contraseñas**: Hasheadas con `password_hash()`
- **SQL Injection**: Prevenida con PDO prepared statements
- **CORS**: Configurado para desarrollo

---

## Licencia

MIT

-- Creación de la tabla de casas (houses)
-- Almacena la información de cada casa en el condominio, incluyendo identificadores y estado
CREATE TABLE houses (
    house_id INT AUTO_INCREMENT PRIMARY KEY,
    block_house VARCHAR(5) NOT NULL,
    lot INT NOT NULL,
    apartment VARCHAR(10),
    owner_id INT,
    status_system VARCHAR(50)
);

-- Creación de la tabla de usuarios (users)
-- Contiene la información de las personas que viven en el condominio y sus roles
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    type_doc VARCHAR(20) NOT NULL,
    doc_number VARCHAR(15) NOT NULL,
    first_name VARCHAR (100),
    paternal_surname VARCHAR (50),
    maternal_surname VARCHAR (50),
    gender VARCHAR(10),
    birth_date DATE,
    cel_number VARCHAR(15),
    email VARCHAR (100),
    role_system VARCHAR (20) NOT NULL,
    username_system VARCHAR (50) NOT NULL UNIQUE,
    password_system VARCHAR (100) NOT NULL,
    property_category VARCHAR (50),
    house_id INT,
    photo_url VARCHAR (255),
    status_validated VARCHAR (50),
    status_reason VARCHAR (255),
    status_system VARCHAR (50),
    civil_status VARCHAR (20),
    profession VARCHAR (100),
    address_reniec VARCHAR (255),
    district VARCHAR (50),
    province VARCHAR (50),
    region VARCHAR (50)
);

-- Creación de la tabla de puntos de acceso (access_points)
-- Contiene información sobre las puertas y puntos de acceso en el condominio
CREATE TABLE access_points (
    ap_id INT AUTO_INCREMENT PRIMARY KEY,
    ap_location VARCHAR (50),
    ap_description VARCHAR (100),
    client_id INT,
    status_system VARCHAR (50)
);

-- Creación de la tabla de visitas temporales (temporary_visits)
-- Registra la información de visitas temporales como taxis, deliveries, etc.
CREATE TABLE temporary_visits (
    temp_visit_id INT AUTO_INCREMENT PRIMARY KEY,
    temp_visit_name VARCHAR (100),
    temp_visit_doc VARCHAR (15),
    temp_visit_plate VARCHAR (15),
    temp_visit_cel VARCHAR (15),
    temp_visit_type VARCHAR (15) NOT NULL,
    status_validated VARCHAR (50),
    status_reason VARCHAR (255),
    status_system VARCHAR (50)
);

-- Creación de la tabla de registros de acceso temporal (temporary_access_logs)
-- Almacena entradas y salidas de visitas temporales en el condominio
CREATE TABLE temporary_access_logs (
    temp_access_log_id INT AUTO_INCREMENT PRIMARY KEY,
    temp_visit_id INT,
    temp_entry_time DATETIME NOT NULL,
    temp_exit_time DATETIME,
    ap_id INT NOT NULL,
    status_validated VARCHAR (50),
    house_id INT,
    operario_id INT

);

-- Creación de la tabla de registros de acceso (access_logs)
-- Registra los accesos de usuarios y vehículos al condominio
CREATE TABLE access_logs (
    access_log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    vehicle_id INT,
    entry_time DATETIME NOT NULL,
    ap_id INT NOT NULL,
    status_validated VARCHAR (50),
    operario_id INT
);

-- Creación de la tabla de vehículos (vehicles)
-- Almacena la información de los vehículos registrados en el condominio
CREATE TABLE vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(15) NOT NULL UNIQUE,
    type_vehicle VARCHAR (15),
    house_id INT,
    owner_id INT,
    status_validated VARCHAR (50),
    status_reason VARCHAR (255),
    status_system VARCHAR (50),
    category_entry VARCHAR (50)
);
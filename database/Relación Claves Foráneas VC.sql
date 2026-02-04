-- Relación de ONE-TO-MANY entre USERS (house_id) y HOUSES (house_id)
ALTER TABLE users
ADD CONSTRAINT fk_users_house
FOREIGN KEY (house_id) REFERENCES houses(house_id);

-- Relación de MANY-TO-ONE entre VEHICLES (house_id) y HOUSES (house_id)
ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_house
FOREIGN KEY (house_id) REFERENCES houses(house_id);

-- Relación de MANY-TO-ONE entre ACCESS_LOGS (ap_id) y ACCESS_POINTS (ap_id)
ALTER TABLE access_logs
ADD CONSTRAINT fk_access_logs_ap
FOREIGN KEY (ap_id) REFERENCES access_points(ap_id);

-- Relación de MANY-TO-ONE entre ACCESS_LOGS (user_id) y USERS (user_id)
ALTER TABLE access_logs
ADD CONSTRAINT fk_access_logs_user
FOREIGN KEY (user_id) REFERENCES users(user_id);

-- Relación de MANY-TO-ONE entre ACCESS_LOGS (vehicle_id) y VEHICLES (vehicle_id)
ALTER TABLE access_logs
ADD CONSTRAINT fk_access_logs_vehicle
FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id);

-- Relación de MANY-TO-ONE entre TEMPORARY_ACCESS_LOGS (ap_id) y ACCESS_POINTS (ap_id)
ALTER TABLE temporary_access_logs
ADD CONSTRAINT fk_temp_access_logs_ap
FOREIGN KEY (ap_id) REFERENCES access_points(ap_id);

-- Relación de MANY-TO-ONE entre TEMPORARY_ACCESS_LOGS (temp_visit_id) y TEMPORARY_VISITS (temp_visit_id)
ALTER TABLE temporary_access_logs
ADD CONSTRAINT fk_temp_access_logs_temp_visit
FOREIGN KEY (temp_visit_id) REFERENCES temporary_visits(temp_visit_id);

-- Relación de MANY-TO-ONE entre TEMPORARY_ACCESS_LOGS (house_id) y HOUSES (house_id)
ALTER TABLE temporary_access_logs
ADD CONSTRAINT fk_temp_access_logs_house
FOREIGN KEY (house_id) REFERENCES houses(house_id);

-- Relación de MANY-TO-ONE entre TEMPORARY_ACCESS_LOGS (temp_visit_id) y TEMPORARY_VISITS (temp_visit_id) -- last added
ALTER TABLE temporary_access_logs
ADD CONSTRAINT fk_temp_access_logs_user_operario
FOREIGN KEY (operario_id) REFERENCES users(user_id);
#!/bin/bash
# Ejecuta vc_create_database.sql sustituyendo __MYSQL_ROOT_PASSWORD__ por la contraseña real.
# Solo se ejecuta en la primera inicialización del volumen (docker-entrypoint-initdb.d).
set -e
TEMPLATE="/docker-entrypoint-initdb.d/02-vc_create_database.sql.template"
sed "s#__MYSQL_ROOT_PASSWORD__#$MYSQL_ROOT_PASSWORD#g" "$TEMPLATE" | mysql -uroot -p"$MYSQL_ROOT_PASSWORD"

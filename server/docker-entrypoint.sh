#!/bin/sh
# Crea directorios de subida y asigna permisos para Apache (www-data).
# Necesario cuando se usa volumen nombrado para uploads en Docker.
set -e
mkdir -p /var/www/html/uploads/public/vehicles /var/www/html/uploads/public/pets /var/www/html/uploads/public/profiles
chown -R www-data:www-data /var/www/html/uploads
exec "$@"

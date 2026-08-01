FROM php:8.2-apache

# Habilitar el módulo de reescritura de Apache
RUN a2enmod rewrite

# Copiar todo el código de la práctica a la raíz del servidor web
COPY . /var/www/html/

# Dar permisos de lectura/escritura a la carpeta data
RUN chmod -R 777 /var/www/html/data

EXPOSE 80
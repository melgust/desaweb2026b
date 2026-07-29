FROM php:8.2-apache

# Habilitar mod_rewrite si usas enrutamiento por Apache
RUN a2enmod rewrite

# Copiar el código del proyecto al directorio público de Apache
COPY . /var/www/html/practice3/imoralesi/

# Asegurar permisos sobre la carpeta data para poder guardar persons.json
RUN chmod -R 777 /var/www/html/practice3/imoralesi/data

EXPOSE 80
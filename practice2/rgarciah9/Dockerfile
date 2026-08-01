FROM php:8.3-apache

# Habilita el módulo de reescritura de URLs (necesario para las rutas /api/persons/{id})
RUN a2enmod rewrite

# Permite que Apache lea los archivos .htaccess dentro del proyecto
RUN echo '<Directory /var/www/html/>\n\tAllowOverride All\n</Directory>' > /etc/apache2/conf-available/allow-override.conf \
    && a2enconf allow-override

# Copia los archivos del proyecto
COPY . /var/www/html/

# Establece el directorio de trabajo
WORKDIR /var/www/html

EXPOSE 80
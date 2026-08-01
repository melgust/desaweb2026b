FROM php:8.2-apache

# Enable Apache rewrite module
RUN a2enmod rewrite

# Copy project files to Apache DocumentRoot
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html

# Grant read/write permissions to data folder
RUN chmod -R 777 /var/www/html/data

EXPOSE 80

CMD ["apache2-foreground"]

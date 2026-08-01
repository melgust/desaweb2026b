FROM php:8.2-cli-alpine

WORKDIR /var/www/html

COPY . .

EXPOSE 8000

# El servidor embebido de PHP usa el proyecto como raíz (-t .)
# y api/index.php como "router" que atiende TODAS las rutas.
CMD ["php", "-S", "0.0.0.0:8000", "-t", ".", "api/index.php"]

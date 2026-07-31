FROM php:8.3-cli

WORKDIR /var/www/html

COPY . .

RUN mkdir -p data && chmod -R 775 data

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "api/index.php"]

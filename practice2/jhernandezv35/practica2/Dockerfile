FROM php:8.3-cli

WORKDIR /app

COPY . /app

RUN chmod -R 777 /app/data

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "api", "api/index.php"]

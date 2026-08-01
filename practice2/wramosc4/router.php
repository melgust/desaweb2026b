<?php

/**
 * router.php
 *
 * Script de ruteo usado únicamente por el servidor embebido de PHP
 * (php -S), que se ejecuta dentro del contenedor Docker.
 * Todas las peticiones pasan por aquí y se delegan al front controller
 * real: api/index.php
 */

require __DIR__ . '/api/index.php';

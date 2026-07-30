<?php

require_once __DIR__ . '/helpers/FileManager.php';

$fileManager = new FileManager();

echo "Personas actuales:\n";
print_r($fileManager->read());

echo "\nSiguiente ID:\n";
echo $fileManager->nextId();
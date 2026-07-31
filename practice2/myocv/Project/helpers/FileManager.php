<?php

/**
 * FileManager
 *
 * Encapsula las operaciones de lectura y escritura del archivo JSON
 * que funciona como "base de datos" de personas.
 */
class FileManager
{
    private string $filePath;

    public function __construct(string $filePath)
    {
        $this->filePath = $filePath;
        $this->ensureFileExists();
    }

    /**
     * Crea el archivo (y su carpeta contenedora) si todavía no existe.
     */
    private function ensureFileExists(): void
    {
        $dir = dirname($this->filePath);

        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([]));
        }
    }

    /**
     * Lee todo el contenido del archivo JSON y lo devuelve como arreglo.
     */
    public function readAll(): array
    {
        $content = file_get_contents($this->filePath);

        if ($content === false || trim($content) === '') {
            return [];
        }

        $data = json_decode($content, true);

        return is_array($data) ? $data : [];
    }

    /**
     * Escribe (sobrescribe) el archivo JSON con el arreglo dado.
     * Usa un lock exclusivo para evitar condiciones de carrera básicas.
     */
    public function writeAll(array $data): bool
    {
        $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        $fp = fopen($this->filePath, 'c+');
        if ($fp === false) {
            return false;
        }

        $success = false;
        if (flock($fp, LOCK_EX)) {
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, $json);
            fflush($fp);
            flock($fp, LOCK_UN);
            $success = true;
        }
        fclose($fp);

        return $success;
    }

    /**
     * Calcula el siguiente ID autoincremental en base a los registros existentes.
     */
    public function nextId(): int
    {
        $records = $this->readAll();

        if (empty($records)) {
            return 1;
        }

        $ids = array_column($records, 'id');

        return (int) max($ids) + 1;
    }
}

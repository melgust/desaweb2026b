<?php

declare(strict_types=1);

class FileManager
{
    public function __construct(private string $filePath)
    {
        $directory = dirname($this->filePath);

        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException('Unable to create data directory');
        }

        if (!file_exists($this->filePath)) {
            if (file_put_contents($this->filePath, '[]', LOCK_EX) === false) {
                throw new RuntimeException('Unable to create data file');
            }
        }

        $content = file_get_contents($this->filePath);

        if ($content === false) {
            throw new RuntimeException('Unable to read data file');
        }

        if (trim($content) === '') {
            if (file_put_contents($this->filePath, '[]', LOCK_EX) === false) {
                throw new RuntimeException('Unable to initialize data file');
            }
        }
    }

    public function read(): array
    {
        $content = file_get_contents($this->filePath);

        if ($content === false) {
            throw new RuntimeException('Unable to read data file');
        }

        if (trim($content) === '') {
            return [];
        }

        $persons = json_decode($content, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($persons)) {
            throw new RuntimeException('Stored JSON is invalid');
        }

        return $persons;
    }

    public function write(array $persons): void
    {
        $content = json_encode($persons, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        if ($content === false) {
            throw new RuntimeException('Unable to encode data');
        }

        if (file_put_contents($this->filePath, $content, LOCK_EX) === false) {
            throw new RuntimeException('Unable to write data file');
        }
    }
}

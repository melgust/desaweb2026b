<?php

namespace App\Helpers;

class FileManager
{
    private string $filePath;

    public function __construct(?string $filePath = null)
    {
        $this->filePath = $filePath ?? __DIR__ . '/../data/persons.json';
    }

    public function readData(): array
    {
        if (!file_exists($this->filePath)) {
            return [];
        }

        $content = file_get_contents($this->filePath);
        if ($content === false || empty(trim($content))) {
            return [];
        }

        $data = json_decode($content, true);
        return is_array($data) ? $data : [];
    }

    public function writeData(array $data): bool
    {
        $dir = dirname($this->filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }

        $jsonContent = json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        return file_put_contents($this->filePath, $jsonContent, LOCK_EX) !== false;
    }

    public function getNextId(array $data): int
    {
        $maxId = 0;
        foreach ($data as $item) {
            if (isset($item['id']) && is_numeric($item['id'])) {
                if ((int)$item['id'] > $maxId) {
                    $maxId = (int)$item['id'];
                }
            }
        }
        return $maxId + 1;
    }
}

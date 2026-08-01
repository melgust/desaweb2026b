<?php

class FileManager {
    private string $filePath;

    public function __construct(string $filePath) {
        $this->filePath = $filePath;
        $this->initializeFile();
    }

    private function initializeFile(): void {
        if (!file_exists($this->filePath)) {
            file_put_contents($this->filePath, json_encode([]));
        }
    }

    public function readAll(): array {
        $content = file_get_contents($this->filePath);
        return json_decode($content, true) ?? [];
    }

    public function writeAll(array $data): bool {
        return file_put_contents($this->filePath, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }

    public function findById(int $id): ?array {
        $persons = $this->readAll();
        foreach ($persons as $person) {
            if ($person['id'] === $id) {
                return $person;
            }
        }
        return null;
    }

    public function create(array $personData): array {
        $persons = $this->readAll();
        
        $maxId = 0;
        foreach ($persons as $p) {
            if ($p['id'] > $maxId) {
                $maxId = $p['id'];
            }
        }
        $personData['id'] = $maxId + 1;
        
        $persons[] = $personData;
        $this->writeAll($persons);
        
        return $personData;
    }

    public function update(int $id, array $personData): ?array {
        $persons = $this->readAll();
        $found = false;
        $index = -1;
        
        foreach ($persons as $key => $person) {
            if ($person['id'] === $id) {
                $persons[$key] = array_merge($person, $personData);
                $persons[$key]['id'] = $id;
                $found = true;
                $index = $key;
                break;
            }
        }
        
        if (!$found) {
            return null;
        }
        
        $this->writeAll($persons);
        return $persons[$index] ?? null;
    }

    public function delete(int $id): bool {
        $persons = $this->readAll();
        $found = false;
        
        foreach ($persons as $key => $person) {
            if ($person['id'] === $id) {
                unset($persons[$key]);
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            return false;
        }
        
        $this->writeAll(array_values($persons));
        return true;
    }
}
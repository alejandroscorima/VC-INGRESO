<?php
/**
 * Almacenamiento de archivos subidos (fotos).
 * Por ahora escribe en carpeta del servidor; la interfaz permite sustituir por S3 más adelante.
 *
 * Uso: require desde el controlador; llamar storePublicPhoto($_FILES['photo'], 'vehicles'|'pets').
 */

if (!function_exists('storePublicPhoto')) {
    /**
     * Guarda un archivo subido en la carpeta pública correspondiente y devuelve la URL.
     *
     * @param array|null $file Elemento de $_FILES (ej. $_FILES['photo'])
     * @param string     $subdir 'vehicles', 'pets' o 'profiles'
     * @return array ['success' => bool, 'photo_url' => string|null, 'error' => string|null]
     */
    function storePublicPhoto($file, string $subdir): array
    {
        $allowedExts = ['jpg', 'jpeg', 'png', 'gif'];
        $maxSizeBytes = 5 * 1024 * 1024; // 5 MB

        if (!$file || !isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return ['success' => false, 'photo_url' => null, 'error' => 'No se ha subido ninguna imagen'];
        }

        $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
        if (!in_array($ext, $allowedExts)) {
            return ['success' => false, 'photo_url' => null, 'error' => 'Formato no permitido. Use JPG, PNG o GIF.'];
        }

        if (($file['size'] ?? 0) > $maxSizeBytes) {
            return ['success' => false, 'photo_url' => null, 'error' => 'El archivo no debe superar 5 MB.'];
        }

        // Dentro de server/uploads/; en Docker el volumen uploads_data se monta aquí y el entrypoint crea las carpetas.
        $baseDir = __DIR__ . '/../uploads/public/' . $subdir . '/';
        if (!is_dir($baseDir)) {
            if (!@mkdir($baseDir, 0755, true)) {
                return ['success' => false, 'photo_url' => null, 'error' => 'Error al crear directorio de almacenamiento.'];
            }
        }

        $filename = date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $filepath = $baseDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            return ['success' => false, 'photo_url' => null, 'error' => 'Error al guardar la imagen.'];
        }

        $photoUrl = '/uploads/public/' . $subdir . '/' . $filename;
        return ['success' => true, 'photo_url' => $photoUrl, 'error' => null];
    }
}

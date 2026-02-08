<?php
// Simple sanitization helpers to strip tags and control characters from user input.
function sanitize_text($value)
{
    if ($value === null) {
        return null;
    }
    if (is_string($value)) {
        $value = trim($value);
        $value = strip_tags($value);
        // Remove control characters that should never be stored.
        return preg_replace('/[\x00-\x1F\x7F]/u', '', $value);
    }
    if (is_array($value)) {
        return array_map('sanitize_text', $value);
    }
    return $value;
}

function sanitize_payload(array $data, array $fields)
{
    $clean = [];
    foreach ($fields as $field) {
        $clean[$field] = array_key_exists($field, $data) ? sanitize_text($data[$field]) : null;
    }
    return $clean;
}

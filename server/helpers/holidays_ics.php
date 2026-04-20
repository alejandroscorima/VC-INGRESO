<?php
/**
 * Festivos desde calendario público ICS de Google (Perú).
 * Solo lectura; el resultado se usa de forma informativa en el frontend.
 */

/** URL oficial del feed iCal de festivos en Perú (Google Calendar). */
const HOLIDAYS_PE_ICS_URL =
    'https://calendar.google.com/calendar/ical/es-us.pe%23holiday%40group.v.calendar.google.com/public/basic.ics';

/** Tiempo de vida de la caché del ICS en disco (segundos). */
const HOLIDAYS_ICS_CACHE_TTL = 21600; // 6 h

/**
 * Descarga el ICS con caché en sys_get_temp_dir.
 */
function holidays_ics_fetch_raw(): ?string
{
    $cacheFile = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'vc_ingreso_holidays_pe_basic.ics';
    if (is_readable($cacheFile)) {
        $age = time() - (int) filemtime($cacheFile);
        if ($age >= 0 && $age < HOLIDAYS_ICS_CACHE_TTL) {
            $raw = @file_get_contents($cacheFile);
            if ($raw !== false && $raw !== '') {
                return $raw;
            }
        }
    }

    $raw = holidays_ics_http_get(HOLIDAYS_PE_ICS_URL);
    if ($raw === null || $raw === '') {
        if (is_readable($cacheFile)) {
            $stale = @file_get_contents($cacheFile);
            if ($stale !== false && $stale !== '') {
                return $stale;
            }
        }
        return null;
    }

    @file_put_contents($cacheFile, $raw);
    return $raw;
}

function holidays_ics_http_get(string $url): ?string
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_HTTPHEADER => [
                'Accept: text/calendar, */*',
                'User-Agent: VC-INGRESO/1.0',
            ],
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($body !== false && $code >= 200 && $code < 300) {
            return (string) $body;
        }
        return null;
    }

    $ctx = stream_context_create([
        'http' => [
            'timeout' => 25,
            'header' => "Accept: text/calendar\r\nUser-Agent: VC-INGRESO/1.0\r\n",
        ],
    ]);
    $body = @file_get_contents($url, false, $ctx);
    return $body !== false ? (string) $body : null;
}

/**
 * Despliega líneas ICS según RFC 5545 (unfold).
 *
 * @return list<string>
 */
function holidays_ics_unfold_lines(string $ics): array
{
    $ics = str_replace("\r\n", "\n", $ics);
    $lines = explode("\n", $ics);
    $out = [];
    foreach ($lines as $line) {
        if ($line === '') {
            continue;
        }
        if ($out !== [] && ($line[0] === ' ' || $line[0] === "\t")) {
            $out[count($out) - 1] .= substr($line, 1);
        } else {
            $out[] = $line;
        }
    }
    return $out;
}

function holidays_ics_unescape_text(string $s): string
{
    return str_replace(['\\n', '\\N', '\\,', '\\;', '\\\\'], ["\n", "\n", ',', ';', '\\'], $s);
}

/**
 * Extrae YYYYMMDD de una línea DTSTART/DTEND (VALUE=DATE o fecha en Z).
 */
function holidays_ics_line_to_ymd(string $line): ?string
{
    if (preg_match('/:(\d{8})(?:T|\s|$)/', $line, $m)) {
        return $m[1];
    }
    return null;
}

/**
 * @return list<array{start:string,endExclusive:string,summary:string}>
 */
function holidays_ics_parse_events(string $ics): array
{
    $events = [];
    $lines = holidays_ics_unfold_lines($ics);
    $n = count($lines);
    $i = 0;
    while ($i < $n) {
        if (strtoupper(trim($lines[$i])) !== 'BEGIN:VEVENT') {
            $i++;
            continue;
        }
        $i++;
        $dtstart = null;
        $dtend = null;
        $summary = '';
        while ($i < $n) {
            $ln = $lines[$i];
            $up = strtoupper($ln);
            if ($up === 'END:VEVENT') {
                break;
            }
            if (str_starts_with($up, 'DTSTART')) {
                $dtstart = holidays_ics_line_to_ymd($ln);
            } elseif (str_starts_with($up, 'DTEND')) {
                $dtend = holidays_ics_line_to_ymd($ln);
            } elseif (str_starts_with($up, 'SUMMARY')) {
                $pos = strpos($ln, ':');
                if ($pos !== false) {
                    $summary = holidays_ics_unescape_text(trim(substr($ln, $pos + 1)));
                }
            }
            $i++;
        }
        if ($dtstart !== null) {
            if ($dtend === null) {
                $d0 = DateTime::createFromFormat('Ymd', $dtstart);
                if ($d0) {
                    $d0->modify('+1 day');
                    $dtend = $d0->format('Ymd');
                } else {
                    $dtend = $dtstart;
                }
            }
            $events[] = [
                'start' => $dtstart,
                'endExclusive' => $dtend,
                'summary' => $summary !== '' ? $summary : 'Festivo',
            ];
        }
        $i++;
    }
    return $events;
}

/**
 * Convierte YYYYMMDD a YYYY-MM-DD.
 */
function holidays_ics_ymd_to_iso(string $ymd): string
{
    return substr($ymd, 0, 4) . '-' . substr($ymd, 4, 2) . '-' . substr($ymd, 6, 2);
}

/**
 * Días cubiertos por evento todo el día (DTEND exclusivo en iCal).
 *
 * @return list<string> YYYY-MM-DD
 */
function holidays_ics_expand_event_days(string $startYmd, string $endExclusiveYmd): array
{
    $start = DateTime::createFromFormat('Ymd', $startYmd);
    $endEx = DateTime::createFromFormat('Ymd', $endExclusiveYmd);
    if ($start === false) {
        return [];
    }
    if ($endEx === false) {
        return [holidays_ics_ymd_to_iso($startYmd)];
    }
    $days = [];
    $cur = clone $start;
    while ($cur < $endEx) {
        $days[] = $cur->format('Y-m-d');
        $cur->modify('+1 day');
    }
    return $days;
}

/**
 * Festivos en el rango [start_date, end_date] (inclusive), desde el ICS de Google.
 *
 * @return list<array{date:string,summary:string}>
 */
function holidays_ics_list_for_range(string $startDate, string $endDate): array
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
        return [];
    }
    if (strcmp($startDate, $endDate) > 0) {
        return [];
    }

    $raw = holidays_ics_fetch_raw();
    if ($raw === null || $raw === '') {
        return [];
    }

    $events = holidays_ics_parse_events($raw);
    /** @var array<string, list<string>> $byDate */
    $byDate = [];

    foreach ($events as $ev) {
        $days = holidays_ics_expand_event_days($ev['start'], $ev['endExclusive']);
        foreach ($days as $d) {
            if (strcmp($d, $startDate) >= 0 && strcmp($d, $endDate) <= 0) {
                $sum = $ev['summary'];
                if (!isset($byDate[$d])) {
                    $byDate[$d] = [];
                }
                if (!in_array($sum, $byDate[$d], true)) {
                    $byDate[$d][] = $sum;
                }
            }
        }
    }

    ksort($byDate);
    $out = [];
    foreach ($byDate as $date => $summaries) {
        $out[] = [
            'date' => $date,
            'summary' => implode(' · ', $summaries),
        ];
    }
    return $out;
}

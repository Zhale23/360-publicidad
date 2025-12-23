<?php

/**
 * API de contacto para 360 Publicidad
 * Envía emails usando Brevo API v3
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit();
}

// Cargar .env
function loadEnv($file)
{
    if (!file_exists($file)) return [];
    $env = [];
    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($k, $v) = explode('=', $line, 2);
        $env[trim($k)] = trim(trim($v), '\'"');
    }
    return $env;
}

$env = loadEnv(__DIR__ . '/../.env');

// Validar config
if (empty($env['BREVO_API_KEY'])) {
    http_response_code(500);
    echo json_encode(['error' => 'BREVO_API_KEY no configurada']);
    exit();
}

// Parsear JSON
$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido']);
    exit();
}

// Validar campos
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$message = trim($data['message'] ?? '');

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan campos requeridos']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email inválido']);
    exit();
}

// Preparar payload para Brevo
$fromEmail = $env['FROM_EMAIL'] ?? 'zharicklondos@gmail.com';
$targetEmail = $env['TARGET_EMAIL'] ?? 'zharicklondos@gmail.com';

$subject = "Nuevo mensaje de contacto: $name";

$htmlBody = "
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body { 
            margin: 0; 
            padding: 0; 
            background: #f5f5f5; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            color: #0F2435; 
        }
        .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
        .card { 
            background: #ffffff; 
            border-radius: 12px; 
            overflow: hidden; 
            border: 1px solid #e0e0e0;
            box-shadow: 0 4px 12px rgba(15, 36, 53, 0.1);
        }
        .hero { 
            background: linear-gradient(135deg, #0F2435 0%, #1a3a4a 100%); 
            padding: 40px 24px; 
            text-align: center;
            color: white;
        }
        .hero-title { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
            letter-spacing: -0.5px;
            color: #ffffff;
        }
        .hero-title-2 {
            color: #46C5C8;
        }
        .hero-subtitle { 
            margin: 8px 0 0; 
            font-size: 14px; 
            color: #46C5C8;
            opacity: 0.9;
        }
        .content { padding: 32px 24px; }
        .field { 
            margin-bottom: 16px; 
            padding: 12px 16px; 
            background: #f9f9f9; 
            border-left: 4px solid #46C5C8;
            border-radius: 4px;
        }
        .field-label { 
            font-size: 11px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            color: #46C5C8; 
            margin-bottom: 4px;
        }
        .field-value { 
            font-size: 15px; 
            color: #0F2435; 
            font-weight: 500;
            word-break: break-word;
        }
        .message-section { margin-top: 24px; }
        .message-label { 
            font-size: 11px; 
            font-weight: 700; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            color: #46C5C8; 
            margin-bottom: 12px;
        }
        .message-box { 
            background: #0F2435; 
            color: #f5f5f5; 
            padding: 20px; 
            border-radius: 8px;
            border: 1px solid #46C5C8;
            line-height: 1.6;
            font-size: 14px;
        }
        .footer { 
            background: #0F2435; 
            color: #94a3b8; 
            padding: 20px 24px; 
            font-size: 12px; 
            text-align: center;
            border-top: 3px solid #46C5C8;
        }
        .footer strong { color: #46C5C8; }
        .divider { height: 1px; background: #e0e0e0; margin: 0; }
    </style>
</head>
<body>
    <div class='wrapper'>
        <div class='card'>
            <div class='hero'>
                <h1 class='hero-title'>360<span class='hero-title-2'>Publicidad</span></h1>
                <p class='hero-subtitle'>Nuevo mensaje de contacto</p>
            </div>

            <div class='content'>
                <div class='field'>
                    <div class='field-label'> Nombre</div>
                    <div class='field-value'>" . htmlspecialchars($name) . "</div>
                </div>

                <div class='field'>
                    <div class='field-label'> Email</div>
                    <div class='field-value'>" . htmlspecialchars($email) . "</div>
                </div>

                <div class='field'>
                    <div class='field-label'> Teléfono</div>
                    <div class='field-value'>" . (empty($phone) ? 'No proporcionado' : htmlspecialchars($phone)) . "</div>
                </div>

                <div class='message-section'>
                    <div class='message-label'> Mensaje</div>
                    <div class='message-box'>" . nl2br(htmlspecialchars($message)) . "</div>
                </div>
            </div>

            <div class='footer'>
                <strong>360Publicidad</strong><br>
                Responderemos tu mensaje lo antes posible
            </div>
        </div>
    </div>
</body>
</html>
";

$payload = [
    'sender' => [
        'email' => $fromEmail,
        'name' => '360 Publicidad'
    ],
    'to' => [
        [
            'email' => $targetEmail,
            'name' => 'Equipo'
        ]
    ],
    'subject' => $subject,
    'htmlContent' => $htmlBody,
    'replyTo' => [
        'email' => $email,
        'name' => $name
    ]
];

// Enviar a Brevo
$ch = curl_init('https://api.brevo.com/v3/smtp/email');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        'api-key: ' . $env['BREVO_API_KEY'],
        'Content-Type: application/json'
    ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 15
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión: ' . $curlError]);
    exit();
}

if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado correctamente! Te responderemos pronto.'
    ]);
} else {
    $errorData = json_decode($response, true);
    http_response_code($httpCode);
    echo json_encode([
        'success' => false,
        'error' => $errorData['message'] ?? 'Error al enviar email',
        'code' => $httpCode
    ]);
}

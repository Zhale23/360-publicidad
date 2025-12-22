from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

app = Flask(__name__)
CORS(app)

# Brevo API key (preferred email sending method)
# Load and normalize Brevo API key (trim whitespace if present)
BREVO_API_KEY = os.getenv('BREVO_API_KEY')
if BREVO_API_KEY:
    BREVO_API_KEY = BREVO_API_KEY.strip()
# From address (optional)
FROM_EMAIL = os.getenv('FROM_EMAIL')
# Target recipient (default)
TARGET_EMAIL = os.getenv('TARGET_EMAIL', 'zlondono23@gmail.com')


# Serve index.html on root
@app.route('/')
def serve_index():
    return send_file('index.html')


# Serve static files (CSS, JS)
@app.route('/style.css')
def serve_style():
    return send_file('style.css', mimetype='text/css')


@app.route('/script.js')
def serve_script():
    return send_file('script.js', mimetype='application/javascript')


# Serve media files (images, videos)
@app.route('/media/<path:filename>')
def serve_media(filename):
    return send_from_directory('media', filename)


# Favicon to avoid 404
@app.route('/favicon.ico')
def favicon():
    try:
        return send_from_directory('media', 'favicon.ico')
    except Exception:
        # No favicon present; return 204 No Content
        return ('', 204)


def send_email(subject: str, body: str, to_email: str = TARGET_EMAIL, reply_to: str = None):
    # Must use Brevo API only
    if not BREVO_API_KEY:
        raise RuntimeError('BREVO_API_KEY not configured. Server is configured to use Brevo API only.')
    return send_via_brevo(subject, body, to_email=to_email, reply_to=reply_to)


def send_via_brevo(subject: str, body: str, to_email: str = TARGET_EMAIL, reply_to: str = None):
    """Send email through Brevo (Sendinblue) HTTP API using BREVO_API_KEY.
    Raises exception on HTTP error.
    """
    if not BREVO_API_KEY:
        raise RuntimeError('BREVO_API_KEY not configured')

    sender_email = FROM_EMAIL or 'zlondono23@gmail.com'
    url = 'https://api.brevo.com/v3/smtp/email'
    headers = {
        'api-key': BREVO_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
    payload = {
        'sender': {'name': '360 Publicidad', 'email': sender_email},
        'to': [{'email': to_email}],
        'subject': subject,
        'textContent': body
    }
    if reply_to:
        payload['replyTo'] = {'email': reply_to}

    try:
        print('Sending via Brevo API to', to_email, 'from', sender_email)
        resp = requests.post(url, headers=headers, json=payload, timeout=15)
        if resp.status_code in (200, 201):
            print('Brevo send OK', resp.status_code, resp.text)
            # return parsed response (may include messageId) for debugging
            try:
                return resp.json()
            except Exception:
                return {'status': resp.status_code}
        else:
            print('Brevo send failed', resp.status_code, resp.text)
            # raise a clearer error to return to client
            raise RuntimeError(f'Brevo API error {resp.status_code}: {resp.text}')
    except Exception as e:
        print('Exception during Brevo send:', repr(e))
        raise


@app.route('/api/validate-brevo', methods=['GET'])
def validate_brevo():
    """Validate the BREVO API key by calling GET /v3/account (does not expose the key).
    Returns basic account info or an error message.
    """
    if not BREVO_API_KEY:
        return jsonify({'ok': False, 'error': 'BREVO_API_KEY not configured'}), 400

    url = 'https://api.brevo.com/v3/account'
    headers = {'api-key': BREVO_API_KEY, 'Accept': 'application/json'}
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            # Return only non-sensitive account fields
            return jsonify({'ok': True, 'account': {'companyName': data.get('companyName'), 'plan': data.get('plan')}}), 200
        else:
            return jsonify({'ok': False, 'status': resp.status_code, 'details': resp.text}), 400
    except Exception as exc:
        return jsonify({'ok': False, 'error': str(exc)}), 500


@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    phone = data.get('phone', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({'error': 'Missing required fields (name, email, message).'}), 400

    subject = f'Nuevo mensaje de contacto: {name}'
    body = f"""
Nuevo mensaje desde el formulario de contacto:

Nombre: {name}
Correo: {email}
Teléfono: {phone}

Mensaje:
{message}
"""
    try:
        result = send_email(subject, body, to_email=TARGET_EMAIL, reply_to=email)
    except Exception as e:
        print('Error sending email:', e)
        return jsonify({'error': 'Error sending email.', 'details': str(e)}), 500

    return jsonify({'message': 'Mensaje enviado correctamente.', 'details': result}), 200


@app.route('/api/test-email', methods=['GET'])
def test_email():
    """Sends a test email to the configured TARGET_EMAIL to verify Brevo/API settings."""
    subject = 'Prueba de envío - 360 Publicidad'
    body = 'Este es un correo de prueba enviado desde el servidor de desarrollo para verificar la configuración de envío (Brevo).'
    try:
        result = send_email(subject, body)
        return jsonify({'message': 'Test email sent.', 'details': result}), 200
    except Exception as e:
        print('Test email failed:', e)
        return jsonify({'error': 'Test email failed.', 'details': str(e)}), 500


@app.route('/api/debug-mail', methods=['GET'])
def debug_mail():
    """Return mail-related config for debugging (does NOT include secrets)."""
    return jsonify({
        'BREVO_SET': bool(BREVO_API_KEY),
        'FROM_EMAIL': FROM_EMAIL,
        'TARGET_EMAIL': TARGET_EMAIL,
    }), 200


@app.route('/api/gallery/<path:category>', methods=['GET'])
def get_gallery(category):
    """Return list of image paths for a gallery category from /media/{category}."""
    import glob
    
    # Sanitize category name to prevent directory traversal
    category = category.strip().replace('..', '').replace('\\', '/')
    
    # Map category to media folder
    media_path = os.path.join('media', category)
    
    # Verify the path exists and is within media/
    if not os.path.isdir(media_path):
        return jsonify({'error': f'Category "{category}" not found.'}), 404
    
    # Get all image files (jpg, jpeg, png, gif, webp)
    image_extensions = ('*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp', '*.JPG', '*.JPEG', '*.PNG', '*.GIF', '*.WEBP')
    image_files = []
    
    for ext in image_extensions:
        pattern = os.path.join(media_path, ext)
        image_files.extend(sorted(glob.glob(pattern)))
    
    # Convert to relative paths for frontend
    image_paths = [path.replace('\\', '/') for path in image_files]
    
    return jsonify(image_paths), 200


@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Return portfolio items from all media categories."""
    import glob
    
    portfolio_items = []
    media_dir = 'media'
    
    # Get all subdirectories in media/ (except 4 BOTONES)
    for category_dir in os.listdir(media_dir):
        if category_dir.startswith('.'):
            continue
        
        category_path = os.path.join(media_dir, category_dir)
        if not os.path.isdir(category_path):
            continue
            
        # Skip 4 BOTONES (handled separately)
        if category_dir == '4 BOTONES':
            continue
        
        # Get images in this category
        image_extensions = ('*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp', '*.JPG', '*.JPEG', '*.PNG', '*.GIF', '*.WEBP')
        
        for ext in image_extensions:
            pattern = os.path.join(category_path, ext)
            for image_file in sorted(glob.glob(pattern)):
                relative_path = image_file.replace('\\', '/')
                # Normalize category name for filtering
                category_normalized = category_dir.lower().strip()
                
                portfolio_items.append({
                    'src': relative_path,
                    'title': f'{category_dir}',
                    'category': category_normalized
                })
    
    return jsonify(portfolio_items), 200


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f'Starting server on http://0.0.0.0:{port} (TARGET_EMAIL={TARGET_EMAIL})')
    app.run(host='0.0.0.0', port=port)




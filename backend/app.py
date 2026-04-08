import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from auth.routes import auth_bp
from auth.utils import verify_auth_header, decode_token
from validation import analyze_certificate

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')  # Change this in production
app.register_blueprint(auth_bp)


def token_required(f):
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        token = verify_auth_header(auth_header)

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            data = decode_token(token)
            current_user = data.get('user')
        except Exception:
            return jsonify({'message': 'Token is invalid or expired'}), 401

        return f(current_user, *args, **kwargs)

    decorated.__name__ = f.__name__
    return decorated


@app.route('/validate', methods=['POST'])
@token_required
def validate(current_user):
    cert_pem = None
    if 'certificate' in request.files:
        file = request.files['certificate']
        try:
            cert_pem = file.read().decode('utf-8')
        except Exception:
            return jsonify({'error': 'Uploaded file must be readable text PEM'}), 400
    elif 'certificate_text' in request.form:
        cert_pem = request.form['certificate_text']
    else:
        return jsonify({'error': 'No certificate provided'}), 400

    if not cert_pem or not cert_pem.strip():
        return jsonify({'status': 'Invalid', 'risk_level': 'High', 'explanation': 'No certificate data provided'}), 400

    try:
        result = analyze_certificate(cert_pem)
        return jsonify(result)
    except ValueError as exc:
        return jsonify({'status': 'Invalid', 'risk_level': 'High', 'explanation': str(exc)}), 400
    except Exception as exc:
        return jsonify({'status': 'Invalid', 'risk_level': 'High', 'explanation': f'Validation failed: {exc}'}), 400


if __name__ == '__main__':
    app.run(debug=True)

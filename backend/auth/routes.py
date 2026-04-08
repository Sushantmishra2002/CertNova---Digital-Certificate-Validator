from flask import Blueprint, request, jsonify
from .utils import users, hash_password, generate_token

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    if email in users:
        return jsonify({'success': False, 'message': 'User already exists.'}), 400

    users[email] = hash_password(password)
    return jsonify({'success': True, 'message': 'User registered successfully.'})


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    if email not in users or users[email] != hash_password(password):
        return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

    token = generate_token(email)
    return jsonify({'success': True, 'token': token, 'message': 'Login successful.'})

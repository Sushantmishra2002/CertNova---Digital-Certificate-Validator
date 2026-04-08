import hashlib
import os
import datetime
import jwt

SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')

users = {}


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def generate_token(email):
    payload = {
        'user': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def decode_token(token):
    return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])


def verify_auth_header(auth_header):
    if not auth_header:
        return None

    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1]

    return auth_header

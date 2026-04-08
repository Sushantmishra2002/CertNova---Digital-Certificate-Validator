from datetime import datetime
from cryptography import x509
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import padding, rsa, ec, dsa
from cryptography.hazmat.primitives import serialization


def verify_certificate_signature(cert):
    public_key = cert.public_key()
    signature = cert.signature
    data = cert.tbs_certificate_bytes
    algorithm = cert.signature_hash_algorithm

    try:
        if isinstance(public_key, rsa.RSAPublicKey):
            public_key.verify(signature, data, padding.PKCS1v15(), algorithm)
        elif isinstance(public_key, ec.EllipticCurvePublicKey):
            public_key.verify(signature, data, ec.ECDSA(algorithm))
        elif isinstance(public_key, dsa.DSAPublicKey):
            public_key.verify(signature, data, algorithm)
        else:
            return False
        return True
    except Exception:
        return False


def analyze_certificate(cert_pem):
    cert_blocks = cert_pem.split('-----END CERTIFICATE-----')
    if len(cert_blocks) > 1:
        cert_pem = cert_blocks[0] + '-----END CERTIFICATE-----'

    if '-----BEGIN CERTIFICATE-----' not in cert_pem:
        raise ValueError('Certificate input is not valid PEM format.')

    cert = x509.load_pem_x509_certificate(cert_pem.encode('utf-8'), default_backend())

    subject = str(cert.subject)
    issuer = str(cert.issuer)
    serial = str(cert.serial_number)
    sig_alg = cert.signature_algorithm_oid._name
    valid_from = cert.not_valid_before.strftime('%Y-%m-%d %H:%M:%S UTC')
    valid_to = cert.not_valid_after.strftime('%Y-%m-%d %H:%M:%S UTC')
    pub_key_pem = cert.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')

    now = datetime.utcnow()
    expired = now > cert.not_valid_after
    not_yet_valid = now < cert.not_valid_before
    is_self_signed = cert.subject == cert.issuer

    sig_verified = False
    if is_self_signed:
        sig_verified = verify_certificate_signature(cert)

    if expired:
        status = 'Expired'
    elif not_yet_valid:
        status = 'Invalid'
    elif is_self_signed and not sig_verified:
        status = 'Invalid'
    else:
        status = 'Valid'

    risk_level = 'Low'
    explanation = 'Certificate is valid and properly signed.'

    if expired:
        risk_level = 'High'
        explanation = 'Certificate has expired and should not be trusted.'
    elif not_yet_valid:
        risk_level = 'High'
        explanation = 'Certificate is not yet valid.'
    elif is_self_signed and not sig_verified:
        risk_level = 'Critical'
        explanation = 'Self-signed certificate signature verification failed - possible tampering.'
    elif is_self_signed:
        risk_level = 'Medium'
        explanation = 'Certificate is self-signed; verify issuer manually.'

    has_chain = len(cert_blocks) > 1
    if has_chain:
        explanation += ' Certificate chain detected; full validation requires issuer certificates.'

    warnings = []
    if expired:
        warnings.append('Certificate has expired')
    if not_yet_valid:
        warnings.append('Certificate is not yet valid')
    if is_self_signed and not sig_verified:
        warnings.append('Self-signed certificate signature verification failed')
    if not is_self_signed:
        warnings.append('Certificate is not self-signed; issuer trust cannot be fully verified without issuer certificate')
    if has_chain:
        warnings.append('Certificate chain present; only first certificate validated')

    return {
        'status': status,
        'risk_level': risk_level,
        'explanation': explanation,
        'subject': subject,
        'issuer': issuer,
        'serial_number': serial,
        'signature_algorithm': sig_alg,
        'valid_from': valid_from,
        'valid_to': valid_to,
        'public_key_pem': pub_key_pem,
        'is_self_signed': is_self_signed,
        'has_chain': has_chain,
        'warnings': warnings,
    }

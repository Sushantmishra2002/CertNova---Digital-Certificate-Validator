from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
import datetime

def create_certificate(subject_cn, days_valid, filename):
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    # Create subject
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "State"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "City"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Org"),
        x509.NameAttribute(NameOID.COMMON_NAME, subject_cn),
    ])
    
    now = datetime.datetime.now(datetime.timezone.utc)
    if days_valid > 0:
        not_before = now
        not_after = now + datetime.timedelta(days=days_valid)
    else:
        # For expired, set past dates
        not_before = now + datetime.timedelta(days=days_valid - 1)
        not_after = now + datetime.timedelta(days=days_valid)
    
    # Create certificate
    cert = x509.CertificateBuilder().subject_name(
        subject
    ).issuer_name(
        issuer
    ).public_key(
        private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        not_before
    ).not_valid_after(
        not_after
    ).sign(private_key, hashes.SHA256(), default_backend())
    
    # Write to file
    with open(filename, "wb") as f:
        f.write(cert.public_bytes(serialization.Encoding.PEM))

# Valid certificate
create_certificate("valid.example.com", 365, "valid.pem")

# Expired certificate
create_certificate("expired.example.com", -1, "expired.pem")

print("Sample certificates generated: valid.pem, expired.pem")
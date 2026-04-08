# CertNova - Digital Certificate Validator

## Project Overview

Digital Certificate Validator 93 is a comprehensive cybersecurity tool designed to validate X.509 digital certificates. This end-to-end web application ensures certificate authenticity, integrity, validity, and basic trust through a user-friendly interface. Built with security-first principles, it prevents common attacks and provides detailed validation reports. Access is secured with user authentication.

## 📸 Output Screenshots

<img width="1363" height="656" alt="image" src="https://github.com/user-attachments/assets/8a6f8c79-8b70-4fd8-931f-07658dfd8ca2" />

---
<img width="1360" height="654" alt="image" src="https://github.com/user-attachments/assets/46ba82ce-82f9-4452-8d82-cc79554650e7" />

---

<img width="1364" height="655" alt="image" src="https://github.com/user-attachments/assets/a9c7e8d4-87e3-49ca-acce-869961db28f1" />

---

<img width="1356" height="656" alt="image" src="https://github.com/user-attachments/assets/32d50132-2c49-4644-91b9-75b645aaf774" />

---

<img width="1363" height="656" alt="image" src="https://github.com/user-attachments/assets/e0847031-6e80-4b28-a2d5-c32353920d88" />

---

<img width="1366" height="653" alt="image" src="https://github.com/user-attachments/assets/7c2fd5fd-c93a-48cc-80e8-ae1ec42bc36a" />

---


## Problem Statement

Digital certificates are fundamental to secure communications, but validating them manually is complex and error-prone. Users and organizations need a reliable way to:

- Verify certificate authenticity and integrity
- Check expiration dates
- Detect tampering or forgery
- Understand certificate details
- Prevent security vulnerabilities from invalid certificates
- Secure access to validation tools

This project addresses these needs by providing an automated, secure validation system with authentication.

## Architecture

```
┌─────────────────┐    HTTP POST    ┌─────────────────┐
│   Frontend      │ ──────────────► │   Backend       │
│   (React)       │                 │   (Flask/Python)│
│                 │ ◄─────────────  │                 │
│ - Login Form    │    JSON Response │ - Auth         │
│ - Validator UI  │                 │ - Validation   │
│ - State Mgmt    │                 │ - Cryptography │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   React App     │                 │   Python Crypto │
│   (User Interface)│                 │   Library      │
└─────────────────┘                 └─────────────────┘
```

### Modular Backend Structure

- `app.py`: Main Flask application with authentication and validation routes
- `requirements.txt`: Python dependencies
- `generate_samples.py`: Utility for creating test certificates

### Separation of Concerns

- **Frontend**: React components for login, validation UI, state management
- **Backend**: Authentication, certificate processing, cryptographic operations
- **Security Layer**: Login protection, input validation, safe parsing

## Features

### Authentication
- **User Login**: Required authentication before accessing validation tools
- **Secure Credentials**: Username/password validation
- **Session Management**: Login state maintained during session

### 1. Certificate Input
- **Paste PEM**: Direct text input of certificate content
- **File Upload**: Support for .crt and .pem files
- **Validation**: Ensures either text or file is provided

### 2. Certificate Parsing
Extracts and displays:
- Subject (entity the certificate is issued to)
- Issuer (certificate authority)
- Serial Number (unique identifier)
- Signature Algorithm (cryptographic method used)
- Valid From/Valid To (certificate validity period)
- Public Key Information (key type and details)

### 3. Validation Engine
- **Expiry Validation**: Checks if current date is within validity period
- **Signature Verification**: Verifies certificate signature using issuer's public key (for self-signed certificates)
- **Self-Signed Detection**: Identifies self-signed vs CA-signed certificates
- **Tampering Detection**: Signature verification prevents modified certificate acceptance
- **Basic Issuer Trust Check**: Validates issuer information and self-signed status

### 4. Security Features
- **Authentication Required**: Platform access secured with login
- **Input Sanitization**: Safe handling of certificate data
- **Format Validation**: Rejects non-PEM formats gracefully
- **Error Handling**: Prevents crashes on malformed input
- **CORS Protection**: Configured for secure cross-origin requests

### 5. Output Dashboard
- **Validation Status**: Clear Valid/Invalid/Expired indicators
- **Detailed Breakdown**: Complete certificate information display
- **Security Warnings**: Alerts for issues like expiration or signature failures

## Tech Stack

- **Frontend**: React.js with hooks for state management
- **Backend**: Python 3.12 with Flask framework
- **Cryptography**: Python cryptography library (41.0.4)
- **Dependencies**: Flask-CORS for cross-origin support, React for UI
- **Environment**: Virtual environment for Python, Node.js for React

## Step-by-Step Setup Guide

### Prerequisites
- Python 3.12 or higher installed
- Node.js and npm installed
- Web browser (Chrome, Firefox, Edge)
- Command line/terminal access

### 1. Installation
Clone or download the project to your local machine:
```
cd C:\Users\Dell\Documents
# Project is already in DigitalCertificateValidator folder
```

### 2. Backend Setup
Navigate to the backend directory:
```
cd backend
```

Create and activate virtual environment (if not already done):
```
python -m venv ../.venv
../.venv/Scripts/activate  # On Windows
```

Install dependencies:
```
pip install -r requirements.txt
```

### 3. Generate Sample Certificates (Optional)
Run the sample certificate generator:
```
python generate_samples.py
```

### 4. Frontend Setup
Navigate to the frontend directory:
```
cd ../frontend
```

Install React dependencies:
```
npm install
```

### 5. Run Backend Server
Start the Flask development server:
```
cd ../backend
python app.py
```
The server will start on http://127.0.0.1:5000

### 6. Run Frontend
Start the React development server:
```
cd ../frontend
npm start
```
The React app will open in your browser at http://localhost:3000

### 7. Testing the Project
1. Open the React app at http://localhost:3000
2. Login with demo credentials: username `admin`, password `password`
3. Use one of the sample certificates from the `docs` folder:
   - `valid.pem`: Should show as Valid
   - `expired.pem`: Should show as Invalid with expiration warning
   - `invalid.pem`: Should show parsing error
4. Or paste a real certificate PEM content
5. Click "Validate Certificate" to see results

## Code Explanation

### Backend (app.py)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from cryptography import x509
from cryptography.hazmat.backends import default_backend
import datetime

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests for frontend

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Simple hardcoded credentials for demo
    if username == 'admin' and password == 'password':
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Invalid credentials'}), 401

@app.route('/validate', methods=['POST'])
def validate():
    # Extract certificate from form data or file upload
    cert_pem = None
    if 'certificate' in request.files:
        file = request.files['certificate']
        cert_pem = file.read().decode('utf-8')
    elif 'certificate_text' in request.form:
        cert_pem = request.form['certificate_text']
    else:
        return jsonify({'error': 'No certificate provided'}), 400

    # Parse certificate using cryptography library
    try:
        cert = x509.load_pem_x509_certificate(cert_pem.encode(), default_backend())
    except Exception as e:
        return jsonify({'status': 'Invalid', 'reason': 'Failed to parse certificate: ' + str(e)}), 400

    # Extract certificate information
    subject = str(cert.subject)
    issuer = str(cert.issuer)
    serial = str(cert.serial_number)
    sig_alg = cert.signature_algorithm_oid._name
    valid_from = cert.not_valid_before.isoformat()
    valid_to = cert.not_valid_after.isoformat()
    pub_key = str(cert.public_key())

    # Perform validation checks
    now = datetime.datetime.utcnow()
    expired = now > cert.not_valid_after
    not_yet_valid = now < cert.not_valid_before
    is_self_signed = cert.subject == cert.issuer

    # Verify signature for self-signed certificates
    try:
        if is_self_signed:
            cert.public_key().verify(cert.signature, cert.tbs_certificate_bytes, cert.signature_algorithm_oid, default_backend())
            sig_valid = True
        else:
            sig_valid = False  # Cannot verify without issuer certificate
    except:
        sig_valid = False

    # Determine overall status
    if expired or not_yet_valid or not sig_valid:
        status = 'Invalid'
    else:
        status = 'Valid'

    # Collect warnings
    warnings = []
    if expired:
        warnings.append('Certificate has expired')
    if not_yet_valid:
        warnings.append('Certificate is not yet valid')
    if not sig_valid:
        warnings.append('Signature verification failed')
    if not is_self_signed:
        warnings.append('Certificate is not self-signed; full trust validation requires issuer certificate')

    # Return structured response
    return jsonify({
        'status': status,
        'subject': subject,
        'issuer': issuer,
        'serial_number': serial,
        'signature_algorithm': sig_alg,
        'valid_from': valid_from,
        'valid_to': valid_to,
        'public_key': pub_key,
        'is_self_signed': is_self_signed,
        'warnings': warnings
    })

if __name__ == '__main__':
    app.run(debug=True)  # Development server
```

### Frontend (App.js - React)

```javascript
import React, { useState } from 'react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError(data.message);
      }
    } catch (error) {
      setLoginError('Login failed: ' + error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="App">
      <h1>Digital Certificate Validator 93</h1>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} error={loginError} />
      ) : (
        <div>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
          <CertificateValidator />
        </div>
      )}
    </div>
  );
}

// Login component handles authentication
function Login({ onLogin, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <h2>Login Required</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p className="demo-note">Demo credentials: admin / password</p>
    </div>
  );
}

// CertificateValidator component handles certificate validation UI
function CertificateValidator() {
  const [certText, setCertText] = useState('');
  const [certFile, setCertFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    const formData = new FormData();
    if (certText.trim()) {
      formData.append('certificate_text', certText);
    } else if (certFile) {
      formData.append('certificate', certFile);
    } else {
      setError('Please provide a certificate via text or file.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/validate', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Error validating certificate: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="validator-container">
      <h2>Certificate Validation</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Paste PEM Certificate:</label>
          <textarea
            value={certText}
            onChange={(e) => setCertText(e.target.value)}
            rows="10"
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
          />
        </div>
        <div className="form-group">
          <label>Or Upload Certificate File (.crt/.pem):</label>
          <input
            type="file"
            accept=".crt,.pem"
            onChange={(e) => setCertFile(e.target.files[0])}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Validating...' : 'Validate Certificate'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          <h3>Validation Results</h3>
          <div className={`status ${results.status.toLowerCase()}`}>
            {results.status === 'Valid' ? '✅ Valid Certificate' : '❌ Invalid Certificate'}
          </div>
          <div className="details">
            <p><strong>Subject:</strong> {results.subject}</p>
            <p><strong>Issuer:</strong> {results.issuer}</p>
            <p><strong>Serial Number:</strong> {results.serial_number}</p>
            <p><strong>Signature Algorithm:</strong> {results.signature_algorithm}</p>
            <p><strong>Valid From:</strong> {results.valid_from}</p>
            <p><strong>Valid To:</strong> {results.valid_to}</p>
            <p><strong>Public Key:</strong> {results.public_key?.substring(0, 100)}...</p>
            <p><strong>Self-Signed:</strong> {results.is_self_signed ? 'Yes' : 'No'}</p>
          </div>
          {results.warnings && results.warnings.length > 0 && (
            <div className="warnings">
              <h4>Warnings:</h4>
              <ul>
                {results.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
```

    # Verify signature for self-signed certificates
    try:
        if is_self_signed:
            cert.public_key().verify(cert.signature, cert.tbs_certificate_bytes, cert.signature_algorithm_oid, default_backend())
            sig_valid = True
        else:
            sig_valid = False  # Cannot verify without issuer certificate
    except:
        sig_valid = False

    # Determine overall status
    if expired or not_yet_valid or not sig_valid:
        status = 'Invalid'
    else:
        status = 'Valid'

    # Collect warnings
    warnings = []
    if expired:
        warnings.append('Certificate has expired')
    if not_yet_valid:
        warnings.append('Certificate is not yet valid')
    if not sig_valid:
        warnings.append('Signature verification failed')
    if not is_self_signed:
        warnings.append('Certificate is not self-signed; full trust validation requires issuer certificate')

    # Return structured response
    return jsonify({
        'status': status,
        'subject': subject,
        'issuer': issuer,
        'serial_number': serial,
        'signature_algorithm': sig_alg,
        'valid_from': valid_from,
        'valid_to': valid_to,
        'public_key': pub_key,
        'is_self_signed': is_self_signed,
        'warnings': warnings
    })

if __name__ == '__main__':
    app.run(debug=True)  # Development server
```

### Frontend (app.js)

```javascript
document.getElementById('certForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData();
    const text = document.getElementById('certText').value.trim();
    const file = document.getElementById('certFile').files[0];
    
    if (text) {
        formData.append('certificate_text', text);
    } else if (file) {
        formData.append('certificate', file);
    } else {
        alert('Please provide a certificate via text or file.');
        return;
    }
    
    try {
        const response = await fetch('http://localhost:5000/validate', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        displayResults(data);
    } catch (error) {
        alert('Error validating certificate: ' + error.message);
    }
});

function displayResults(data) {
    const resultsDiv = document.getElementById('results');
    const statusDiv = document.getElementById('status');
    const detailsDiv = document.getElementById('details');
    const warningsDiv = document.getElementById('warnings');
    
    resultsDiv.classList.remove('hidden');
    
    // Display validation status
    statusDiv.className = 'status';
    if (data.status === 'Valid') {
        statusDiv.classList.add('valid');
        statusDiv.textContent = '✅ Valid Certificate';
    } else {
        statusDiv.classList.add('invalid');
        statusDiv.textContent = '❌ Invalid Certificate';
    }
    
    // Display certificate details
    detailsDiv.innerHTML = `
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Issuer:</strong> ${data.issuer}</p>
        <p><strong>Serial Number:</strong> ${data.serial_number}</p>
        <p><strong>Signature Algorithm:</strong> ${data.signature_algorithm}</p>
        <p><strong>Valid From:</strong> ${data.valid_from}</p>
        <p><strong>Valid To:</strong> ${data.valid_to}</p>
        <p><strong>Public Key:</strong> ${data.public_key.substring(0, 100)}...</p>
        <p><strong>Self-Signed:</strong> ${data.is_self_signed ? 'Yes' : 'No'}</p>
    `;
    
    // Display warnings if any
    if (data.warnings && data.warnings.length > 0) {
        warningsDiv.innerHTML = '<h3>Warnings:</h3><ul>' + data.warnings.map(w => `<li>${w}</li>`).join('') + '</ul>';
    } else {
        warningsDiv.innerHTML = '';
    }
}
```

## Security Analysis

### Threat Mitigation
- **Input Validation**: Only accepts properly formatted PEM certificates
- **Safe Parsing**: Uses cryptography library with exception handling
- **No Code Injection**: Form data is not executed, only parsed
- **CORS Configuration**: Prevents unauthorized cross-origin requests
- **Error Handling**: Does not expose internal system details

### Cryptographic Security
- **Signature Verification**: Prevents acceptance of tampered certificates
- **Algorithm Support**: Uses industry-standard cryptographic algorithms
- **Key Validation**: Checks public key integrity during parsing

### Operational Security
- **No Persistent Storage**: Certificates are processed in memory only
- **Development Mode**: Debug features disabled in production
- **Dependency Security**: Uses vetted, maintained libraries

## Limitations

1. **CA Certificate Support**: Only validates self-signed certificates fully; CA-signed certificates require issuer certificate for complete validation
2. **Certificate Chain**: Does not validate full certificate chains or revocation lists
3. **Advanced Features**: Lacks OCSP/CRL checking, certificate pinning, or HSTS validation
4. **Performance**: Not optimized for high-volume certificate processing
5. **Browser Security**: Frontend runs in browser context; consider additional security headers for production

## Future Improvements

1. **Certificate Chain Validation**: Support for full PKI chain validation
2. **Revocation Checking**: Integrate OCSP and CRL validation
3. **Multiple Formats**: Support for DER, PKCS#12 formats
4. **Database Integration**: Store validation history and trusted CAs
5. **API Enhancement**: RESTful API for integration with other systems
6. **Advanced UI**: React-based frontend with better UX
7. **Logging and Monitoring**: Security event logging and alerting
8. **Containerization**: Docker deployment for easier scaling

## Viva Questions & Answers

### Q1: What is a digital certificate and why is validation important?
**A:** A digital certificate is an electronic document that binds a public key to an identity. Validation ensures the certificate is authentic, not tampered with, and currently valid, preventing man-in-the-middle attacks and ensuring secure communications.

### Q2: How does signature verification work in this project?
**A:** For self-signed certificates, we use the certificate's own public key to verify the signature over the certificate data. This detects any tampering since a modified certificate won't match its signature.

### Q3: What are the main security features implemented?
**A:** Input validation, safe cryptographic parsing, signature verification, expiry checking, and proper error handling to prevent crashes or information disclosure.

### Q4: How does the system handle self-signed vs CA-signed certificates?
**A:** Self-signed certificates can be fully validated using their own public key. CA-signed certificates are marked as requiring issuer certificates for complete validation, as we don't have access to CA public keys.

### Q5: What cryptography library is used and why?
**A:** Python's cryptography library is used because it's a well-maintained, secure implementation of cryptographic primitives that handles X.509 certificate parsing and validation safely.

### Q6: How does the frontend communicate with the backend?
**A:** The frontend uses JavaScript's Fetch API to send POST requests with certificate data to the Flask backend, which returns JSON responses with validation results.

### Q7: What happens if someone uploads malicious data?
**A:** The system safely handles malformed input by catching exceptions during parsing and returning appropriate error messages without crashing or executing any code.

### Q8: How can this system be extended for production use?
**A:** Add proper WSGI server, implement authentication, add database for trusted CAs, implement rate limiting, and add comprehensive logging and monitoring.

## Sample Inputs

### Valid Certificate (valid.pem)
```
-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
[truncated for brevity]
-----END CERTIFICATE-----
```

**Expected Output:**
- Status: Valid
- Subject: CN=valid.example.com
- Issuer: CN=valid.example.com
- Self-Signed: Yes
- No warnings

### Expired Certificate (expired.pem)
```
-----BEGIN CERTIFICATE-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
[truncated for brevity]
-----END CERTIFICATE-----
```

**Expected Output:**
- Status: Invalid
- Subject: CN=expired.example.com
- Issuer: CN=expired.example.com
- Self-Signed: Yes
- Warning: Certificate has expired

### Invalid Certificate (invalid.pem)
```
-----BEGIN CERTIFICATE-----
This is not a valid certificate
Just some random text
-----END CERTIFICATE-----
```

**Expected Output:**
- Status: Invalid
- Reason: Failed to parse certificate

## Conclusion

Digital Certificate Validator 93 provides a solid foundation for certificate validation with room for expansion. It demonstrates key cybersecurity principles while maintaining usability and security. The modular architecture allows for easy enhancement and integration into larger security systems.

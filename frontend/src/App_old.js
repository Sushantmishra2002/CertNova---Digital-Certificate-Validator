import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default App;

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

  const downloadReport = () => {
    if (!results) return;
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'certificate_validation_report.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Valid': return 'green';
      case 'Expired': return 'red';
      case 'Invalid': return 'red';
      default: return 'yellow';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'green';
      case 'Medium': return 'yellow';
      case 'High': return 'orange';
      case 'Critical': return 'red';
      default: return 'gray';
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
        <div className="results-card">
          <div className="status-header" style={{ backgroundColor: getStatusColor(results.status) }}>
            <h3>Validation Status: {results.status}</h3>
            <p>Risk Level: <span style={{ color: getRiskColor(results.risk_level) }}>{results.risk_level}</span></p>
          </div>
          <div className="explanation">
            <p><strong>Explanation:</strong> {results.explanation}</p>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <strong>Subject:</strong> {results.subject}
            </div>
            <div className="detail-item">
              <strong>Issuer:</strong> {results.issuer}
            </div>
            <div className="detail-item">
              <strong>Serial Number:</strong> {results.serial_number}
            </div>
            <div className="detail-item">
              <strong>Signature Algorithm:</strong> {results.signature_algorithm}
            </div>
            <div className="detail-item">
              <strong>Valid From:</strong> {results.valid_from}
            </div>
            <div className="detail-item">
              <strong>Valid To:</strong> {results.valid_to}
            </div>
            <div className="detail-item">
              <strong>Self-Signed:</strong> {results.is_self_signed ? 'Yes' : 'No'}
            </div>
            <div className="detail-item">
              <strong>Has Chain:</strong> {results.has_chain ? 'Yes' : 'No'}
            </div>
          </div>
          <div className="public-key">
            <h4>Public Key (PEM Format):</h4>
            <pre>{results.public_key_pem}</pre>
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
          <button onClick={downloadReport} className="download-btn">Download Report (JSON)</button>
        </div>
      )}
    </div>
  );
}

export default App;

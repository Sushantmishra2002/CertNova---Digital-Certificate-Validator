import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { token, user, logout } = useAuth();
  const [certificateText, setCertificateText] = useState('');
  const [certificateFile, setCertificateFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);
    setLoading(true);

    const formData = new FormData();
    if (certificateFile) {
      formData.append('certificate', certificateFile);
    } else if (certificateText.trim()) {
      formData.append('certificate_text', certificateText);
    } else {
      setError('Please provide a certificate');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/validate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else if (response.status === 401) {
        setError('Session expired. Please sign in again.');
        logout();
        navigate('/login');
      } else {
        setError(data.error || data.message || 'Validation failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCertificateFile(file);
    setCertificateText('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Valid': return 'text-accent-green';
      case 'Invalid': return 'text-accent-red';
      case 'Expired': return 'text-accent-red';
      default: return 'text-accent-yellow';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-accent-green text-white';
      case 'Medium': return 'bg-accent-yellow text-black';
      case 'High': return 'bg-accent-red text-white';
      case 'Critical': return 'bg-red-800 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'certificate-validation-results.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-secondary-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8 text-center">
            <p className="text-sm uppercase tracking-[0.25em] text-primary-600 dark:text-primary-400 mb-3">Certificate Analysis</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Certificate Validation Dashboard
            </h1>
            {user?.email && (
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Signed in as <span className="font-semibold text-primary-600 dark:text-primary-300">{user.email}</span>
              </p>
            )}
          </div>

          <div className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Certificate PEM Text
                </label>
                <textarea
                  value={certificateText}
                  onChange={(e) => {
                    setCertificateText(e.target.value);
                    setCertificateFile(null);
                  }}
                  placeholder="Paste your certificate in PEM format here..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white"
                  disabled={!!certificateFile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or Upload Certificate File
                </label>
                <input
                  type="file"
                  accept=".pem,.crt,.cer"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-secondary-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900 file:text-primary-700 dark:file:text-white hover:file:bg-primary-100 dark:hover:file:bg-primary-800"
                  disabled={!!certificateText.trim()}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Validating...' : 'Validate Certificate'}
              </button>
            </form>
          </div>

          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Validation Results</h2>
                <button
                  onClick={downloadResults}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Download JSON
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-secondary-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Status</h3>
                  <p className={`text-2xl font-bold ${getStatusColor(results.status)}`}>
                    {results.status}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-secondary-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Risk Level</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(results.risk_level)}`}>
                    {results.risk_level}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Explanation</h3>
                <p className="text-gray-700 dark:text-gray-300">{results.explanation}</p>
              </div>

              {results.warnings && results.warnings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Warnings</h3>
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                    {results.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certificate Details</h3>
                  <div className="space-y-2">
                    <div><strong>Subject:</strong> {results.subject}</div>
                    <div><strong>Issuer:</strong> {results.issuer}</div>
                    <div><strong>Serial Number:</strong> {results.serial_number}</div>
                    <div><strong>Signature Algorithm:</strong> {results.signature_algorithm}</div>
                    <div><strong>Valid From:</strong> {results.valid_from}</div>
                    <div><strong>Valid To:</strong> {results.valid_to}</div>
                    <div><strong>Self-Signed:</strong> {results.is_self_signed ? 'Yes' : 'No'}</div>
                    <div><strong>Chain Detected:</strong> {results.has_chain ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Public Key</h3>
                  <pre className="bg-gray-100 dark:bg-secondary-700 p-4 rounded text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
                    {results.public_key_pem}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
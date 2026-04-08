import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-secondary-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Digital Certificate Validator 93
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Professional X.509 certificate validation tool for cybersecurity professionals.
              Ensure the integrity and validity of digital certificates with advanced analysis.
            </p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">How It Works</a></li>
              <li><a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Team Member</h4>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300">Swetha I</li>
              <li className="text-gray-600 dark:text-gray-300">Sushant Kumar Mishra</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            © CertNova - Digital Certificate Validator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
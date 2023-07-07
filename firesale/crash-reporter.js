const { crashReporter } = require('electron');
const request = require('request');
const manifest = require('../package.json');

const host = 'http://localhost:3000/';

const config = {
    productName: 'Fire Sale',
    companyName: 'Electron in Action',
    submitURL: host + 'crashreports',
    uploadToServer: true,
    compress: false,  // This must be set, otherwise the reporter don't sent report in a file format
    ignoreSystemCrashHandler: false, // Do not forward crashes that occur in the main process to the system crash handler
    // rateLimit: false,        // Don't limit the number of uploads to once per hour (Windows, macOS)
}

crashReporter.start(config)

const sendUncaughtException = error => {
    const { productName, companyName } = config;
    request.post(host + 'uncaughtexceptions', {
        form: {
            _productName: productName,
            _companyName: companyName,
            _version: manifest.version,
            platform: process.platform,
            process_type: process.type,
            ver: process.versions.electron,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
        },
    });
};

if (process.type === 'browser') {
    process.on('uncaughtException', sendUncaughtException);
} else {
    window.addEventListener('error', sendUncaughtException);
}

console.log('[INFO] Crash reporting started.', crashReporter);

module.exports = crashReporter;


const http = require('http');
const fs = require('fs');
const path = require('path');

// Use PORT env var, default to 3000 for service mode
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1'; // Localhost only - proxied through lighttpd
const BASE_PATH = process.env.BASE_PATH || '/dashboard';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url;

    // Handle base path (e.g., /dashboard)
    if (urlPath === BASE_PATH || urlPath === BASE_PATH + '/') {
        urlPath = '/index.html';
    } else if (urlPath.startsWith(BASE_PATH + '/')) {
        urlPath = urlPath.replace(BASE_PATH, '');
    } else if (urlPath === '/' || urlPath === '') {
        // Also handle root for direct access
        urlPath = '/index.html';
    }

    const filePath = path.join(__dirname, 'public', urlPath);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If file not found, serve index.html for SPA-like behavior
                fs.readFile(path.join(__dirname, 'public', 'index.html'), (err2, content2) => {
                    if (err2) {
                        res.writeHead(500);
                        res.end('Server Error');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content2);
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log(`ADS-B Dashboard server running at:`);
    console.log(`  - http://${HOST}:${PORT}${BASE_PATH}`);
});

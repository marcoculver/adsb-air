const http = require('http');
const fs = require('fs');
const path = require('path');

// Use PORT env var, or 80 for production (requires sudo), or 8080 for dev
const PORT = process.env.PORT || (process.getuid && process.getuid() === 0 ? 80 : 8080);
const HOST = '0.0.0.0'; // Listen on all interfaces

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

    // Handle /clock route
    if (urlPath === '/clock' || urlPath === '/clock/') {
        urlPath = '/index.html';
    } else if (urlPath.startsWith('/clock/')) {
        urlPath = urlPath.replace('/clock', '');
    }

    // Default to index.html
    if (urlPath === '/') {
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
    console.log(`Flight Timers server running at:`);
    console.log(`  - Local:   http://localhost:${PORT}/clock`);
    console.log(`  - Network: http://<your-ip>:${PORT}/clock`);
    console.log(`\nPress Ctrl+C to stop`);
});

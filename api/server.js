const express = require('express');
const path = require('path');
const app = express();

// Set the public directory to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;
// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 3000;

// Serve static files directly
app.use(express.static('dist'));

// Simple middleware to serve index.html for any request
app.use((req, res) => {
    const indexPath = path.resolve(__dirname, 'dist', 'index.html');

    // Check if the file exists first
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).send('Build files not found. Make sure to run "npm run build" first.');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
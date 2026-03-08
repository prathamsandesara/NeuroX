const express = require('express');
const app = express();

// Simple test to see if multer is the issue
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/test-upload', upload.single('resume'), (req, res) => {
    console.log('File received:', req.file);
    res.json({ success: true, file: req.file ? 'received' : 'not received' });
});

app.listen(5555, () => {
    console.log('Test server running on port 5555');
});

const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (accessible at http://localhost:${PORT})`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n[ERROR] Port ${PORT} is already in use. Kill the process first:\n  kill -9 $(lsof -ti:${PORT})\nThen restart.\n`);
        process.exit(1);
    } else {
        throw err;
    }
});

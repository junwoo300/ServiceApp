const fs = require('node:fs');
const path = require('node:path');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) process.loadEnvFile(envPath);

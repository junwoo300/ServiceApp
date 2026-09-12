const { randomBytes, scryptSync } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const envFile = path.join(__dirname, '..', '.env');
const passwordFile = path.join(__dirname, '..', '.initial-password.txt');
const existing = fs.existsSync(envFile) ? fs.readFileSync(envFile, 'utf8') : '';
if (/^APP_PASSWORD_HASH=\S+/m.test(existing)) {
  throw new Error('Password already configured. Remove APP_PASSWORD_HASH from server/.env to generate a replacement.');
}
const password = randomBytes(24).toString('base64url');
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
fs.writeFileSync(passwordFile, password + '\n', { flag: 'wx', mode: 0o600 });
fs.writeFileSync(envFile, `${existing.replace(/^APP_PASSWORD_HASH=.*$/m, '').trimEnd()}\nAPP_PASSWORD_HASH=${salt}:${hash}\n`, { mode: 0o600 });
console.log('Configured password hash. Read server/.initial-password.txt for the generated password; store it securely and remove that file.');

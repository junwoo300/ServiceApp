# Service APP

Frontend: React. Backend: Express + MongoDB. Chat uses local Ollama; the Python training script is a separate experiment.

## Run locally

Requires Node.js 22.16+ and MongoDB at `mongodb://127.0.0.1:27017/ServiceTeam`.

1. In `server`, install dependencies with `npm ci` if needed.
2. Run `npm run setup:auth` once. It creates `server/.env` containing a salted password hash and `server/.initial-password.txt` containing the generated password. Read the password locally, store it securely, then remove the password text file. Do not commit either file.
3. Run `npm start` in `server`.
4. In `service`, install dependencies with `npm ci` if needed, then run `npm start` and open `http://localhost:3000`.
5. Sign in using the generated password. The previous password embedded in the frontend no longer works.

For an existing installation where setup has already run, use its generated password; do not rerun setup. To rotate the password, remove the `APP_PASSWORD_HASH` line from `server/.env` and remove the old `.initial-password.txt` after storing it, rerun setup, and restart the backend.

The frontend uses `/api` and `/uploads` on the same origin. CRA proxies these paths to `http://127.0.0.1:5000` during development. Restart both processes after changing configuration. `service/.env.example` documents the frontend settings.

## Sessions and deployment

The shared team password is checked only on the backend using scrypt. All business API routes and uploaded files require a server session. Sessions expire after eight hours and are invalidated on logout or backend restart. Five failed attempts per IP within 15 minutes temporarily block login. This implementation retains a single shared access level; it does not add individual accounts or roles.

Sessions and login counters are in memory and support one backend process. Before running multiple instances, use a shared session/rate-limit store. Behind a reverse proxy, the current rate limit groups requests by the connection IP seen by Express.

For deployment, serve the built frontend and reverse-proxy `/api` and `/uploads` under the same HTTPS origin. Set `NODE_ENV=production` and `FRONTEND_ORIGINS` to the exact public origin in `server/.env`; secure cookies then require HTTPS. Development defaults include the CRA proxy target because CRA rewrites the Origin header. API mutations require `X-Service-App: 1`; the frontend adds it automatically. A standalone static frontend without these proxy routes cannot reach the backend.

## Telegram

Replace the previously exposed bot tokens through the bot owner's Telegram account. Moving tokens out of source does not revoke them, and old values remain in Git history or old build artifacts.

Configure `TELEGRAM_BILL_TOKEN`, `TELEGRAM_BILL_CHAT_ID`, `TELEGRAM_ONSITE_TOKEN`, and `TELEGRAM_ONSITE_CHAT_ID` only in `server/.env` (see its example). Do not use `REACT_APP_*` for secrets. Missing configuration leaves the corresponding integration disabled; the test-message API returns 503. Restarting the backend after configuring Telegram enables its scheduled reminders / onsite bot.

The web test button calls the authenticated backend endpoint. It does not receive a bot token.

## Uploads and tests

Image routes accept JPEG, PNG, GIF, or BMP up to 5 MiB, check the extension, MIME type and initial file signature, and save a random filename. Excel imports accept `.xls` / `.xlsx` up to 5 MiB. All upload routes require login.

- Backend: run `npm test` in `server`. Tests start temporary local HTTP servers, mock persistence for the successful upload, and remove their own test file. They do not connect to MongoDB or send Telegram messages.
- Frontend: run `npm test -- --watchAll=false --runInBand` in `service`.
- Build: run `npm run build` in `service`.

`.gitignore` prevents new environment files, dependencies, model output, and logs from being added. Files already tracked by Git remain tracked.

## Python experiment

`python/train_model.py` now predicts a sequence of character tokens using an encoder/decoder. It saves the model, tokenizer, and sequence lengths together under `python/model`. Its three example records are only suitable for a smoke test, not useful chatbot training.

Create a fresh Python environment and install TensorFlow, NumPy, and scikit-learn compatible with that Python version. The checked-in `python/venv` points at another machine and should not be reused. Run `python python/train_model.py --epochs 1` for a smoke test, or use `--data` and `--output` to select data and output paths. The web chat continues to call Ollama independently.

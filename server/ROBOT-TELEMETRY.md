# Robot status

## Scheduled Telegram reports

Enable `TELEGRAM_ROBOT_ENABLED=true` and set `TELEGRAM_ROBOT_TOKEN` / `TELEGRAM_ROBOT_CHAT_ID` in `server/.env`, then restart the backend. These can use the same credentials and destination as the Onsite bot. No extra polling bot is started.

- 08:00 Asia/Bangkok: current online/offline status.
- 00:00 Asia/Bangkok: current status plus the preceding calendar day's cleaning area (for example, 00:00 on Sep 13 reports Sep 12).

The backend must remain running with network access at both times. Run one backend instance for this scheduler. Jobs do not backfill missed runs after downtime. Failed sends are logged without tokens and are not automatically retried, to avoid duplicating partially sent reports. Source/API errors never produce a fabricated offline report.

Reports use the same formatter as the web summary (`service/src/components/Page/Robot/robotReportText.js`), so include that source file when deploying the backend. Long reports are split into plain-text messages below the [Telegram sendMessage limit](https://core.telegram.org/bots/api#sendmessage). Status is current at fetch time; historical area follows the vendor's calendar-day aggregation.

Open `/RobotStatus` from the Robot menu. The authenticated `GET /api/robot-telemetry?date=YYYY-MM-DD` endpoint combines the current fleet with daily statistics by VIN.

Set `IDRIVERPLUS_USERNAME` and `IDRIVERPLUS_PASSWORD` in `server/.env`, then restart the Node server. Credentials and access tokens stay on the server; no MongoDB migration is needed. Outbound HTTPS to `wolfsburg.phpserver.idriverplus.com` is required.

The integration follows the requests used by [iDriverPlus statistics](https://agent.wxb.idriverplus.com/#/datastatistics), inspected on 2026-09-12:

- Login: POST `userCenter/web/index.php/login/login` (form username, password, language).
- Current fleet: GET `basic/web/index.php/cars/car-lists`, category_name=xdc, is_login=0, paginated by page/size.
- Daily report: POST `basic/web/index.php/wv/statistics/cars-list`, start_time=end_time=selected date, paginated by page/size.
- `is_login` 1 means online; 2 means offline (both string and numeric values occur).
- Daily `total_time` is minutes, and cleaning areas are square metres. Missing metrics remain null, distinct from a reported zero.

The selected date is passed unchanged using the vendor's calendar-day contract; the vendor's aggregation timezone is not documented. The default date uses Asia/Bangkok. Online/offline always describes current connectivity, even when viewing past daily work. This feature does not store historical connectivity or compute uptime.

Responses are cached in memory for 60 seconds with at most seven dates retained. The page polls once per minute. Partial pagination and upstream failures produce an error, never an inferred offline status or zero work. An expired vendor token (4001) is renewed once. These are vendor web endpoints, so changes to their contract may require updating the adapter.

Validation: Node tests cover VIN joins, null metrics, pagination, token renewal, caching and invalid dates. React tests cover filtering, dates and connection errors. A live check on 2026-09-12 retrieved all 41 robots and complete daily statistics for 2026-09-11.

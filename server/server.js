require('./Config/env');
const { createApp } = require('./app');
const connectDB = require('./Config/Db');

async function startServer() {
  const app = createApp();
  await connectDB();
  require('./Services/robotReportScheduler').startRobotReports();
  if (process.env.TELEGRAM_BILL_TOKEN && process.env.TELEGRAM_BILL_CHAT_ID) require('./cronTasks');
  if (process.env.TELEGRAM_ONSITE_TOKEN && process.env.TELEGRAM_ONSITE_CHAT_ID) require('./onsitetelegram');
  const port = Number(process.env.PORT || 5000);
  app.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Server listening on port ${port}`));
}
startServer().catch(error => {
  console.error('Cannot start server:', error.message);
  process.exitCode = 1;
});

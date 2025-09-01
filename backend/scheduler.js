const { Queue, QueueScheduler } = require('bullmq');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

// A QueueScheduler is needed for repeatable jobs
const queueScheduler = new QueueScheduler('link-scan-queue', { connection });
const linkScanQueue = new Queue('link-scan-queue', { connection });

async function setupScheduler() {
  // Remove any old repeatable jobs
  const repeatableJobs = await linkScanQueue.getRepeatableJobs();
  for (const job of repeatableJobs) {
    await linkScanQueue.removeRepeatableByKey(job.key);
  }
  console.log('Removed old repeatable jobs.');

  // Add a new repeatable job
  await linkScanQueue.add(
    'scan-all-links-job', // Job name
    {}, // Job data (none needed for this job)
    {
      repeat: {
        cron: '0 0 * * *', // Every day at midnight
      },
      jobId: 'daily-link-scan', // A unique ID for this repeatable job
    }
  );

  console.log('Daily link scan job has been scheduled.');
}

module.exports = { setupScheduler };

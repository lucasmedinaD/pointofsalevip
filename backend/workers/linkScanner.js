const { Worker } = require('bullmq');
const { scanUrl } = require('../services/scraper');

// This would come from your database
const getLinksToScan = async () => {
  // In a real app, you would fetch links from your database
  // For this boilerplate, we'll use a hardcoded example
  return [
    { id: 1, url: 'https://example.com' },
    { id: 2, url: 'https://example.com/404-not-found' },
  ];
};

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

const worker = new Worker('link-scan-queue', async job => {
  console.log('Worker processing job:', job.id);
  const links = await getLinksToScan();

  for (const link of links) {
    console.log(`Scanning ${link.url}`);
    const result = await scanUrl(link.url);
    console.log(`Result for ${link.url}:`, result);

    // Here you would save the result to the database (ScanResults table)
    // And if there's an issue (404, out of stock), trigger a notification.
    if (result.status !== 200 || result.isOutOfStock) {
      console.log(`Issue found for ${link.url}. Triggering notification.`);
      // Example: await sendEmailNotification(link, result);
      // Example: await sendSlackNotification(link, result);
    }
  }
}, { connection });

console.log('Link scanner worker started.');

worker.on('completed', job => {
  console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.log(`${job.id} has failed with ${err.message}`);
});

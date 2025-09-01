const { Worker } = require('bullmq');
const supabase = require('../lib/supabaseClient');
const { scanUrl } = require('../services/scraper');
const { sendBrokenLinkEmail } = require('../../integrations/email');
// const { sendBrokenLinkSlackNotification } = require('../../integrations/slack');

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

// This worker processes jobs from the 'link-scan-queue'
const worker = new Worker('link-scan-queue', async (job) => {
  console.log(`Processing job #${job.id} for scanning all links.`);

  // 1. Fetch all links from the database
  const { data: links, error: linksError } = await supabase
    .from('links')
    .select(`
      id,
      url,
      profiles ( id, email, full_name )
    `);

  if (linksError) {
    console.error('Error fetching links:', linksError.message);
    throw new Error('Failed to fetch links from database.');
  }

  if (!links || links.length === 0) {
    console.log('No links to scan.');
    return;
  }

  console.log(`Found ${links.length} links to scan.`);

  // 2. Iterate and scan each link
  for (const link of links) {
    console.log(`Scanning link ID ${link.id}: ${link.url}`);
    const result = await scanUrl(link.url);
    console.log(`Result for ${link.url}:`, result);

    // 3. Save the scan result to the database
    const { error: insertError } = await supabase
      .from('scan_results')
      .insert({
        link_id: link.id,
        status_code: result.status,
        status_text: result.statusText,
        is_out_of_stock: result.isOutOfStock,
      });

    if (insertError) {
      console.error(`Failed to save scan result for link ${link.id}:`, insertError.message);
      // Continue to the next link even if saving fails for one
    }

    // 4. If there's an issue, trigger a notification
    if (result.status !== 200 || result.isOutOfStock) {
      console.log(`Issue found for link ${link.id}. Triggering notification.`);
      const userProfile = link.profiles;
      if (userProfile) {
        // We can extend this to check user preferences for email vs. Slack
        await sendBrokenLinkEmail(userProfile, link, result);
        // await sendBrokenLinkSlackNotification(userProfile, link, result);
      }
    }
  }
  console.log(`Finished scanning all links for job #${job.id}.`);
}, { connection });


// --- Worker Event Listeners ---
worker.on('completed', (job) => {
  console.log(`Job #${job.id} has completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job #${job.id} has failed with error: ${err.message}`);
});

console.log('Link scanner worker process started.');

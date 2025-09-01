const cheerio = require('cheerio');
const axios = require('axios');

/**
 * Scans a single URL to check its status and for "out of stock" keywords.
 * @param {string} url The URL to scan.
 * @returns {Promise<object>} An object with the scan results.
 */
async function scanUrl(url) {
  try {
    const { data, status } = await axios.get(url, {
      headers: {
        'User-Agent': 'LinkMonitor.io-Bot/1.0',
      },
    });

    if (status >= 400) {
      return { status, statusText: 'Client or Server Error' };
    }

    const $ = cheerio.load(data);
    const bodyText = $('body').text().toLowerCase();

    // Basic check for "out of stock" keywords. This should be made more robust.
    const outOfStockKeywords = ['out of stock', 'agotado', 'unavailable'];
    const isOutOfStock = outOfStockKeywords.some(keyword => bodyText.includes(keyword));

    return {
      status,
      isOutOfStock,
      scannedAt: new Date(),
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        scannedAt: new Date(),
      };
    }
    return {
      status: 500,
      statusText: 'Internal Server Error during scan',
      error: error.message,
      scannedAt: new Date(),
    };
  }
}

module.exports = { scanUrl };

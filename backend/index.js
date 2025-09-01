require('dotenv').config();
const express = require('express');
const linksRouter = require('./routes/links');
const billingRouter = require('./routes/billing');

const app = express();
const port = process.env.PORT || 3001;

// The Stripe webhook needs the raw body, so we instantiate
// the JSON body parser here but before the webhook route.
app.use(express.json());

app.get('/', (req, res) => {
  res.send('LinkMonitor.io Backend is running!');
});

// Route setup
app.use('/links', linksRouter);
app.use('/billing', billingRouter);

const { setupScheduler } = require('./scheduler');
require('./workers/linkScanner'); // This starts the worker process

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  setupScheduler();
});

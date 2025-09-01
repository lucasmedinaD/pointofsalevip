require('dotenv').config();
const express = require('express');
const linksRouter = require('./routes/links');

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('LinkMonitor.io Backend is running!');
});

app.use('/links', linksRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

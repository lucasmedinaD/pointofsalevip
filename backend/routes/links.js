const express = require('express');
const router = express.Router();

// Placeholder for database logic
const db = {
  links: [],
  scans: {},
};

/**
 * @api {post} /links Add a new link
 * @apiName AddLink
 * @apiGroup Links
 *
 * @apiParam {String} url The URL of the affiliate link.
 *
 * @apiSuccess {Object} link The created link object.
 */
router.post('/', (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  const newLink = {
    id: db.links.length + 1,
    url,
    createdAt: new Date(),
  };
  db.links.push(newLink);
  res.status(201).json(newLink);
});

/**
 * @api {get} /links List all links
 * @apiName GetLinks
 * @apiGroup Links
 *
 * @apiSuccess {Object[]} links List of links.
 */
router.get('/', (req, res) => {
  res.json(db.links);
});

/**
 * @api {get} /scan/:id Get scan results for a link
 * @apiName GetScanResults
 * @apiGroup Scans
 *
 * @apiParam {Number} id Link's unique ID.
 *
 * @apiSuccess {Object} scanResults The scan results for the link.
 */
router.get('/scan/:id', (req, res) => {
  const { id } = req.params;
  const results = db.scans[id] || [];
  res.json(results);
});

module.exports = router;

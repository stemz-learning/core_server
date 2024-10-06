/**
 *  This file serves as the central router for STEMz core server api.
 */
const express = require('express');
const router = express.Router();

// import controllers and handlers here

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

module.exports = router;
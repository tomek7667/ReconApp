const express = require('express');
const fs = require('fs');
const rot13Cipher = require('rot13-cipher');
let challengeHandler = require('../handlers/ChallengeHandler');
let router = express.Router();
let defaultResult = {msg: false, success: true};

router.get('/', function(req, res, next) {
  res.render('02', {result: defaultResult});
});


module.exports = router;

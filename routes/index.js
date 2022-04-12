let express = require('express');
const fs = require("fs");
let router = express.Router();
let defaultResult = {msg: false, success: true};
/* GET home page. */
router.get('/', function(req, res, next) {
  let progressData = JSON.parse(fs.readFileSync('./data/progressData').toString());
  res.render('index', {result: defaultResult, data: progressData});
});

module.exports = router;

let express = require('express');
let router = express.Router();
let defaultResult = {msg: false, success: true};

router.get('/', function(req, res, next) {
  res.render('01', {result: defaultResult});
});

module.exports = router;

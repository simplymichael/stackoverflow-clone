const router = require('express').Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.status(200).json({});
});

module.exports = router;

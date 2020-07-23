const router = require('express').Router();
const { statusCodes } = require('../../../utils/http');
const loggedIn = require('../../../middlewares/logged-in');

router.delete('/', loggedIn, function(req, res) {
  req.session.destroy();

  return res.status(statusCodes.ok).json({});
});

module.exports = router;

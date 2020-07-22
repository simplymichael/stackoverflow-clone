/**
 * Use to only allow actions when user is not logged in.
 * For example, registration and login routes will use this middleware
 */
function notLoggedIn(req, res, next) {
  if (req.session.user) {
    res.send('Unauthorized', 401);
  } else {
    next();
  }
}

module.exports = notLoggedIn;

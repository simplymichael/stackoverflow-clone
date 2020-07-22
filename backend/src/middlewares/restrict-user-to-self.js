/**
 * Lets a user only perform actions on their own profiles,
 * not other users'
 */
function restrictUserToSelf(req, res, next) {
  if (! req.session.user || req.session.user.username !== req.user.username) {
    res.send('Unauthorized', 401);
  } else {
    next();
  }
}

module.exports = restrictUserToSelf;

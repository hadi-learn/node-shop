module.exports = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page not found',
    isAuthenticated: req.isLoggedIn,
    currentUser: req.user ? req.user.email : null
  })
}
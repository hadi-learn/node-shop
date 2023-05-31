exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error',
    errorMessage: req.flash('error')[0]
  })
}

exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Page not found'
  })
}
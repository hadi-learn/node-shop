require('dotenv').config()
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const notFoundRoutes = require('./routes/404')

const User = require('./models/users')

const app = express()
const store = new MongoDBStore({
  uri: process.env.ATLAS_DB_CONN,
  collection: 'sessions',
})
const csrfProtection = csrf()

console.log(process.env.NODE_ENV !== 'production' ? 'development' : 'production')

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store
}))
app.use(csrfProtection)
app.use(flash())

app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }
  User.findById(req.session.user._id)
    .then(user => {
      req.user = user
      next()
    })
    .catch(err => {
      if (err) {
        console.log(err)
      }
    })
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.currentUser = req.user ? req.user.email : null
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use('/admin', adminRoutes)

app.use(authRoutes)

app.use(shopRoutes)

app.all('*', notFoundRoutes)

mongoose.connect(process.env.ATLAS_DB_CONN)
  .then(result => {
    app.listen(3000)
  })
  .catch(err => {
    console.log(err)
  })


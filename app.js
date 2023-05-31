require('dotenv').config()
const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const cookieParser = require('cookie-parser')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const notFoundRoutes = require('./routes/404')
const errorRoutes = require('./routes/error')

const User = require('./models/users')

const app = express()
const store = new MongoDBStore({
  uri: process.env.ATLAS_DB_CONN,
  collection: 'sessions',
})
const csrfProtection = csrf()

console.log(process.env.NODE_ENV !== 'production' ? 'development' : 'production')

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  filename: (req, file, callback) => {
    callback(null, uuidv4() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    callback(null, true)
  } else {
    callback(null, false)
  }
}

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.urlencoded({ extended: true }))
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'images')))
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
      if (!user) {
        return next()
      }
      req.user = user
      next()
    })
    .catch(err => {
      next(new Error(err))
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

app.use(errorRoutes)

app.all('*', notFoundRoutes)

app.use((error, req, res, next) => {
  req.flash('error', error.message)
  res.redirect('/500')
})

mongoose.connect(process.env.ATLAS_DB_CONN)
  .then(result => {
    app.listen(3000)
  })
  .catch(err => {
    console.log(err)
  })


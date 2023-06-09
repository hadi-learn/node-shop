const crypto = require('crypto')
const User = require('../models/users')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator')

const transporter = nodemailer.createTransport(`smtps://${process.env.MAIL_ACCOUNT}:${process.env.MAIL_PASSWORD}@mail.syukri-hadi.com`)

exports.getLogin = (req, res, next) => {
  const message = req.cookies.newMessage ? req.cookies.newMessage : null
  res.clearCookie('newMessage')
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: req.flash('error')[0],
    successMessage: message,
    lastInputValue: null,
    validationErrors: []
  })
}

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
      successMessage: req.flash('success')[0],
      lastInputValue: { email: email, password: password },
      validationErrors: errors.array()
    })
  }
  User.findOne({ email: email })
    .then(user => {
      bcrypt.compare(password, user.password)
        .then(compareResult => {
          if (compareResult) {
            req.session.isLoggedIn = true
            req.session.user = user
            return req.session.save(err => {
              if (err) {
                console.log(err)
              }
              res.redirect('/')
            })
          }
          return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: 'Invalid Password',
            successMessage: null,
            lastInputValue: { email: email, password: password },
            validationErrors: []
          })
        })
        .catch(err => {
          if (err) {
            return res.status(422).render('auth/login', {
              pageTitle: 'Login',
              path: '/login',
              errorMessage: err,
              successMessage: null,
              lastInputValue: { email: email, password: password },
              validationErrors: []
            })
          }
        })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    errorMessage: req.flash('error')[0],
    successMessage: req.flash('success')[0],
    lastInputValue: null,
    validationErrors: []
  })
}

exports.postSignup = (req, res, next) => {
  const { email, password } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors)
    return res.status(422).render('auth/signup', {
      pageTitle: 'Signup',
      path: '/signup',
      errorMessage: errors.array()[0].msg,
      successMessage: req.flash('success')[0],
      lastInputValue: { email: email, password: password, confirmPassword: req.body.confirmPassword },
      validationErrors: errors.array()
    })
  }
  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {
          items: []
        }
      })
      return user.save()
    })
    .then(user => {
      // req.session.isLoggedIn = true
      // req.session.user = user
      const mailOptions = {
        from: process.env.MAIL_ACCOUNT,
        to: email,
        subject: 'Registered to Node-Shop',
        text: 'Welcome to Node-Shop',
        html: `
              <h1>Welcome to Node-Shop</h1>
              <p>Please click this <a href="http://localhost:3000/login">link</a> to login with your credentials and start shopping at Node-Shop</p>
            `
      }
      res.cookie("newMessage", 'You are registered, please check your email')
      res.redirect('/confirm-signup')
      return transporter.sendMail(mailOptions)
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getConfirmSignup = (req, res, next) => {
  const message = req.cookies.newMessage ? req.cookies.newMessage : null
  res.clearCookie('newMessage')
  res.render('auth/confirm-signup', {
    pageTitle: 'Registered',
    path: '/confirm-signup',
    errorMessage: req.flash('error')[0],
    successMessage: message
  })
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err)
    }
    res.cookie("newMessage", 'Logged out')
    res.redirect('/login')
  })
}

exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    errorMessage: req.flash('error')[0]
  })
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return Promise.resolve(req.flash('error', err))
        .then(result => {
          req.session.save(err => {
            if (err) {
              console.log(err)
            }
            res.redirect('/reset')
          })
        })
        .catch(err => {
          const error = new Error(err)
          error.httpStatusCode = 500
          return next(error)
        })
    }
    const token = buffer.toString('hex')
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Email not found. Please check your email address or register')
          return res.redirect('/reset')
        }
        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save()
          .then(result => {
            const mailOptions = {
              from: process.env.MAIL_ACCOUNT,
              to: req.body.email,
              subject: 'Password reset',
              html: `
              <p>You Requested a password reset from Node-Shop.</p>
              <p>Please click this <a href="http://localhost:3000/reset/${token}">link</a> to set up a new password</p>
            `
            }
            transporter.sendMail(mailOptions)
            res.cookie("newMessage", 'Email verification sent')
            res.redirect('/new-password')
          })
      })
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
  })
}

exports.getNewPasswordForm = (req, res, next) => {
  const userResetToken = req.params.userResetToken
  User.findOne({ resetToken: userResetToken, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      if (!user) {
        return Promise.resolve(req.flash('error', 'Token unavailable or expired, please acquire a new token'))
          .then(result => {
            req.session.save(err => {
              if (err) {
                console.log(err)
              }
              return res.redirect('/reset')
            })
          })
          .catch(err => {
            const error = new Error(err)
            error.httpStatusCode = 500
            return next(error)
          })
      }
      res.render('auth/new-password', {
        pageTitle: 'New Password',
        path: '/new-password',
        errorMessage: req.flash('error')[0],
        userId: user._id.toString(),
        userResetToken: userResetToken
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getConfirmPassword = (req, res, next) => {
  const message = req.cookies.newMessage ? req.cookies.newMessage : null
  res.clearCookie('newMessage')
  res.render('auth/confirm-password', {
    pageTitle: 'Check Your Email',
    path: '/confirm-password',
    errorMessage: req.flash('error')[0],
    successMessage: message
  })
}

exports.postNewPassword = (req, res, next) => {
  const { userId, password, userResetToken } = req.body
  let userToUpdate
  User.findOne({
    _id: userId,
    resetToken: userResetToken,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      userToUpdate = user
      return bcrypt.hash(password, 12)
    })
    .then(hashedPassword => {
      userToUpdate.password = hashedPassword
      userToUpdate.resetToken = undefined
      userToUpdate.resetTokenExpiration = undefined
      return userToUpdate.save()
    })
    .then(result => {
      const mailOptions = {
        from: process.env.MAIL_ACCOUNT,
        to: userToUpdate.email,
        subject: 'Your Password Updated',
        html: `
          <p>Your new password successfully updated</p>
          <p>Please click this <a href="http://localhost:3000/login">link</a> to login with your new password and start shopping with big discount at Node-Shop</p>
        `
      }
      transporter.sendMail(mailOptions)
      res.cookie("newMessage", 'Please login with your new password')
      res.redirect('/login')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}
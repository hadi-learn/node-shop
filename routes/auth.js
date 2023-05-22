const express = require('express')
const authController = require('../controllers/auth')
const { check, body } = require('express-validator')
const User = require('../models/users')

const router = express.Router()

router.route('/login')
  .get(authController.getLogin)
  .post(
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email address')
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(user => {
            if (!user) {
              return Promise.reject('No user found, please check your email address')
            }
          })
      }),
    body('password', 'Password at least 4 characters long and only contain letters and numbers')
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
    authController.postLogin
  )

router.route('/signup')
  .get(authController.getSignup)
  .post(
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .normalizeEmail()
      .custom((value, { req }) => {
        // if (value === 'cek@mail.com') {
        //   throw new Error('This email address is blocked')
        // }
        // return true
        return User.findOne({ email: value })
          .then(user => {
            if (user) {
              return Promise.reject('User already exists')
            }
          })
      }),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 4 characters'
    )
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password have to match!')
        }
        return true
      }),
    authController.postSignup
  )

router.route('/confirm-signup')
  .get(authController.getConfirmSignup)

router.route('/reset')
  .get(authController.getReset)
  .post(authController.postReset)

router.route('/reset/:userResetToken')
  .get(authController.getNewPasswordForm)

router.route('/new-password')
  .get(authController.getConfirmPassword)
  .post(authController.postNewPassword)

router.route('/logout')
  .get((req, res, next) => {
    res.send('<h1>Get Route for /logout</h1>')
  })
  .post(authController.postLogout)

module.exports = router
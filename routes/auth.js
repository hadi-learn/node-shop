const express = require('express')
const authController = require('../controllers/auth')
const { check, body } = require('express-validator')

const router = express.Router()

router.route('/login')
  .get(authController.getLogin)
  .post(authController.postLogin)

router.route('/signup')
  .get(authController.getSignup)
  .post(check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, { req }) => {
      if (value === 'cek@mail.com') {
        throw new Error('This email address is blocked')
      }
      return true
    }),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 4 characters'
    )
      .isLength({ min: 4 })
      .isAlphanumeric(),
    authController.postSignup)

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
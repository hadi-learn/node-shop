const express = require('express')
const adminController = require('../controllers/admin')
const isAuth = require('../middleware/is-auth')
const { check, body } = require('express-validator')
const router = express.Router()

router.route('/')
  .get((req, res, next) => {
    res.send('<h1>This is Admin Route Index!</h1>')
  })

router.route('/add-product')
  .get(isAuth, adminController.getAddProduct)
  .post(
    body('title',
      'At least 3 characters, only alphabet a-zA-Z, numbers 0-9, space and hyphen are allowed'
    )
      .isAlphanumeric('en-US', { ignore: ' -' })
      .isLength({ min: 3 })
      .trim(),
    body('price')
      .isFloat()
      .withMessage('Invalid price format, only numbers are allowed'),
    body('description')
      .isAlphanumeric('en-US', { ignore: ' -!?:.\n' })
      .withMessage('Only alphabet a-zA-Z, numbers 0-9, space, and special character: -!?')
      .custom((value) => {
        if (value.length < 15) {
          throw new Error('Description is at least 15 characters and at most 300 characters')
        }
        if (value.length > 300) {
          throw new Error('Description is at least 15 characters and at most 300 characters')
        }
        return true
      }),
    isAuth, adminController.postAddProduct
  )

router.route('/products')
  .get(isAuth, adminController.getAdminProducts)

router.route('/edit-product/:productId')
  .get(isAuth, adminController.getEditProduct)
  .post(
    body(
      'title',
      'At least 3 characters, only alphabet a-zA-Z, numbers 0-9, space and hyphen are allowed'
    )
      .isAlphanumeric('en-US', { ignore: ' -' })
      .isLength({ min: 3 })
      .trim(),
    body('price')
      .isFloat()
      .withMessage('Invalid price format, only numbers are allowed'),
    body('description')
      .isAlphanumeric('en-US', { ignore: ' -!?:.\n' })
      .withMessage('Only alphabet a-zA-Z, numbers 0-9, space, and special character: -!?')
      .custom((value) => {
        if (value.length < 15) {
          throw new Error('Description is at least 15 characters and at most 300 characters')
        }
        if (value.length > 300) {
          throw new Error('Description is at least 15 characters and at most 300 characters')
        }
        return true
      }),
    isAuth, adminController.postEditProduct
  )

router.route('/delete-product')
  .get((req, res, next) => {
    res.send('<h1>This is Delete Product Index!</h1>')
  })
  .post(isAuth, adminController.postDeleteProduct)

module.exports = router
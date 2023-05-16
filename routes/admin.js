const express = require('express')
const adminController = require('../controllers/admin')
const router = express.Router()
const isAuth = require('../middleware/is-auth')

router.route('/')
  .get((req, res, next) => {
    res.send('<h1>This is Admin Route Index!</h1>')
  })

router.route('/add-product')
  .get(isAuth, adminController.getAddProduct)
  .post(isAuth, adminController.postAddProduct)

router.route('/products')
  .get(isAuth, adminController.getAdminProducts)

router.route('/edit-product/:productId')
  .get(isAuth, adminController.getEditProduct)
  .post(isAuth, adminController.postEditProduct)

router.route('/delete-product')
  .get((req, res, next) => {
    res.send('<h1>This is Delete Product Index!</h1>')
  })
  .post(isAuth, adminController.postDeleteProduct)

module.exports = router
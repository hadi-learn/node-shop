const express = require('express')
const shopController = require('../controllers/shop')
const router = express.Router()
const isAuth = require('../middleware/is-auth')

router.route('/')
  .get(shopController.getIndex)

router.route('/products')
  .get(shopController.getProducts)

router.route('/products/:productId')
  .get(shopController.getProductDetails)

router.route('/cart')
  .get(isAuth, shopController.getCart)
  .post(isAuth, shopController.postCart)

router.route('/cart-delete-item')
  .post(isAuth, shopController.postDeleteCartItem)

router.route('/orders')
  .get(isAuth, shopController.getOrders)
  .post(isAuth, shopController.postOrders)

module.exports = router
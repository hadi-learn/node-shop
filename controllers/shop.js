const Product = require('../models/products')
const Order = require('../models/orders')

exports.getIndex = (req, res, next) => {
  Product.find({})
    .then(products => {
      res.render('shop/index', {
        products: products,
        pageTitle: 'My Shop',
        path: 'home'
      })
    })
    .catch(err => console.log(err))
}

exports.getProducts = (req, res, next) => {
  Product.find({})
    .populate('userId')
    .then(products => {
      res.render('shop/product-list', {
        products: products,
        pageTitle: 'All Products',
        path: '/products'
      })
    })
    .catch(err => console.log(err))
}

exports.getProductDetails = (req, res, next) => {
  const productId = req.params.productId
  Product.findById(productId)
    .then(foundProduct => {
      res.render('shop/product-detail', {
        product: foundProduct,
        pageTitle: `Detail for ${foundProduct.title}`,
        path: '/products'
      })
    })
    .catch(err => console.log(err))
}

exports.postCart = (req, res, next) => {
  const productId = req.body.productId
  Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => {
      console.log(err)
    })
}

exports.getCart = (req, res, next) => {
  if (req.user) {
    req.user
      .populate('cart.items.productId')
      .then(user => {
        const cartProducts = user.cart.items
        res.render('shop/cart', {
          products: cartProducts,
          pageTitle: 'Your Cart',
          path: '/cart'
        })
      })
      .catch(err => console.log(err))
  } else {
    res.render('shop/cart', {
      products: [],
      pageTitle: 'Your Cart',
      path: '/cart'
    })
  }
}

exports.postDeleteCartItem = (req, res, next) => {
  const productId = req.body.productId
  req.user.deleteCartItem(productId)
    .then(result => {
      res.redirect('/cart')
    })
    .catch(err => console.log(err))
}

exports.postOrders = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const cartProducts = user.cart.items.map(item => {
        return {
          quantity: item.quantity,
          productData: { ...item.productId._doc }
        }
      })
      const order = new Order({
        products: cartProducts,
        user: {
          email: req.user.email,
          userId: req.user
        }
      })
      return order.save()
    })
    .then(result => {
      return req.user.clearCart()
    })
    .then(result => {
      res.redirect('/orders')
    })
    .catch(err => console.log(err))
}

exports.getOrders = (req, res, next) => {
  if (req.session.user) {
    Order.find({ 'user.userId': req.session.user._id })
      .then(orders => {
        res.render('shop/orders', {
          pageTitle: 'Your Orders',
          path: '/orders',
          orders: orders
        })
      })
      .catch(err => console.log(err))
  } else {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders: []
    })
  }
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  })
}
const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
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
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
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
      .catch(err => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      })
  } else {
    res.render('shop/orders', {
      pageTitle: 'Your Orders',
      path: '/orders',
      orders: []
    })
  }
}

exports.getInvoice = (req, res, next) => {
  const { orderId } = req.params
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('Invalid Order'))
      }
      if (!order.user.userId.equals(req.user._id)) {
        return next(new Error('Unauthorized'))
      }
      const invoiceName = 'invoice-' + orderId + '.pdf'
      const invoicePath = path.join('data', 'invoices', invoiceName)

      //////// USING SIMPLE PRELOAD METHODS BUT BAD FOR MEMORY
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err)
      //   }
      //   res.setHeader('Content-Type', 'application/pdf')
      //   res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      //   res.send(data)
      // })

      //////// USING STREAM METHOD
      // const file = fs.createReadStream(invoicePath)
      // res.setHeader('Content-Type', 'application/pdf')
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
      // file.pipe(res)

      //////// USING THIRD PARTY FOR CREATING PDF ON THE FLY
      const pdfDoc = new PDFDocument()
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      pdfDoc.pipe(res)
      pdfDoc.fontSize(26).text('Invoice', {
        underline: false
      })
      pdfDoc.text('                                ', {
        underline: true
      })
      pdfDoc.text('                                ')
      let totalPrice = 0
      order.products.forEach(product => {
        totalPrice += product.quantity * product.productData.price
        pdfDoc.fontSize(14).text(`${product.productData.title} - ${product.quantity}x${product.productData.price}`)
      })
      pdfDoc.text('                                ', {
        underline: true
      })
      pdfDoc.text('                                ')
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice.toFixed(2)}`)
      pdfDoc.end()
    })
    .catch(err => {
      return next(err)
    })

}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  })
}
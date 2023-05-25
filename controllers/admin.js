const Product = require('../models/products')
const { validationResult } = require('express-validator')
const mongoose = require('mongoose')

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    product: null,
    validationErrors: [],
    errorMessage: null
  })
}

exports.postAddProduct = (req, res, next) => {
  const userId = req.user
  const { title, price, imageUrl, description } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: { title, price, imageUrl, description },
      validationErrors: errors.array(),
      errorMessage: null
    })
  }
  const product = new Product({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
    userId: userId // or use userId: req.user, mongoose will do the rest
  })
  product.save()
    .then(result => {
      console.log('Product created successfully')
      res.redirect('/admin/products')
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    .populate('userId')
    .then(products => {
      res.render('admin/admin-product-list', {
        products: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        errorMessage: req.flash('error')[0]
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = JSON.parse(req.query.edit)
  if (!editMode) {
    return res.redirect('/')
  }
  const productId = req.params.productId
  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.send('<h1>Product Not Found!</h1><form method="GET" action="/admin/products"><button type="submit">Back</button></form>')
      }
      if (!product.userId.equals(req.user._id)) {
        return Promise.resolve(req.flash('error', 'Sorry, you are not authorized to edit the requested product'))
          .then(result => {
            req.session.save(err => {
              if (err) {
                console.log(err)
              }
              return res.redirect('/admin/products')
            })
          })
          .catch(err => {
            if (err) {
              console.log(err)
            }
          })
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        lastInputValue: null,
        validationErrors: [],
        errorMessage: null
      })
    })
    .catch(err => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    })
}

exports.postEditProduct = (req, res, next) => {
  const userId = req.user
  const productId = req.body.productId
  const { title, price, imageUrl, description } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      product: { _id: productId, title, price, imageUrl, description },
      validationErrors: errors.array(),
      errorMessage: null
    })
  }
  Product.findById(productId)
    .then(product => {
      if (!product.userId.equals(req.user._id)) {
        return res.redirect('/admin/products')
      }
      product.title = title
      product.price = price
      product.imageUrl = imageUrl
      product.description = description
      product.userId = userId
      return product.save()
        .then(result => {
          console.log('Product updated successfully')
          res.redirect('/admin/products')
        })
    })
    .catch(err => {
      console.error(err)
      res.redirect('/admin/products')
    })
}

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId
  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => {
      res.redirect('/admin/products')
    })
    .catch(err => {
      if (err) {
        console.error(err)
      }
    })
}
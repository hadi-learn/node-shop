const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  email: {
    type: 'string',
    required: true
  },
  password: {
    type: 'string',
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
})

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(item => {
    return item.productId.toString() === product._id.toString()
  })
  let newQuantity = 1
  const updatedCartItems = [...this.cart.items]

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1
    updatedCartItems[cartProductIndex].quantity = newQuantity
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity
    })
  }

  const updatedCart = { items: updatedCartItems }
  this.cart = updatedCart
  return this.save()
}

userSchema.methods.deleteCartItem = function (productId) {
  const updatedCartItems = this.cart.items.filter(item => {
    return !item.productId.equals(productId)
  })
  this.cart.items = updatedCartItems
  return this.save()
}

userSchema.methods.clearCart = function () {
  this.cart = { items: [] }
  return this.save()
}

module.exports = mongoose.model('User', userSchema)


// const { ObjectId } = require('mongodb')

// class User {
//   constructor(username, email, cart, id) {
//     this.username = username
//     this.email = email
//     this.cart = cart ? cart : cart = { items: [] }
//     this._id = id
//   }

//   save() {
//     const db = getDb()
//     return db.collection('users')
//       .insertOne(this)
//       .then(result => {
//         console.log(result)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   addToCart(product) {
//     const cartProductIndex = this.cart.items.findIndex(item => {
//       return item.productId.equals(product._id)
//       // return item.productId.toString() === product._id.toString() // alternative approach
//     })
//     let newQuantity = 1
//     const updatedCartItems = [...this.cart.items]

//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1
//       updatedCartItems[cartProductIndex].quantity = newQuantity
//     } else {
//       updatedCartItems.push({
//         productId: new ObjectId(product._id),
//         quantity: newQuantity
//       })
//     }

//     const updatedCart = { items: updatedCartItems }

//     const db = getDb()
//     return db.collection('users')
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: updatedCart } }
//       )
//       .then(result => {
//         console.log(result)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   getCart() {
//     const db = getDb()
//     const productIds = this.cart.items.map(item => {
//       return item.productId
//     })
//     return db.collection('products')
//       .find({ _id: { $in: productIds } })
//       .toArray()
//       .then(products => {
//         return products.map(product => {
//           return {
//             ...product,
//             quantity: this.cart.items.find(item => {
//               return item.productId.equals(product._id)
//             }).quantity
//           }
//         })
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   deleteCartItem(productId) {
//     const cartItems = [...this.cart.items]
//     const updatedCartItems = cartItems.filter(item => {
//       return !item.productId.equals(productId)
//     })
//     const db = getDb()
//     return db.collection('users')
//       .updateOne(
//         { _id: new ObjectId(this._id) },
//         { $set: { cart: { items: updatedCartItems } } }
//       )
//       .then(result => {
//         console.log(result)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   addOrder() {
//     const db = getDb()
//     return this.getCart()
//       .then(products => {
//         const order = {
//           items: products,
//           user: {
//             _id: new ObjectId(this._id),
//             username: this.username
//           }
//         }
//         return db.collection('orders')
//           .insertOne(order)
//       })
//       .then(result => {
//         console.log(result)
//         this.cart = { items: [] }
//         return db.collection('users')
//           .updateOne(
//             { _id: new ObjectId(this._id) },
//             { $set: { cart: { items: [] } } }
//           )
//           .then(result => {
//             console.log(result)
//           })
//           .catch(err => {
//             console.log(err)
//           })
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   getOrders() {
//     const db = getDb()
//     return db.collection('orders')
//       .find({ 'user._id': new ObjectId(this._id) })
//       .toArray()
//   }

//   static findById(userId) {
//     const db = getDb()
//     return db.collection('users')
//       .findOne({ _id: new ObjectId(userId) })
//       .then(user => {
//         return user
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
// }

// module.exports = User
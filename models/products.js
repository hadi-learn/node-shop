const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

module.exports = mongoose.model('Product', productSchema)


// const { ObjectId } = require('mongodb')

// class Product {
//   constructor(title, price, imageUrl, description, id, userId) {
//     this.title = title
//     this.price = price
//     this.imageUrl = imageUrl
//     this.description = description
//     this._id = id && new ObjectId(id)
//     this.userId = userId
//   }

//   save() {
//     const db = getDb()
//     let dbOperation
//     if (this._id) {
//       // updateOne
//       dbOperation = db.collection('products').updateOne({ _id: this._id }, { $set: this })
//     } else {
//       // insertOne
//       dbOperation = db.collection('products').insertOne(this)
//     }
//     return dbOperation
//       .then(result => {
//         console.log(result)
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   static fetchAll() {
//     const db = getDb()
//     return db.collection('products')
//       .find()
//       .toArray()
//       .then(products => {
//         return products
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   static findById(productId) {
//     const db = getDb()
//     return db.collection('products')
//       .find({ _id: new ObjectId(productId) })
//       .next()
//       .then(product => {
//         return product
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }

//   static deleteById(productId) {
//     const db = getDb()
//     return db.collection('products')
//       .deleteOne({ _id: new ObjectId(productId) })
//       .then(result => {
//         console.log('Product successfully deleted')
//         return db.collection('users')
//           .updateMany(
//             {},
//             { $pull: { 'cart.items': { productId: new ObjectId(productId) } } }
//           )
//           .then(result => {
//             console.log('Cart item deleted')
//           })
//       })
//       .catch(err => {
//         console.log(err)
//       })
//   }
// }

// module.exports = Product
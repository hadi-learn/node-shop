const express = require('express')
const notFoundController = require('../controllers/notFound')

const router = express.Router()

router.route('/500')
  .get(notFoundController.get500)

module.exports = router
const express = require('express');
const router =express.Router();
const product= require('../data/products');


router.get('/',(req, res) => {
    res.json(product);
})

module.exports= router;
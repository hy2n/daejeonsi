const express = require('express');
var bodyParser = require('body-parser')
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

router.use(express.urlencoded({ extended: false }));
router.use(bodyParser.json());


module.exports = router;

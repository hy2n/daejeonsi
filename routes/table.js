const express = require('express');
var bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

router.use(express.urlencoded({ extended: false }));
router.use(bodyParser.json());
//Teacher정보 저장 파일
function verifyToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.send('<meta http-equiv="refresh" content="0; url=/"></meta><script>alert("인증에 실패했습니다. 다시 로그인 해 주세요");</script>');
    }
    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) {
            return res.send('<meta http-equiv="refresh" content="0; url=/"></meta><script>alert("인증에 실패했습니다. 다시 로그인 해 주세요");</script>');
        }
        req.user = decoded;
        next();
    });
}

module.exports = router;

const express = require('express');
var bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

router.use(express.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/mypage/logout', (req, res) => {
    const cookies = req.cookies;

    // 각 쿠키를 만료시킵니다.
    for (const cookieName in cookies) {
        res.clearCookie(cookieName);
    }
    return res.send('<meta http-equiv="refresh" content="0; url=/"></meta><script>alert("로그아웃 했습니다.");</script>');
});
module.exports = router;

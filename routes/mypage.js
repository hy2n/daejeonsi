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

// 유저 정보 저장한 파일 불러오기(실제로는 DB연결)
const usersFilePath = path.join(__dirname, './../data/db/users.json');

router.get('/mypage/logout', (req, res) => {
    const cookies = req.cookies;
    // 각 쿠키를 만료시킵니다.
    for (const cookieName in cookies) {
        res.clearCookie(cookieName);
    }
    return res.send('<meta http-equiv="refresh" content="0; url=/"></meta><script>alert("로그아웃 했습니다.");</script>');
});

router.get('/mypage/account-delete', verifyToken, (req, res) => {
    const cookies = req.cookies;
    for (const cookieName in cookies) {
        res.clearCookie(cookieName);
    }
    deleteUser(usersFilePath, req.user.id)
    .then(newData => {
        console.log('[알림] 삭제이후 유저 데이터', newData);
        return res.send('<meta http-equiv="refresh" content="0; url=/"></meta><script>alert("'+req.user.id+'님의 계정을 안전하게 삭제하였습니다.");</script>');
    })
    .catch(error => {
        return res.send('<meta http-equiv="refresh" content="0; url=/"></meta><script>alert("문제가 발생 한 것 같습니다.");</script>');
    });
});

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

// 파일에서 데이터를 읽어와서 처리하는 함수
function deleteUser(filePath, idToDelete) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                // JSON 데이터 파싱
                const jsonData = JSON.parse(data);
                
                // 주어진 ID에 해당하는 객체 삭제
                const newData = jsonData.filter(obj => obj.id !== idToDelete);

                // 새로운 JSON 파일로 저장
                fs.writeFile(filePath, JSON.stringify(newData, null, 4), err => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(newData);
                });
            } catch (error) {
                reject(error);
            }
        });
    });
}


module.exports = router;

const express = require('express');
var bodyParser = require('body-parser')
const router = express.Router();
const path = require('path'); // path 모듈 import
const fs = require('fs'); // fs 모듈 import
const jwt = require('jsonwebtoken'); // jwt 모듈 import
const crypto = require('crypto'); //해시값을 받기위해서 모듈 import
const requestIp = require("request-ip");
const security = require('./security');

router.use(express.urlencoded({ extended: false }));
router.use(bodyParser.json());

// 유저 정보 저장한 파일 불러오기(실제로는 DB연결)
const usersFilePath = path.join(__dirname, './../data/db/users.json');

// 로그인 엔드포인트
router.post('/', (req, res) => {
  // 사용 예시
  security.CheckVoid(req.headers['x-forwarded-for'] || requestIp.getClientIp(req));
  // 회원 정보를 받아오기
  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch (err) {
    console.error('사용자 정보를 읽어오는 데 문제가 발생했습니다.', err);
  }

  const { id, password, } = req.body;
  const user = users.find(user => user.id === id && user.password === hashPassword(password));
  if (!user) {
    return res.send('<script>alert("아이디나 비빌번호가 일치하지 않습니다. 잔여 시도 횟수 : ' + 1 + '회");window.history.back();</script>');
  }

  const studentid = user.studentid;
  const name = user.name;

  // JWT 토큰 생성
  const token = jwt.sign({ id, studentid,name }, 'secret_key', { expiresIn: '1y' });

  // 쿠키에 토큰 저장
  res.cookie('token', token, { httpOnly: true });
  res.send('<meta http-equiv="refresh" content="0; url=/home"></meta><script>alert("로그인 완료!");</script>');
});

function hashPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

module.exports = router;
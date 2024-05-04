const express = require('express');
var bodyParser = require('body-parser')
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

router.use(express.urlencoded( {extended : false } ));
router.use(bodyParser.json());

// 유저 정보 저장한 파일 불러오기(실제로는 DB연결)
const usersFilePath = path.join(__dirname,  './../data/db/users.json');

// 회원 정보를 받아오기
let users = [];
try {
  users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
} catch (err) {
  console.error('사용자 정보를 읽어오는 데 문제가 발생했습니다.', err);
}

router.post('/', (req, res) => {
    var { id, password, studentid } = req.body;
  
    if (!id || !password || !studentid) {
      return res.status(400).json({ error: 'ID와 비밀번호를 모두 입력해주세요.'});
    }
    if (users.some(user => user.id === id)) {
      return res.status(400).json({ error: '이미 존재하는 ID입니다.' });
    }
    if (users.some(user => user.studentid === studentid)) {
      return res.status(400).json({ error: '이미 존재하는 학생 ID입니다.' });
    }
    password = hashPassword(password);
    // 사용자 정보를 저장
    const newUser = { id, password ,studentid};
    users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 3));
  
    res.status(200).json({ message: '회원 가입이 완료되었습니다.' });
});

function hashPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

module.exports = router;

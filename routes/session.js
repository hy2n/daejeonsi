const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

console.log("Session 모듈이 실행되었습니다.");
// 회원 가입 엔드포인트
app.post('/api_join', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'ID와 비밀번호를 모두 입력해주세요.' });
  }

  if (users.some(user => user.id === id)) {
    return res.status(400).json({ error: '이미 존재하는 ID입니다.' });
  }

  // 사용자 정보를 저장
  const newUser = { id, password };
  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

  res.status(200).json({ message: '회원 가입이 완료되었습니다.' });
});

// 로그인 엔드포인트
app.post('/api_login', (req, res) => {
  const { id, password } = req.body;

  const user = users.find(user => user.id === id && user.password === password);
  if (!user) {
    return res.status(401).json({ error: 'ID 또는 비밀번호가 잘못되었습니다.' });
  }

  // JWT 토큰 생성
  const token = jwt.sign({ id }, 'secret_key', { expiresIn: '1y' });

  // 쿠키에 토큰 저장
  res.cookie('token', token, { httpOnly: true });

  res.status(200).json({ message: '로그인이 성공적으로 완료되었습니다.' });
});
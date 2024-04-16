const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const bodyParser= require('body-parser');
const app = express();
const port = 3000;
//mysqlpassword
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

// 사용자 정보를 저장할 JSON 파일 경로
const usersFilePath = path.join(__dirname, 'users.json');

// 회원 정보를 읽어옵니다.
let users = [];
try {
  users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
} catch (err) {
  console.error('사용자 정보를 읽어오는 데 문제가 발생했습니다.', err);
}

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

// 회원 가입 페이지
app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

// 로그인 페이지
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 마이페이지 엔드포인트 (인증 필요)
app.get('/home', verifyToken, (req, res) => {
  // verifyToken 미들웨어를 통과하면, 유저의 정보를 확인할 수 있습니다.
  const user = users.find(user => user.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// JWT 토큰을 검증하는 미들웨어
function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: '토큰이 없습니다.' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: '토큰 인증에 실패했습니다.' });
    }

    req.user = decoded;
    next();
  });
}

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행되었습니다.`);
});

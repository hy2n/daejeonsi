const express = require('express');
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

//nodeJS 라우터
const router = express.Router();
const loginRouter = require('./routes/login');
const joinRouter = require('./routes/join');


app.use(express.json()); //
app.use(express.static(path.join(__dirname, 'public'))); //public 폴더 개방
app.use(cookieParser()); //JWT인증 위한 쿠키파서 사용

app.use('/api_login', loginRouter);
app.use('/api_register', joinRouter);

//정적 파일 서브
app.get('/join', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

//정적 파일 서브
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

//메인홈 파일 서브
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/home', verifyToken, (req, res) => {
  // 유저 정보 저장한 파일 불러오기(실제로는 DB연결)
  const usersFilePath = path.join(__dirname, './data/db/users.json');
  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch (err) {
    console.error('사용자 정보를 읽어오는 데 문제가 발생했습니다.', err);
  }
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

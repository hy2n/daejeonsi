const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

//nodeJS 라우터
const router = express.Router();
const loginRouter = require('./routes/login');
const joinRouter = require('./routes/join');
const sessionRouter = require('./routes/session'); //세션 미들웨어 준비
app.use(express.json()); //
app.use(express.static(path.join(__dirname, 'public'))); //public 폴더 개방

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

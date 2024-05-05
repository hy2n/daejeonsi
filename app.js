const express = require('express');
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// 렌더링 엔진 설정
app.set('view engine', 'ejs'); // 템플릿 엔진으로 EJS 사용
app.set('views', path.join(__dirname, 'render')); // 템플릿 파일의 디렉토리 설정

//nodeJS 라우터
const router = express.Router();
const loginRouter = require('./routes/login');
const joinRouter = require('./routes/join');
const mypageRouter = require('./routes/mypage');

//EXPRESS JS INIT
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); //public 폴더 개방
app.use(cookieParser()); //JWT인증 위한 쿠키파서 사용

app.use('/api_login', loginRouter); //로그인 라우터
app.use('/api_register', joinRouter); //회원가입 라우터
app.use('/mypage', mypageRouter); //마이페이지 라우터

//정적 파일 서브
app.get('/join', (req, res) => { //가입페이지 서브
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});
app.get('/login', (req, res) => { //로그인페이지 서브
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/', (req, res) => { //기본 소개 페이지 서브
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/home', verifyToken, (req, res) => {
  res.render('home',
   {
    stduentID: req.user.id,
    userRoom: AnalyzeUserRoom(req.user.studentid,1,2),
    userSector:AnalyzeUserRoom(req.user.studentid,0,1),
    username: req.user.name
   }
  );
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

function AnalyzeUserRoom(input,slice_num,end_num) {
  // 입력이 문자열이 아닌 경우 문자열로 변환
  input = String(input);
  
  // 문자열의 길이가 4 미만인 경우 예외처리
  if (input.length < 4) {
      return "입력값이 유효하지 않습니다.";
  }
  
  // 첫 번째와 두 번째 숫자를 추출하여 반환
  return input.slice(slice_num,end_num);
}

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행되었습니다.`);
});

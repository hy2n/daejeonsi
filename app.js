const express = require('express');
var bodyParser = require('body-parser')
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const fs = require('fs');
const parser = require('./parser'); //파싱엔진 로드
const path = require('path');
const app = express();
const port = 3000;
const { DateTime } = require('luxon');

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
app.use('/api', mypageRouter); //마이페이지 라우터

//정적 파일 서브
app.get('/join', (req, res) => { //가입페이지 서브
  res.sendFile(path.join(__dirname, 'public', 'join.html'));
});

app.get('/login', (req, res) => { //로그인페이지 서브
  const token = req.cookies.token;
  var nonPassedUser = true;
  if (token) {
    jwt.verify(token, 'secret_key', (err, decoded) => {
      if (!err) {
        return res.send('<meta http-equiv="refresh" content="0; url=/home"></meta><script>alert("자동로그인에 성공하였습니다. 필요시 [내 정보]에서 로그아웃 해 주세요");</script>');
      }
      else res.sendFile(path.join(__dirname, 'public', 'login.html'));
    });
  }
  else res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/', (req, res) => { //기본 소개 페이지 서브
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.get('/home', verifyToken, (req, res) => {
  const classIdForToday = returnTable("./data/tables/1-4.json");
  const infoForToday = returnInfo("./data/tables/1-4.json");
  res.render('home',
    {
      stduentID: req.user.id,
      userRoom: AnalyzeUserRoom(req.user.studentid, 1, 2),
      userSector: AnalyzeUserRoom(req.user.studentid, 0, 1),
      username: req.user.name,

      q1st: classIdForToday[0].slice(0, -2),
      q2st: classIdForToday[1].slice(0, -2),
      q3st: classIdForToday[2].slice(0, -2),
      q4st: classIdForToday[3].slice(0, -2),
      q5st: classIdForToday[4].slice(0, -2),
      q6st: classIdForToday[5].slice(0, -2),
      q7st: classIdForToday[6].slice(0, -2),
      alertView: classIdForToday[7],

      info1st: infoForToday[0]
    }
  );
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

function AnalyzeUserRoom(input, slice_num, end_num) {
  // 입력이 문자열이 아닌 경우 문자열로 변환
  input = String(input);

  // 문자열의 길이가 4 미만인 경우 예외처리
  if (input.length < 4) {
    return "입력값이 유효하지 않습니다.";
  }

  // 첫 번째와 두 번째 숫자를 추출하여 반환
  return input.slice(slice_num, end_num);
}


function returnTable(filePath) {
  // 오늘의 요일 구하기 (월=1, 화=2, ..., 금=5)
  const todayWeekday = (DateTime.local().weekday - 1);

  // 파일에서 JSON 데이터 읽기
  const scheduleJson = fs.readFileSync(filePath, 'utf8');

  // JSON 파싱
  const schedule = JSON.parse(scheduleJson);
  var isMoved = false;

  // 오늘의 요일에 해당하는 과목의 classid 찾기
  const todaySchedule = schedule[todayWeekday.toString()];
  const classIds = [];
  for (const classInfo of todaySchedule) {
    classIds.push(classInfo.classid);
    if (!classInfo.moved) {
      isMoved = true;
    }
  }
  if (isMoved) classIds[7] = true;
  else classIds[7] = false;
  // 오늘의 일정이 없으면 빈 배열 반환
  return classIds;
}


function returnInfo(filePath) {
  // 오늘의 요일 구하기 (월=1, 화=2, ..., 금=5)
  const todayWeekday = (DateTime.local().weekday - 1);

  // 파일에서 JSON 데이터 읽기
  const scheduleJson = fs.readFileSync(filePath, 'utf8');

  // JSON 파싱
  const schedule = JSON.parse(scheduleJson);
  var isMoved = false;

  // 오늘의 요일에 해당하는 과목의 classid 찾기
  const todaySchedule = schedule[todayWeekday.toString()];
  const classIds = [];
  for (const classInfo of todaySchedule) {
    if (!classInfo.moved) {
      classIds.push("없어");
    } else {
       classIds.push(classInfo.memo);
    }
  }
  if (isMoved) classIds[7] = true;
  else classIds[7] = false;
  // 오늘의 일정이 없으면 빈 배열 반환
  return classIds;
}

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행되었습니다.`);
});

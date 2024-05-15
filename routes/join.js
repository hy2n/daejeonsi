const express = require('express');
var bodyParser = require('body-parser')
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

router.use(express.urlencoded({ extended: false }));
router.use(bodyParser.json());

// 유저 정보 저장한 파일 불러오기(실제로는 DB연결)
const usersFilePath = path.join(__dirname, './../data/db/users.json');
// 학번이름 정보 저장한 파일 불러오기(실제로는 DB연결)
const nameFilePath = path.join(__dirname, './../data/db/username.json');


router.post('/', (req, res) => {
  // 회원 정보를 받아오기
  let users = [];
  try {
    users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
  } catch (err) {
    console.error('사용자 정보를 읽어오는 데 문제가 발생했습니다.', err);
  }
  var { id, password, studentid } = req.body;

  if (containsForbiddenChars(id) && containsForbiddenChars(password) && containsForbiddenChars(studentid)) {
    return res.send('<script>alert("특수문자 및 공백은 사용할 수 없습니다");window.history.back();</script>');
  }

  if (!id || !password || !studentid) {
    return res.status(401);
  }
  if (users.some(user => user.id === id)) {
    return res.send('<script>alert("이미 사용중인 사용자 ID입니다");window.history.back();</script>');
  }
  if (users.some(user => user.studentid === studentid)) {
    return res.send('<script>alert("이미 사용중인 학번입니다. 010-2821-5213으로 연락주세요.");window.history.back();</script>');
  }
  password = hashPassword(password);
  var name = findName(studentid);
  if (name == null) {
    return res.send('<script>alert("사용할 수 없는 학번입니다");window.history.back();</script>');
  }
  // 사용자 정보를 저장
  const newUser = { id, password, studentid, name };
  users.push(newUser);
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 3));

  res.send('<meta http-equiv="refresh" content="0; url=/login"></meta><script>alert("가입을 완료했어요! 로그인 해 주세요.");</script>');
});

function hashPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}



// 학번을 입력하면 해당하는 이름을 반환하는 함수
function findName(studentID, filePath) {
  const students = loadStudents();
  if (!students) {
    console.error('학생 정보를 불러올 수 없습니다.');
    return null;
  }

  var name = students[studentID];
  if (!name) {
    console.error('해당하는 학번의 학생을 찾을 수 없습니다.');
    return null;
  }

  return name;
}

function loadStudents() {
  try {
    const data = fs.readFileSync(nameFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('파일을 읽어오는 중 에러 발생:', error);
    return null;
  }
}

function containsForbiddenChars(str) {
  const forbiddenChars = "/',.#$%^&*()-_=+ ";

  for (let i = 0; i < str.length; i++) {
    if (forbiddenChars.includes(str[i])) {
      return true;
    }
  }

  return false;
}

module.exports = router;

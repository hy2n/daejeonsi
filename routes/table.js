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
//Teacher정보 저장 파일
const teacherFilePath = path.join(__dirname, './../data/db/teachers.json');

// GET 요청을 처리하는 라우트 설정
app.get('/:name',verifyToken, (req, res) => {
    const name = req.params.name; // 요청된 이름 가져오기
  
    // 파일에서 데이터 읽기
    fs.readFile(teacherFilePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      try {
        const teachers = JSON.parse(data);
        const teacher = teachers[name]; // 요청된 이름에 해당하는 데이터 찾기
  
        if (!teacher) {
          res.status(404).send('Teacher not found');
          return;
        }
  
        // 원하는 형식으로 데이터 응답
        const response = {
          teacher_name: teacher.InterTeacher,
          teacher_room: teacher.TeacherRoom
        };
  
        res.json(response);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('Internal Server Error');
      }
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

module.exports = router;

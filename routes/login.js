const express = require('express');
const router = express.Router();

// 사용자 정보를 저장할 JSON 파일 경로
const usersFilePath = path.join(__dirname, './db/users.json');

// 회원 정보를 받아오기
let users = [];
try {
  users = JSON.parse(fs.readFileSync(usersFilePath, 'utf8'));
} catch (err) {
  console.error('사용자 정보를 읽어오는 데 문제가 발생했습니다.', err);
}

// 로그인 엔드포인트
router.post('/', (req, res) => {
  console.log("this is login.js log");
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

module.exports = router;
const express = require('express');
const path = require('path');

const app = express();
const port = 3000; // 사용할 포트 번호

// 정적 파일 제공
app.use(express.static('public'));

// 루트 경로 요청 시 index.html 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다!`);
});
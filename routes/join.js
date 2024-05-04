const express = require('express');
const router = express.Router();

router.post('/join_api', (req, res) => {
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

module.exports = router;

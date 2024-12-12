const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Mock 데이터
let users = [{ id: '20191459' }, { id: '20182716' }];
let transactions = [
  {
    id: 1,
    description: '편의점에서 간식 구입',
    amount: 5000,
    type: 0, // 사용한 금액
    userId: '20191459',
    detail: '편의점에서 과자와 음료 구입',
  },
  {
    id: 2,
    description: '전기 요금 납부',
    amount: 80000,
    type: 0, // 사용한 금액
    userId: '20182716',
    detail: '8월 전기 요금 납부',
  },
  {
    id: 3,
    description: '알바비 입금',
    amount: 150000,
    type: 1, // 받은 금액
    userId: '20191459',
    detail: '7월 알바비 입금',
  },
  {
    id: 4,
    description: '용돈 받음',
    amount: 200000,
    type: 1, // 받은 금액
    userId: '20182716',
    detail: '부모님께 받은 용돈',
  },
];

app.use(express.json());
app.use(cors());

// -로그인
app.post('/login', (req, res) => {
  const { id } = req.body;
  const user = users.find((user) => user.id === id);
  if (user) {
    res.json(user); // 성공 후 아이디 반환
  } else {
    res.status(401).json({ error: '로그인 에러' });
  }
});

// -거래 목록 가져오기
app.post('/transactions/list', (req, res) => {
  const { userId } = req.body;
  const userTransactions = transactions.filter((t) => t.userId === userId);
  res.json(userTransactions);
});

// -거래 추가하기
app.post('/transactions/add', (req, res) => {
  const { description, amount, type, userId } = req.body;
  const newTransaction = { id: Date.now(), description, amount, type, userId, detail: '' };
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// -거래 상세정보 가져오기
app.post('/transactions/detail', (req, res) => {
  const { userId, transactionId } = req.body;
  const transaction = transactions.find(
    (t) => t.id === transactionId && t.userId === userId
  );
  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404).json({ error: '거래 상세 불러오기 에러' });
  }
});

// -거래 상세정보 수정하기
app.post('/transactions/update', (req, res) => {
  const { id, userId, description, amount, detail, type } = req.body;
  const transactionIndex = transactions.findIndex(
    (t) => t.id === id && t.userId === userId
  );
  if (transactionIndex !== -1) {
    transactions[transactionIndex] = {
      ...transactions[transactionIndex],
      description,
      amount,
      detail,
      type, // 거래 유형 수정
    };
    res.json(transactions[transactionIndex]);
  } else {
    res.status(404).json({ error: '거래 상세 수정 에러' });
  }
});

// -거래 삭제하기
app.post('/transactions/delete', (req, res) => {
  const { transactionId, userId } = req.body;
  const initialLength = transactions.length;
  transactions = transactions.filter(
    (t) => t.id !== transactionId || t.userId !== userId
  );
  if (transactions.length < initialLength) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: '거래 삭제 에러' });
  }
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버 실행중 http://localhost:${PORT}`);
});

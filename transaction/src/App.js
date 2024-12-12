import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [transactions, setTransactions] = useState([]); 
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', type: '1' }); 
  const [loginId, setLoginId] = useState(''); 
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [selectedTransaction, setSelectedTransaction] = useState(null); 
  const [detailPopupVisible, setDetailPopupVisible] = useState(false); 
  const [totalReceived, setTotalReceived] = useState(0); 
  const [totalSpent, setTotalSpent] = useState(0); 

  // 로그인 처리
  const login = async () => {
    try {
      // API: 로그인 요청
      const response = await axios.post('http://localhost:5000/login', { id: loginId });
      sessionStorage.setItem('userId', response.data.id);
      setIsLoggedIn(true);
      setLoginId('');
      fetchTransactions();
    } catch (error) {
      console.error('로그인에러:', error);
    }
  };

  // 로그아웃 처리
  const logout = () => {
    sessionStorage.removeItem('userId');
    setIsLoggedIn(false);
    setTransactions([]);
    setTotalReceived(0);
    setTotalSpent(0);
  };

  // 거래 목록 가져오기
  const fetchTransactions = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      console.error('거래목록에러');
      return;
    }

    try {
      // API: 거래 목록 요청
      const response = await axios.post('http://localhost:5000/transactions/list', { userId });
      setTransactions(response.data);
      calculateTotals(response.data);
    } catch (error) {
      console.error('거래목록요청에러:', error);
    }
  };

  // 총 금액 계산
  const calculateTotals = (data) => {
    let received = 0;
    let spent = 0;
    data.forEach((t) => {
      if (t.type === 1) received += t.amount;
      else spent += t.amount;
    });
    setTotalReceived(received);
    setTotalSpent(spent);
  };

  // 거래 추가하기
  const addTransaction = async () => {
    const userId = sessionStorage.getItem('userId');
    if (!newTransaction.description || !newTransaction.amount) {
      alert('거래 내역 정보가 안들어갔어요');
      return;
    }

    try {
      // API: 거래 추가 요청
      await axios.post('http://localhost:5000/transactions/add', {
        ...newTransaction,
        amount: parseInt(newTransaction.amount),
        type: parseInt(newTransaction.type),
        userId,
      });
      fetchTransactions();
      setNewTransaction({ description: '', amount: '', type: '1' });
    } catch (error) {
      console.error('거래추가에러:', error);
    }
  };

  // 거래 상세정보 가져오기 및 팝업 열기
  const openDetailPopup = async (transactionId) => {
    const userId = sessionStorage.getItem('userId');
    try {
      // API: 거래 상세정보 요청
      const response = await axios.post('http://localhost:5000/transactions/detail', {
        userId,
        transactionId,
      });
      setSelectedTransaction(response.data);
      setDetailPopupVisible(true);
    } catch (error) {
      console.error('거래 상세정보 불러오기 에러:', error);
    }
  };

  // 거래 상세정보 수정하기
  const updateTransactionDetail = async () => {
    const userId = sessionStorage.getItem('userId');
    try {
      // API: 거래 상세정보 수정 요청
      await axios.post('http://localhost:5000/transactions/update', {
        ...selectedTransaction,
        userId,
      });
      fetchTransactions();
      setDetailPopupVisible(false);
    } catch (error) {
      console.error('거래 상세정보 수정 에러:', error);
    }
  };

  // 팝업 닫기
  const closeDetailPopup = () => {
    setDetailPopupVisible(false);
    setSelectedTransaction(null);
  };

  
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      setIsLoggedIn(true);
      fetchTransactions();
    }
  }, []);

  return (
    <div>
      {!isLoggedIn ? (
        <div>
          <h2>로그인</h2>
          <input
            type="text"
            placeholder="id입력"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
          <button onClick={login}>로그인</button>
          <p>로그인하면 거래내역을 볼 수 있어요.</p>
        </div>
      ) : (
        <div>
          <h1>{sessionStorage.getItem('userId')}</h1>
          <button onClick={logout}>로그아웃</button>

          <h2>거래 내역 추가하기</h2>
          <input
            type="text"
            placeholder="거래내용"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="금액"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          />
          <div>
            <label>
              <input
                type="radio"
                name="type"
                value="1"
                checked={newTransaction.type === '1'}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
              />
              받은 금액 (+)
            </label>
            <label>
              <input
                type="radio"
                name="type"
                value="0"
                checked={newTransaction.type === '0'}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
              />
              사용한 금액 (-)
            </label>
          </div>
          <button onClick={addTransaction}>내역 추가하기</button>

          <h3>총 금액</h3>
          <p>받은 금액: {totalReceived.toLocaleString()}원</p>
          <p>사용한 금액: {totalSpent.toLocaleString()}원</p>

          <h2>거래 내역</h2>
          <table border="1">
            <thead>
              <tr>
                <th>거래내용</th>
                <th>금액</th>
                <th>유형</th>
                <th>상세정보</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.description}</td>
                  <td>{t.amount.toLocaleString()}원</td>
                  <td>{t.type === 1 ? '+' : '-'}</td>
                  <td>
                    <button onClick={() => openDetailPopup(t.id)}>상세정보</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {detailPopupVisible && selectedTransaction && (
            <div className="popup">
              <h3>거래 상세</h3>
              <label>
                거래내용:
                <input
                  type="text"
                  value={selectedTransaction.description}
                  onChange={(e) =>
                    setSelectedTransaction({ ...selectedTransaction, description: e.target.value })
                  }
                />
              </label>
              <label>
                금액:
                <input
                  type="number"
                  value={selectedTransaction.amount}
                  onChange={(e) =>
                    setSelectedTransaction({ ...selectedTransaction, amount: parseInt(e.target.value) })
                  }
                />
              </label>
              <label>
                상세정보:
                <textarea
                  value={selectedTransaction.detail || ''}
                  onChange={(e) =>
                    setSelectedTransaction({ ...selectedTransaction, detail: e.target.value })
                  }
                />
              </label>
              <button onClick={updateTransactionDetail}>저장하기</button>
              <button onClick={closeDetailPopup}>팝업 닫기</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;

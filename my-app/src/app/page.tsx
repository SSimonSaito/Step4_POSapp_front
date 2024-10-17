"use client";

import { useState } from 'react';
import axios from 'axios';
import { BarcodeScanner } from 'react-qr-barcode-scanner';
import './globals.css';

interface PurchaseItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export default function Home() {
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('商品名称を表示');
  const [productPrice, setProductPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchaseList, setPurchaseList] = useState<PurchaseItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [scanning, setScanning] = useState(false); // スキャン状態を管理

  const handleFetchProduct = async () => {
    if (productCode.length === 13) {
      try {
        const response = await axios.get(`/api/products/${productCode}`);
        const product = response.data;
        if (product) {
          setProductName(product.name);
          setProductPrice(product.price);
        } else {
          setProductName('商品がマスタ未登録です');
          setProductPrice(0);
        }
      } catch (error) {
        console.error('商品情報の取得エラー:', error);
      }
    }
  };

  const handleAddToList = () => {
    const itemTotal = productPrice * quantity;
    setPurchaseList([...purchaseList, { name: productName, quantity, price: productPrice, total: itemTotal }]);
    setTotalAmount(totalAmount + itemTotal);
    setProductCode('');
    setProductName('商品名称を表示');
    setProductPrice(0);
    setQuantity(1);
  };

  const handlePurchase = async () => {
    try {
      await axios.post('/api/purchase', { items: purchaseList, total: totalAmount });
      setPurchaseList([]);
      setTotalAmount(0);
      setProductName('商品名称を表示');
      setPurchaseMessage('ご購入ありがとうございました☺️');
    } catch (error) {
      console.error('購入処理エラー:', error);
    }
  };

  const handleClearList = () => {
    setPurchaseList([]);
    setTotalAmount(0);
    setProductName('商品名称を表示');
    setPurchaseMessage('');
  };

  // スキャンしたバーコードを処理
  const handleScan = (data: string | null) => {
    if (data) {
      setProductCode(data);
      setScanning(false); // スキャン完了
      handleFetchProduct(); // 商品情報を取得
    }
  };

  const handleError = (err: any) => {
    console.error('バーコードスキャンエラー:', err);
  };

  return (
    <div>
      <h1>🐶POSアプリ🐶</h1>
      <div className="button-container">
        <button onClick={() => setScanning(!scanning)}>
          {scanning ? 'スキャン停止' : 'バーコードスキャン'}
        </button>
      </div>

      {scanning && (
        <div>
          <BarcodeScanner onUpdate={(err, result) => (err ? handleError(err) : handleScan(result))} />
        </div>
      )}

      <input
        type="text"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
        placeholder="商品コードを入力"
        maxLength={13}
        disabled={scanning} // スキャン中は入力不可
      />
      <div className="button-container">
        <button onClick={handleFetchProduct}>商品コード読み込み</button>
      </div>
      <div>
        <h2>{productName}</h2>
        <p>単価: {productPrice}円</p>
      </div>

      <label htmlFor="quantity" style={{ display: 'block', marginTop: '20px' }}>
        数量を入力してください:
      </label>
      <input
        id="quantity"
        type="number"
        className="quantity-input"
        value={quantity}
        onChange={(e) => {
          const value = Number(e.target.value);
          if (value >= 0 && value <= 99) {
            setQuantity(value);
          }
        }}
        placeholder="0〜99の数量を入力"
        min={0}
        max={99}
      />

      <div className="button-container">
        <button onClick={handleAddToList}>商品リストへ追加</button>
      </div>

      <h3>購入品目リスト</h3>
      <div className="purchase-list">
        <ul>
          {purchaseList.map((item, index) => (
            <li key={index}>
              {item.name} - 数量: {item.quantity} - 単価: {item.price}円 - 合計: {item.total}円
            </li>
          ))}
        </ul>
      </div>

      <h3 className="total-amount">合計金額: {totalAmount}円</h3>

      <div className="button-container">
        <button onClick={handlePurchase}>購入</button>
        <button onClick={handleClearList}>クリア</button>
      </div>

      {purchaseMessage && <h3 style={{ textAlign: 'center', color: 'green' }}>{purchaseMessage}</h3>}
    </div>
  );
}

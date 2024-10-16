// src/app/page.tsx
"use client";

import { useState } from 'react';
import axios from 'axios';
import './globals.css'; // 同じディレクトリ内のCSSファイルをインポート

export default function Home() {
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('商品名称を表示'); // 初期値を設定
  const [productPrice, setProductPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [purchaseList, setPurchaseList] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [purchaseMessage, setPurchaseMessage] = useState(''); // 購入メッセージの状態を追加

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
        console.error('Error fetching product:', error);
      }
    }
  };

  const handleAddToList = () => {
    const itemTotal = productPrice * quantity;
    setPurchaseList([...purchaseList, { name: productName, quantity, price: productPrice, total: itemTotal }]);
    setTotalAmount(totalAmount + itemTotal);
    setProductCode('');
    setProductName('商品名称を表示'); // 初期値に戻す
    setProductPrice(0);
    setQuantity(1);
  };

  const handlePurchase = async () => {
    try {
      await axios.post('/api/purchase', { items: purchaseList, total: totalAmount });
      setPurchaseList([]); // 購入品目リストをクリア
      setTotalAmount(0); // 合計金額をリセット
      setProductName('商品名称を表示'); // 初期値に戻す
      setPurchaseMessage('ご購入ありがとうございました☺️'); // 購入メッセージを設定
    } catch (error) {
      console.error('Error processing purchase:', error);
    }
  };

  const handleClearList = () => {
    setPurchaseList([]); // 購入品目リストをクリア
    setTotalAmount(0); // 合計金額をリセット
    setProductName('商品名称を表示'); // 初期値に戻す
    setPurchaseMessage(''); // 購入メッセージをリセット
  };

  return (
    <div>
      <h1>POSアプリ</h1>
      <input
        type="text"
        value={productCode}
        onChange={(e) => setProductCode(e.target.value)}
        placeholder="商品コードを入力"
        maxLength={13}
      />
      <div className="button-container">
        <button onClick={handleFetchProduct}>商品コード読み込み</button>
      </div>
      <div>
        <h2>{productName}</h2> {/* 商品名称表示エリア */}
        <p>単価: {productPrice}円</p>
      </div>
      
      <label htmlFor="quantity" style={{ display: 'block', marginTop: '20px' }}>
        数量を入力してください:
      </label>
      <input
        id="quantity"
        type="number"
        className="quantity-input" // クラスを追加
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
      <div className="purchase-list"> {/* 購入品目リストのスタイルを適用 */}
        <ul>
          {purchaseList.map((item, index) => (
            <li key={index}>
              {item.name} - 数量: {item.quantity} - 単価: {item.price}円 - 合計: {item.total}円
            </li>
          ))}
        </ul>
      </div>
      
      <h3 className="total-amount">合計金額: {totalAmount}円</h3> {/* クラス名を追加 */}
      
      {/* ボタンを中央に配置 */}
      <div className="button-container">
        <button onClick={handlePurchase}>購入</button>
        <button onClick={handleClearList}>クリア</button> {/* クリアボタンの追加 */}
      </div>
      
      {/* 購入メッセージを表示 */}
      {purchaseMessage && <h3 style={{ textAlign: 'center', color: 'green' }}>{purchaseMessage}</h3>}
    </div>
  );
}

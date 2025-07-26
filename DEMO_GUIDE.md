# Kafka Food Delivery Demo - 実演ガイド

## 🎯 デモの目的

このデモは、Apache Kafkaを使用したイベント駆動型マイクロサービスアーキテクチャの実践例を示します。フードデリバリーサービスのシナリオを通じて、以下の概念を学習できます：

- **イベント駆動アーキテクチャ**の実装
- **Kafkaプロデューサー・コンシューマー**パターン
- **サービス間の疎結合**通信
- **リアルタイムデータ処理**とロケーション追跡
- **マイクロサービス**の協調動作
- **手動操作**と**自動処理**の組み合わせ

## 🏗️ システム構成

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Order Service │    │Restaurant Service│    │Delivery Service │
│    (Port 3001)  │    │    (Port 3002)   │    │   (Port 3003)   │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Apache Kafka         │
                    │   ┌─────────────────────┐ │
                    │   │   orders            │ │
                    │   │   order-status      │ │
                    │   │   delivery-location │ │
                    │   └─────────────────────┘ │
                    └───────────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Next.js Frontend      │
                    │       (Port 3000)         │
                    └───────────────────────────┘
```

## 🚀 セットアップ手順

### 1. 前提条件
- Docker & Docker Compose
- Node.js (開発時のみ)

### 2. 起動方法

```bash
# 本番モード（推奨）
./start.sh

# 開発モード（ホットリロード対応）
./start-dev.sh

# または手動起動
docker-compose up --build

# 開発モード（手動）
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 3. アクセス
- **フロントエンド**: http://localhost:3000
- **Kafka UI**: http://localhost:8080
- **API エンドポイント**: 
  - Order Service: http://localhost:3001/api
  - Restaurant Service: http://localhost:3002/api  
  - Delivery Service: http://localhost:3003/api

## 📱 デモのシナリオ

### シナリオ1: 基本的な注文フロー（手動操作）

1. **顧客が注文作成** (Customer View)
   - レストランを選択
   - メニューアイテムをカートに追加
   - 注文を確定
   - ➡️ `orders`トピックにイベント発行

2. **レストランスタッフが手動処理** (Restaurant View)
   - 新規注文が`CREATED`状態で表示
   - **手動操作**: 「Accept Order」ボタンをクリック
   - ➡️ `order-status`トピックに`ACCEPTED`イベント発行
   - **手動操作**: 「Start Preparing」ボタンをクリック
   - ➡️ `order-status`トピックに`PREPARING`イベント発行
   - **手動操作**: 「Mark Ready」ボタンをクリック
   - ➡️ `order-status`トピックに`READY`イベント発行

3. **配達員自動アサイン** (Delivery View)
   - 調理完了（`READY`）を検知して配達員を自動割り当て
   - リアルタイム位置情報の更新開始（超高速デモ設定）
   - ➡️ `delivery-location`トピックに位置情報発行

4. **配達完了** (All Views)
   - 配達状況をリアルタイム追跡（約8-15秒で完了）
   - プログレスバーが動的に更新
   - 最終的に`DELIVERED`ステータスに更新
   - Active Orders → Completed Ordersに自動移行

### シナリオ2: 複数注文の並行処理

1. 複数の顧客から同時に注文
2. 各レストランで並行して調理処理
3. 複数の配達員による同時配達
4. Kafkaのパーティション機能による負荷分散

### シナリオ3: リアルタイム監視

1. **Kafka UI**でメッセージフローを監視
   - http://localhost:8080
   - トピック内のメッセージを確認
   - パーティション分散状況を観察

2. **ダッシュボード**でシステム状況を確認
   - 各サービスの統計情報
   - リアルタイム状態更新
   - 配達員の稼働状況

## 🔍 技術ポイントの説明

### 1. イベント駆動アーキテクチャ
```typescript
// 注文作成時のイベント発行例
await kafkaService.publishMessage('orders', {
  ...order,
  eventType: 'ORDER_CREATED',
  timestamp: new Date().toISOString(),
});
```

### 2. コンシューマーパターン
```typescript
// 注文状態更新の処理例
await kafkaService.subscribe('order-status', async (statusEvent) => {
  // 状態更新ロジック
  await this.handleOrderStatusUpdate(statusEvent);
});
```

### 3. サービス間疎結合
- 各サービスは直接通信せず、Kafkaを経由
- サービス追加・削除が容易
- 障害の局所化

### 4. リアルタイム処理
- 位置情報の継続的更新
- WebSocketによるフロントエンド連携（実装予定）
- イベントストリーミング

## 🎬 デモ実演のコツ

### 準備
1. 事前にシステムを起動し、動作確認
2. ブラウザで複数タブを開いて3つのビューを表示
3. Kafka UIも別タブで開いておく

### 実演手順
1. **アーキテクチャ説明** (5分)
   - システム構成図を使って説明
   - Kafkaの役割を強調
   - 手動操作と自動処理の組み合わせを説明

2. **基本フロー実演** (10分)
   - Customer Viewで注文作成から始める
   - 各段階でKafka UIのメッセージを確認
   - Restaurant Viewでの手動操作を実演（Accept→Prepare→Ready）
   - Delivery Viewでリアルタイム追跡を見せる（超高速デモ）
   - プログレスバーの動的更新をアピール

3. **技術詳細説明** (10分)
   - コードレベルでの実装を説明
   - イベント駆動の利点を強調
   - リアルタイム位置追跡の技術を紹介
   - スケーラビリティについて言及

### 注意点
- ネットワーク接続を事前確認
- Docker メモリ使用量に注意
- デモ中はログを確認して動作を補足説明

## 🛠️ トラブルシューティング

### よくある問題

1. **サービスが起動しない**
   ```bash
   # ログを確認
   docker-compose logs -f [service-name]
   
   # 再起動
   docker-compose restart [service-name]
   ```

2. **Kafkaへの接続エラー**
   ```bash
   # Kafkaコンテナの状態確認
   docker-compose ps kafka
   
   # Kafkaログ確認
   docker-compose logs kafka
   ```

3. **フロントエンドが表示されない**
   ```bash
   # 開発モードで起動
   ./start-dev.sh
   
   # または依存関係のインストール
   cd frontend && npm install
   
   # 開発サーバーで起動
   npm run dev
   ```

4. **サービス間通信エラー**
   ```bash
   # 全サービスの再起動
   docker-compose restart
   
   # 特定サービスの再起動
   docker-compose restart restaurant-service
   ```

### システム要件
- **メモリ**: 最低4GB推奨
- **CPU**: 2コア以上推奨
- **ディスク**: 5GB以上の空き容量

## 📚 学習ポイント

このデモを通じて学習できる内容：

1. **Kafka基礎概念**
   - Producer/Consumer
   - Topic/Partition
   - Event Streaming

2. **マイクロサービス設計**
   - サービス分割
   - データ一貫性
   - 障害耐性

3. **現実的な活用例**
   - リアルタイムアプリケーション
   - イベントソーシング
   - CQRS パターン

このデモは、Kafkaの理論的な理解を実践的な知識に変換する優れた学習ツールです。

## ⚙️ デモ速度設定

### 🚚 デリバリー関連設定

**ドライバーの移動速度**:
- レストランまでの移動: `1000 km/h` (超高速デモ設定)
- 顧客までの移動: `1000 km/h` (超高速デモ設定)
- 位置更新間隔: `1秒` (リアルタイム更新)

**配達プロセス**:
- レストラン到着後の待機: `0.5秒`
- 顧客場所到着後の待機: `0.5秒`
- レストラン到着判定: `50メートル以内`
- 顧客到着判定: `20メートル以内`

### 🏪 レストラン処理設定

**手動操作**:
- 注文処理は完全手動（ボタンクリック必須）
- Accept Order → Start Preparing → Mark Ready
- 各段階でKafkaイベントを発行

**配達開始**:
- `READY`状態検知で自動ドライバー割り当て
- 即座に配達開始（`PICKED_UP`状態）

### ⏱️ 全体完了時間

**予想所要時間**: 約`8-15秒`で完了
- レストラン手動処理: 任意（ユーザー操作による）
- ドライバー移動: `3-10秒`（距離と1000km/h速度による）
- プロセス間待機: `1秒`

**プログレスバー**: 実際の配達位置に基づいて動的更新

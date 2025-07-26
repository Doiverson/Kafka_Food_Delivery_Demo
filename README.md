# Kafka Food Delivery Tracking Demo

リアルタイム配送追跡システムのKafka実装デモです。フードデリバリーサービスを模倣し、注文から配達完了までの一連のフローをKafkaを介して連携します。手動操作と自動処理を組み合わせた実践的なイベント駆動アーキテクチャのデモンストレーションです。

## システム構成

- **Order Service** (Port 3001): 注文の作成・管理
- **Restaurant Service** (Port 3002): 注文受付・調理状況更新
- **Delivery Service** (Port 3003): 配達状況の追跡
- **Frontend** (Port 3000): マルチユーザーダッシュボード
- **Kafka UI** (Port 8080): Kafkaメッセージ監視

## Kafkaトピック

- `orders`: 新規注文イベント
- `order-status`: 注文状態の変更
- `delivery-location`: 配達員の位置情報

## セットアップ

### 1. プロジェクトの起動

```bash
# 本番モード（推奨）
chmod +x start.sh
./start.sh

# 開発モード（ホットリロード対応）
chmod +x start-dev.sh  
./start-dev.sh

# 手動起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d --build
```

### 2. アクセス

- **フロントエンド**: http://localhost:3000
- **Kafka UI**: http://localhost:8080
- **Order Service**: http://localhost:3001
- **Restaurant Service**: http://localhost:3002
- **Delivery Service**: http://localhost:3003

### 3. サービス停止

```bash
docker-compose down
```

## デモフロー

1. **注文作成**: 顧客が注文を作成 → `orders`トピックに発行

2. **レストラン手動処理**:
   - 注文が`CREATED`状態で表示
   - **手動**: 「Accept Order」ボタンクリック → `ACCEPTED`状態
   - **手動**: 「Start Preparing」ボタンクリック → `PREPARING`状態  
   - **手動**: 「Mark Ready」ボタンクリック → `READY`状態
   - 各段階で`order-status`トピックにイベント発行

3. **配達自動開始**: 
   - 配達サービスが`READY`状態を検知 → 配達員自動割り当て
   - 超高速デモ設定（1000km/h）でリアルタイム位置追跡開始

4. **配達追跡**: 
   - 配達員位置情報を1秒間隔で`delivery-location`トピックに発行
   - プログレスバーが実際の位置に基づいて動的更新
   - 約8-15秒で配達完了

5. **注文完了**: 
   - `DELIVERED`状態でActive Orders → Completed Ordersに移動
   - 全インターフェースでリアルタイム状態同期

## 技術スタック

- **Backend**: Node.js/Express + TypeScript
- **Frontend**: Next.js + TypeScript  
- **Message Broker**: Apache Kafka
- **Container**: Docker & Docker Compose
- **Monitoring**: Kafka UI

## 開発

### 開発モード起動
```bash
# 全サービスを開発モードで起動（ホットリロード対応）
./start-dev.sh
```

### 個別サービス開発
```bash
# Order Service
cd services/order-service
npm install
npm run dev

# Restaurant Service  
cd services/restaurant-service
npm install
npm run dev

# Delivery Service
cd services/delivery-service
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### トラブルシューティング
```bash
# Dockerクリーンアップ
docker system prune -f

# サービス再起動
docker-compose restart [service-name]

# ログ確認
docker-compose logs -f [service-name]
```

## 主要機能

- ✅ **手動操作**: レストランスタッフによる注文処理
- ✅ **リアルタイム追跡**: GPS位置に基づく配達追跡
- ✅ **動的プログレスバー**: 実際の移動距離に基づく進捗表示
- ✅ **超高速デモ**: 8-15秒での配達完了デモ
- ✅ **Kafka監視**: Kafka UIでのメッセージフロー確認
- ✅ **マルチサービス**: 独立したマイクロサービス構成
- ✅ **型安全性**: TypeScriptによる堅牢な実装# Kafka_Food_Delivery_Demo

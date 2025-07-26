import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { KafkaService } from './kafka';
import { OrderService } from './orderService';
import { createOrderRoutes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

// Middleware
app.use(cors());
app.use(express.json());

// Kafka and Order Service initialization
let kafkaService: KafkaService;
let orderService: OrderService;

async function initializeServices() {
  try {
    // Initialize Kafka
    kafkaService = new KafkaService([KAFKA_BROKER], 'order-service-group');
    await kafkaService.connect();

    // Initialize Order Service
    orderService = new OrderService(kafkaService);
    await orderService.initialize();

    // Setup routes
    app.use('/api', createOrderRoutes(orderService));

    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log('Shutting down gracefully...');
  
  if (kafkaService) {
    await kafkaService.disconnect();
  }
  
  process.exit(0);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
    console.log(`Connected to Kafka broker: ${KAFKA_BROKER}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
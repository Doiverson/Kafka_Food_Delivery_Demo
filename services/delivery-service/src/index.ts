import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { KafkaService } from './kafka';
import { DeliveryService } from './deliveryService';
import { createDeliveryRoutes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

// Middleware
app.use(cors());
app.use(express.json());

// Kafka and Delivery Service initialization
let kafkaService: KafkaService;
let deliveryService: DeliveryService;

async function initializeServices() {
  try {
    // Initialize Kafka
    kafkaService = new KafkaService([KAFKA_BROKER], 'delivery-service-group');
    await kafkaService.connect();

    // Initialize Delivery Service
    deliveryService = new DeliveryService(kafkaService);
    await deliveryService.initialize();

    // Setup routes
    app.use('/api', createDeliveryRoutes(deliveryService));

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
    console.log(`Delivery Service running on port ${PORT}`);
    console.log(`Connected to Kafka broker: ${KAFKA_BROKER}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
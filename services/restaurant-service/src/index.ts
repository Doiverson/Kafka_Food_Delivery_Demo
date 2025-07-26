import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { KafkaService } from './kafka';
import { RestaurantService } from './restaurantService';
import { createRestaurantRoutes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';

// Middleware
app.use(cors());
app.use(express.json());

// Kafka and Restaurant Service initialization
let kafkaService: KafkaService;
let restaurantService: RestaurantService;

async function initializeServices() {
  try {
    // Initialize Kafka with unique group ID to avoid conflicts
    kafkaService = new KafkaService([KAFKA_BROKER], `restaurant-service-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    await kafkaService.connect();

    // Initialize Restaurant Service
    restaurantService = new RestaurantService(kafkaService);
    await restaurantService.initialize();

    // Setup routes
    app.use('/api', createRestaurantRoutes(restaurantService));

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
    console.log(`Restaurant Service running on port ${PORT}`);
    console.log(`Connected to Kafka broker: ${KAFKA_BROKER}`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
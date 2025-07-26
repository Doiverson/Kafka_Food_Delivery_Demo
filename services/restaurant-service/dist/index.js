"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const kafka_1 = require("./kafka");
const restaurantService_1 = require("./restaurantService");
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Kafka and Restaurant Service initialization
let kafkaService;
let restaurantService;
async function initializeServices() {
    try {
        // Initialize Kafka with unique group ID to avoid conflicts
        kafkaService = new kafka_1.KafkaService([KAFKA_BROKER], `restaurant-service-group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
        await kafkaService.connect();
        // Initialize Restaurant Service
        restaurantService = new restaurantService_1.RestaurantService(kafkaService);
        await restaurantService.initialize();
        // Setup routes
        app.use('/api', (0, routes_1.createRestaurantRoutes)(restaurantService));
        console.log('Services initialized successfully');
    }
    catch (error) {
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
//# sourceMappingURL=index.js.map
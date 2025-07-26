"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const kafkajs_1 = require("kafkajs");
class KafkaService {
    constructor(brokers, groupId) {
        this.brokers = brokers;
        this.groupId = groupId;
        this.topicHandlers = new Map();
        this.isRunning = false;
        this.kafka = new kafkajs_1.Kafka({
            clientId: 'restaurant-service',
            brokers: this.brokers,
        });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId: this.groupId });
    }
    async connect() {
        await this.producer.connect();
        await this.consumer.connect();
        console.log('Kafka connected successfully');
    }
    async disconnect() {
        await this.producer.disconnect();
        await this.consumer.disconnect();
        console.log('Kafka disconnected');
    }
    async publishMessage(topic, message) {
        try {
            await this.producer.send({
                topic,
                messages: [
                    {
                        key: message.id || message.orderId || null,
                        value: JSON.stringify(message),
                        timestamp: Date.now().toString(),
                    },
                ],
            });
            console.log(`Message published to topic ${topic}:`, message);
        }
        catch (error) {
            console.error(`Error publishing to topic ${topic}:`, error);
            throw error;
        }
    }
    async subscribe(topic, callback) {
        if (this.isRunning) {
            throw new Error('Cannot subscribe to topics after consumer has started');
        }
        this.topicHandlers.set(topic, callback);
        console.log(`Registered handler for topic: ${topic}`);
    }
    async startConsumer() {
        if (this.isRunning) {
            console.log('Consumer already running');
            return;
        }
        if (this.topicHandlers.size === 0) {
            console.log('No topics to subscribe to');
            return;
        }
        try {
            // Subscribe to all topics
            for (const topic of this.topicHandlers.keys()) {
                await this.consumer.subscribe({ topic, fromBeginning: false });
                console.log(`Subscribed to topic: ${topic}`);
            }
            this.isRunning = true;
            // Start the consumer
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const messageValue = message.value?.toString();
                        if (messageValue) {
                            const parsedMessage = JSON.parse(messageValue);
                            console.log(`Received message from topic ${topic}:`, parsedMessage);
                            // Get the handler for this topic and call it
                            const handler = this.topicHandlers.get(topic);
                            if (handler) {
                                await handler(parsedMessage);
                            }
                        }
                    }
                    catch (error) {
                        console.error(`Error processing message from topic ${topic}:`, error);
                    }
                },
            });
        }
        catch (error) {
            console.error('Error starting consumer:', error);
            this.isRunning = false;
            throw error;
        }
    }
    getProducer() {
        return this.producer;
    }
    getConsumer() {
        return this.consumer;
    }
}
exports.KafkaService = KafkaService;
//# sourceMappingURL=kafka.js.map
import { Producer, Consumer } from 'kafkajs';
export declare class KafkaService {
    private brokers;
    private groupId;
    private kafka;
    private producer;
    private consumer;
    constructor(brokers: string[], groupId: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    publishMessage(topic: string, message: any): Promise<void>;
    private topicHandlers;
    private isRunning;
    subscribe(topic: string, callback: (message: any) => Promise<void>): Promise<void>;
    startConsumer(): Promise<void>;
    getProducer(): Producer;
    getConsumer(): Consumer;
}
//# sourceMappingURL=kafka.d.ts.map
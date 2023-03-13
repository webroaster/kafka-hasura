"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const kafka_node_1 = __importDefault(require("kafka-node"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, fastify_1.default)({
    logger: true,
});
app.register(cors_1.default, {
    origin: "*",
});
const Producer = kafka_node_1.default.HighLevelProducer;
const client = new kafka_node_1.default.KafkaClient({
    kafkaHost: `${process.env.KAFKA_HOST}`,
});
const producer = new Producer(client, {
    partitionerType: 1,
});
producer.on("ready", () => {
    console.log("プロデューサー起動");
});
producer.on("error", (err) => console.log(err));
app.post("/create", (request, reply) => {
    const payload = [
        {
            topic: `${process.env.KAFKA_TOPIC}`,
            messages: JSON.stringify(request.body),
        },
    ];
    producer.send(payload, (err, data) => {
        if (err)
            console.log(err);
        else
            console.log(`プロデューサーから送信`);
    });
    return reply.send({ message: "ok" });
});
app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Fastifyサーバー起動中${address}`);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const kafka_node_1 = __importDefault(require("kafka-node"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const graphqlAxiosInstance = axios_1.default.create({
    baseURL: process.env.GRAPHQL_URL,
});
const app = (0, fastify_1.default)({
    logger: true,
});
app.register(cors_1.default, {
    origin: "*",
});
const client = new kafka_node_1.default.KafkaClient({
    kafkaHost: `${process.env.KAFKA_HOST}`,
});
const topicsToCreate = [
    {
        topic: `${process.env.TOPIC_CREATE}`,
        partitions: 1,
        replicationFactor: 1,
    },
];
client.createTopics(topicsToCreate, (error, result) => {
    if (error) {
        console.error(error);
    }
});
const producer = new kafka_node_1.default.Producer(client, {
    partitionerType: 1,
});
producer.on("ready", async () => {
    console.log("プロデューサー起動");
});
// 全データ取得
app.get("/users", async (_, reply) => {
    const query = `
    {
      ${process.env.TABLE_NAME}(order_by: {id: asc}) {
        id
        username
        email
        password
      }
    }
  `;
    const { data } = await graphqlAxiosInstance.post("", { query });
    reply.send(data.data);
});
// ユーザー登録
app.post("/create", (request, reply) => {
    const payload = [
        {
            topic: `${process.env.TOPIC_CREATE}`,
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
producer.on("error", (err) => console.log(err));
app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Fastifyサーバー起動中${address}`);
});

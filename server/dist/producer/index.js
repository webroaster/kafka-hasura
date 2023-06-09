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
class UserProducer {
    constructor() {
        this.app = (0, fastify_1.default)({ logger: true });
        this.client = new kafka_node_1.default.KafkaClient({
            kafkaHost: `${process.env.KAFKA_HOST}`,
        });
        this.producer = new kafka_node_1.default.Producer(this.client, {
            partitionerType: 1,
        });
        this.graphqlClient = axios_1.default.create({
            baseURL: process.env.GRAPHQL_URL,
        });
    }
    async start() {
        this.registerPlugins();
        this.setRoutes();
        this.setEventListeners();
        try {
            await this.app.listen(3000);
            console.log(`Fastifyサーバー起動中：${this.app.server.address()}`);
        }
        catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    }
    registerPlugins() {
        this.app.register(cors_1.default, {
            origin: "*",
        });
    }
    setRoutes() {
        this.app.get("/users", async (_, reply) => {
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
            const { data } = await this.graphqlClient.post("", { query });
            reply.send(data.data);
        });
        this.app.post("/create", async (request, reply) => {
            const { email, username } = request.body;
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
            const { data } = await this.graphqlClient.post("", { query });
            const isSameUser = data.data.users.some((existingUser) => existingUser.email === email || existingUser.username === username);
            if (!isSameUser) {
                const payload = [
                    {
                        topic: `${process.env.TOPIC_CREATE}`,
                        messages: JSON.stringify(request.body),
                    },
                ];
                this.producer.send(payload, (err, data) => {
                    if (err)
                        console.log(err);
                    else {
                        console.log(data);
                        console.log("ユーザーデータをKafkaに格納");
                    }
                });
                return reply.send({ message: "ok" });
            }
            else {
                return reply.status(201).send({ message: "既に登録されています。" });
            }
        });
    }
    setEventListeners() {
        this.producer.on("ready", () => {
            console.log("プロデューサー起動");
        });
        this.producer.on("error", (err) => console.log(err));
    }
}
const userProducer = new UserProducer();
userProducer.start();

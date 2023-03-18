"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_node_1 = require("kafka-node");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
class UserConsumer {
    constructor() {
        this.graphqlClient = axios_1.default.create({
            baseURL: process.env.GRAPHQL_URL,
        });
        const client = new kafka_node_1.KafkaClient({
            kafkaHost: process.env.KAFKA_HOST,
        });
        this.consumer = new kafka_node_1.Consumer(client, [{ topic: process.env.TOPIC_CREATE, partition: 0 }], {
            autoCommit: true,
            fromOffset: true,
        });
        this.consumer.on("error", (err) => {
            console.error(err);
        });
    }
    async createConsumerCallback(message) {
        const user = JSON.parse(message.value);
        const query = `
      mutation {
        insert_${process.env.TABLE_NAME} (objects: [{
          username: "${user.username}",
          email: "${user.email}",
          password: "${user.password}"
        }]) {
          returning {
            id
            username
            email
            password
          }
        }
      }
    `;
        try {
            const result = await this.graphqlClient.post("", { query });
            if (result.data.errors) {
                console.log("登録済のため登録できませんでした。");
            }
            else {
                console.log("登録完了");
            }
        }
        catch (err) {
            console.error(err);
        }
    }
    start() {
        this.consumer.on("message", async (message) => {
            await this.createConsumerCallback(message);
        });
    }
}
const userConsumer = new UserConsumer();
userConsumer.start();

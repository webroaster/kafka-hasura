"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_node_1 = __importDefault(require("kafka-node"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const TABLE_NAME = process.env.TABLE_NAME;
const graphqlAxiosInstance = axios_1.default.create({
    baseURL: process.env.GRAPHQL_URL,
});
const Consumer = kafka_node_1.default.Consumer;
const client = new kafka_node_1.default.KafkaClient({ kafkaHost: `${process.env.KAFKA_HOST}` });
const consumer = new Consumer(client, [{ topic: `${process.env.KAFKA_TOPIC}`, partition: 0 }], {
    autoCommit: true,
    fromOffset: true,
});
consumer.on("message", async (message) => {
    const json = JSON.parse(message.value);
    const query = `
    mutation {
      insert_${TABLE_NAME} (objects: [{
        username: "${json.username}",
        email: "${json.email}",
        password: "${json.password}"
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
        await graphqlAxiosInstance.post("", { query });
    }
    catch (err) {
        console.error(err);
    }
});
consumer.on("error", (err) => {
    console.error(err);
});

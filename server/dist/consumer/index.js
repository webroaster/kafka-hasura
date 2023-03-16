"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const kafka_node_1 = __importDefault(require("kafka-node"));
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const graphqlAxiosInstance = axios_1.default.create({
    baseURL: process.env.GRAPHQL_URL,
});
const Consumer = kafka_node_1.default.Consumer;
const client = new kafka_node_1.default.KafkaClient({ kafkaHost: `${process.env.KAFKA_HOST}` });
const topicsToCreate = [
    {
        topic: `${process.env.TOPIC_CREATE}`,
        partitions: 1,
        replicationFactor: 1,
    },
];
client.createTopics(topicsToCreate, (error, _) => {
    if (error) {
        console.error(error);
    }
});
const createConsumer = new Consumer(client, [{ topic: `${process.env.TOPIC_CREATE}`, partition: 0 }], {
    autoCommit: true,
    fromOffset: true,
});
// ユーザー登録
createConsumer.on("message", async (message) => {
    const json = JSON.parse(message.value);
    const createQuery = `
    mutation {
      insert_${process.env.TABLE_NAME} (objects: [{
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
        const createData = await graphqlAxiosInstance.post("", {
            query: createQuery,
        });
        if (!createData.data.errors) {
            console.log("登録完了");
        }
        else {
            console.log("登録済のため登録できませんでした。");
        }
    }
    catch (err) {
        console.error(err);
    }
});
createConsumer.on("error", (err) => {
    console.error(err);
});

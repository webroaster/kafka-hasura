import kafka from "kafka-node"
import dotenv from "dotenv"
import axios from "axios"

dotenv.config()

const TABLE_NAME = process.env.TABLE_NAME

const graphqlAxiosInstance = axios.create({
  baseURL: process.env.GRAPHQL_URL,
})

const Consumer = kafka.Consumer
const client = new kafka.KafkaClient({ kafkaHost: `${process.env.KAFKA_HOST}` })

const consumer = new Consumer(
  client,
  [{ topic: `${process.env.KAFKA_TOPIC}`, partition: 0 }],
  {
    autoCommit: true,
    fromOffset: true,
  }
)

consumer.on("message", async (message) => {
  const json = JSON.parse(message.value as any)

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
  `

  try {
    await graphqlAxiosInstance.post("", { query })
  } catch (err) {
    console.error(err)
  }
})

consumer.on("error", (err) => {
  console.error(err)
})

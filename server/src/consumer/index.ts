import kafka from "kafka-node"
import dotenv from "dotenv"
import axios from "axios"

dotenv.config()

const graphqlAxiosInstance = axios.create({
  baseURL: process.env.GRAPHQL_URL,
})

const Consumer = kafka.Consumer
const client = new kafka.KafkaClient({ kafkaHost: `${process.env.KAFKA_HOST}` })

const createConsumer = new Consumer(
  client,
  [{ topic: `${process.env.TOPIC_CREATE}`, partition: 0 }],
  {
    autoCommit: true,
    fromOffset: true,
  }
)

// ユーザー登録
createConsumer.on("message", async (message) => {
  const json = JSON.parse(message.value as any)

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
  `

  try {
    const createData = await graphqlAxiosInstance.post("", {
      query: createQuery,
    })
    if (!createData.data.errors) {
      console.log("登録完了")
    } else {
      console.log("登録済のため登録できませんでした。")
    }
  } catch (err) {
    console.error(err)
  }
})

createConsumer.on("error", (err) => {
  console.error(err)
})

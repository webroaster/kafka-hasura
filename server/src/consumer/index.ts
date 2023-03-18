import { Consumer, KafkaClient, Message } from "kafka-node"
import dotenv from "dotenv"
import axios, { AxiosInstance } from "axios"

dotenv.config()

class UserConsumer {
  private readonly consumer: Consumer
  private readonly graphqlClient: AxiosInstance

  constructor() {
    this.graphqlClient = axios.create({
      baseURL: process.env.GRAPHQL_URL,
    })

    const client = new KafkaClient({
      kafkaHost: process.env.KAFKA_HOST as string,
    })

    this.consumer = new Consumer(
      client,
      [{ topic: process.env.TOPIC_CREATE as string, partition: 0 }],
      {
        autoCommit: true,
        fromOffset: true,
      }
    )

    this.consumer.on("error", (err) => {
      console.error(err)
    })
  }

  async createConsumerCallback(message: Message): Promise<void> {
    const user = JSON.parse(message.value as string)
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
    `

    try {
      const result = await this.graphqlClient.post("", { query })
      if (result.data.errors) {
        console.log("登録済のため登録できませんでした。")
      } else {
        console.log("登録完了")
      }
    } catch (err) {
      console.error(err)
    }
  }

  start(): void {
    this.consumer.on("message", async (message) => {
      await this.createConsumerCallback(message)
    })
  }
}

const userConsumer = new UserConsumer()
userConsumer.start()

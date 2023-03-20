import fastify, { FastifyInstance } from "fastify"
import cors from "@fastify/cors"
import kafka, { KafkaClient, Producer } from "kafka-node"
import dotenv from "dotenv"
import axios, { AxiosInstance } from "axios"

dotenv.config()

interface User {
  id: number
  username: string
  email: string
  password: string
}

class UserProducer {
  private readonly app: FastifyInstance
  private readonly client: KafkaClient
  private readonly producer: Producer
  private readonly graphqlClient: AxiosInstance

  constructor() {
    this.app = fastify({ logger: true })
    this.client = new kafka.KafkaClient({
      kafkaHost: `${process.env.KAFKA_HOST}`,
    })
    this.producer = new kafka.Producer(this.client, {
      partitionerType: 1,
    })
    this.graphqlClient = axios.create({
      baseURL: process.env.GRAPHQL_URL,
    })
  }

  public async start() {
    this.registerPlugins()
    this.setRoutes()
    this.setEventListeners()
    try {
      await this.app.listen(3000)
      console.log(`Fastifyサーバー起動中：${this.app.server.address()}`)
    } catch (err) {
      this.app.log.error(err)
      process.exit(1)
    }
  }

  private registerPlugins() {
    this.app.register(cors, {
      origin: "*",
    })
  }

  private setRoutes() {
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
      `
      const { data } = await this.graphqlClient.post("", { query })

      reply.send(data.data)
    })

    this.app.post("/create", async (request, reply) => {
      const { email, username } = request.body as User
      const query = `
        {
          ${process.env.TABLE_NAME}(order_by: {id: asc}) {
            id
            username
            email
            password
          }
        }
      `
      const { data } = await this.graphqlClient.post("", { query })

      const isSameUser = data.data.users.some(
        (existingUser: User) =>
          existingUser.email === email || existingUser.username === username
      )

      if (!isSameUser) {
        const payload = [
          {
            topic: `${process.env.TOPIC_CREATE}`,
            messages: JSON.stringify(request.body),
          },
        ]

        this.producer.send(payload, (err, data) => {
          if (err) console.log(err)
          else {
            console.log(data)
            console.log("ユーザーデータをKafkaに格納")
          }
        })
        return reply.send({ message: "ok" })
      } else {
        return reply.status(201).send({ message: "既に登録されています。" })
      }
    })
  }

  private setEventListeners() {
    this.producer.on("ready", () => {
      console.log("プロデューサー起動")
    })

    this.producer.on("error", (err) => console.log(err))
  }
}

const userProducer = new UserProducer()
userProducer.start()

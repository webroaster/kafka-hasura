import fastify from "fastify"
import cors from "@fastify/cors"
import kafka from "kafka-node"
import dotenv from "dotenv"
import axios from "axios"

dotenv.config()

const graphqlAxiosInstance = axios.create({
  baseURL: process.env.GRAPHQL_URL,
})

const app = fastify({
  logger: true,
})

app.register(cors, {
  origin: "*",
})

interface User {
  id: number
  username: string
  email: string
  password: string
}

const client = new kafka.KafkaClient({
  kafkaHost: `${process.env.KAFKA_HOST}`,
})

const producer = new kafka.Producer(client, {
  partitionerType: 1,
})

producer.on("ready", () => {
  console.log("プロデューサー起動")
})

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
  `

  const { data } = await graphqlAxiosInstance.post("", { query })

  reply.send(data.data)
})

// ユーザー登録
app.post("/create", async (request, reply) => {
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
  const { data } = await graphqlAxiosInstance.post("", { query })

  const isSameUser = data.data.users.some(
    (user: User) => user.email === email || user.username === username
  )

  if (!isSameUser) {
    const payload = [
      {
        topic: `${process.env.TOPIC_CREATE}`,
        messages: JSON.stringify(request.body),
      },
    ]
    producer.send(payload, (err, data) => {
      if (err) console.log(err)
      else {
        console.log(data)
        console.log(`ユーザーデータをKafkaに格納`)
      }
    })
    return reply.send({ message: "ok" })
  } else {
    return reply.status(201).send({ message: "既に登録されています。" })
  }
})

producer.on("error", (err) => console.log(err))

const start = async () => {
  try {
    await app.listen(3000)
    console.log(`Fastifyサーバー起動中：${app.server.address()}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

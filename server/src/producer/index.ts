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

const client = new kafka.KafkaClient({
  kafkaHost: `${process.env.KAFKA_HOST}`,
})

const producer = new kafka.Producer(client, {
  partitionerType: 1,
})

producer.on("ready", async () => {
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
  const body = request.body as any
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

  let sameUser = 0
  data.data.users.forEach(async (user: any) => {
    if (user.email === body.email || user.username === body.username) {
      sameUser++
    }
  })

  if (sameUser === 0) {
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

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Fastifyサーバー起動中${address}`)
})

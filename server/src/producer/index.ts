import fastify from "fastify"
import cors from "@fastify/cors"
import kafka from "kafka-node"
import dotenv from "dotenv"

dotenv.config()

const app = fastify({
  logger: true,
})

app.register(cors, {
  origin: "*",
})

const Producer = kafka.HighLevelProducer

const client = new kafka.KafkaClient({
  kafkaHost: `${process.env.KAFKA_HOST}`,
})

const producer = new Producer(client, {
  partitionerType: 1,
})

producer.on("ready", () => {
  console.log("プロデューサー起動")
})

producer.on("error", (err) => console.log(err))

app.post("/create", (request, reply) => {
  const payload = [
    {
      topic: `${process.env.KAFKA_TOPIC}`,
      messages: JSON.stringify(request.body),
    },
  ]
  producer.send(payload, (err, data) => {
    if (err) console.log(err)
    else console.log(`プロデューサーから送信`)
  })

  return reply.send({ message: "ok" })
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Fastifyサーバー起動中${address}`)
})

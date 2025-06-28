
import Fastify, {FastifyInstance} from "fastify";

const server: FastifyInstance = Fastify({})

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.listen({ port: 3334 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

// Export the server instance for fastify CLI
export default server

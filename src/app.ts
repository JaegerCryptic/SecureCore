import compress from '@fastify/compress'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import fastifyMultipart from '@fastify/multipart'
import rateLimit from '@fastify/rate-limit'
import fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { decode } from 'jsonwebtoken'

import { JwtPayload } from './utils/jwt.js'
import routes from './routes.js'
import jwtCheck from './hooks/jwtCheck.js'
import { getRedisClient } from './utils/db.js'

// const CACHE_HOST_URL = process.env.CACHE_HOST_URL

const app = fastify({
  logger: {
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          headers: req.headers['x-forwarded-for'],
          remoteAddress: req.ip,
        }
      },
    },
  },
})

// override console.log to use the configured fastify pino logger
console.log = app.log.info.bind(app.log)
console.error = app.log.error.bind(app.log)
console.warn = app.log.warn.bind(app.log)
console.debug = app.log.debug.bind(app.log)

declare module 'fastify' {
  interface FastifyRequest {
    jwtPayload?: JwtPayload
    authToken?: string
  }
}

// TODO: We probably need to restrict origin to front-end and other services?
app.register(cors, {
  origin: '*',
})

// Add compression to all routes - browsers should be able to handle this fine
app.register(compress)

// Add helmet to all routes - security headers
app.register(
  helmet,
  // Example disables the `contentSecurityPolicy` middleware but keeps the rest.
  { contentSecurityPolicy: false },
)

app.register(fastifyMultipart, {
  attachFieldsToBody: 'keyValues',
  limits: {
    fileSize: 1024 * 1024 * 5, // 5mb
  },
})

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Optionally pass through raw body for stripe webhook signature validation
app.register(import('fastify-raw-body'), {
  field: 'rawBody', // change the default request.rawBody property name
  global: false, // add the rawBody to every request. **Default true**
  encoding: 'utf8', // set it to false to set rawBody as a Buffer **Default utf8**
  runFirst: true, // get the body before any preParsing hook change/uncompress it. **Default false**
  routes: [], // array of routes, **`global`** will be ignored, wildcard routes not supported
})

// Add rate limiting to all routes, 100 requests per minute - We can increase this easily if not sufficient
// We use a Redis serverless elasticache instance to store the rate limiting data across all docker containers
await app.register(rateLimit, {
  max: 100,
  errorResponseBuilder: function (req, _context) {
    let key: string
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1]
      const decoded = decode(token, { complete: true })
      if (decoded) {
        key = (decoded.payload as JwtPayload).id
      } else {
        key =
          (typeof req.headers['x-forwarded-for'] === 'string'
            ? req.headers['x-forwarded-for'].split(',').pop()
            : req.headers['x-forwarded-for']?.pop()) || req.ip
      }
    } else {
      key =
        (typeof req.headers['x-forwarded-for'] === 'string'
          ? req.headers['x-forwarded-for'].split(',').pop()
          : req.headers['x-forwarded-for']?.pop()) || req.ip
    }

    return {
      error: 'Too many requests',
      message: 'You have exceeded the request limit',
      statusCode: 429,
      key,
    }
  },
  timeWindow: '1 minute',
  skipOnError: true,
  redis: getRedisClient(),
  keyGenerator: function (request) {
    // check for auth header, and extract the id from it
    if (request.headers.authorization) {
      const token = request.headers.authorization.split(' ')[1]
      const decoded = decode(token, { complete: true })
      if (decoded) {
        const payload = decoded.payload as JwtPayload
        return payload.id as string
      }
    }
    return (
      (typeof request.headers['x-forwarded-for'] === 'string'
        ? request.headers['x-forwarded-for'].split(',').pop()
        : request.headers['x-forwarded-for']?.pop()) || request.ip
    ) // fallback to default
  },
})

// Add rate limiting to 404s, 4 requests per minute - We can increase this easily if not sufficient
// This is to prevent brute force attacks on our API
app.setNotFoundHandler(
  {
    preHandler: app.rateLimit({
      max: 4,
      timeWindow: '1 minute',
      skipOnError: true,
      keyGenerator: function (request) {
        return (
          (typeof request.headers['x-forwarded-for'] === 'string'
            ? request.headers['x-forwarded-for'].split(',').pop()
            : request.headers['x-forwarded-for']?.pop()) || request.ip
        ) // fallback to default
      },
    }),
  },
  function (request, reply) {
    reply.code(404).send()
  },
)

// Routes have to be defined after the rate limiting, otherwise the rate limiting won't work
// Authenticated routes
app.register((instance, _opts, done) => {
  routes.authenticated(instance)
  instance.addHook('onRequest', jwtCheck)
  done()
})

// Unauthenticated routes
app.register((instance, _opts, done) => {
  routes.unauthenticated(instance)
  done()
})

// health check route
app.get('/health', async (req) => {
  req.log.info('Health check')
  return { status: 'ok' }
})

export default app

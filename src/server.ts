import app from './app.js'
import { getSigningKeys } from './utils/getSigningKeys.js'

export const run = async () => {
  app.log.info('Initialising signing keys')
  await getSigningKeys()

  app.listen({ port: 8080, host: '0.0.0.0' }, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
}

run()

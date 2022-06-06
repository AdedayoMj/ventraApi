import { Hono } from 'hono'
// import { basicAuth } from 'hono/basic-auth'
import { prettyJSON } from 'hono/pretty-json'
import { api } from './app'
import { Bindings } from './bindings'


const app = new Hono()

app.get('/', (c) => c.text('Booking API'))

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

const middleware = new Hono<Bindings>()
middleware.use('*', prettyJSON())
middleware.use('/products/*', async (_c, next) => {
  
  
  await next()
})

app.route('/api', middleware)
app.route('/api', api)

export default app
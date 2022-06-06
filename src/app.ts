import { Hono } from 'hono'
import * as model from './models/model'
import { Bindings } from './bindings'
import { bodyParse } from 'hono/body-parse'
import { cors } from 'hono/cors'


const api = new Hono<Bindings>()
api.use('/products/*', cors(), bodyParse())

api.get('/', (c:any) => {
 return c.json({ message: 'Hello' })
})

api.get('/products', async (c:any) => {
 const products = await model.getProducts(c.env.VENTRATA)
 return c.json({ products: products, ok: true })
})

api.post('/products', async (c:any) => {

 const param = c.req.parsedBody
 if(!param) return  c.json({ error: "Field required", ok: false }, 422)
 const newPost = await model.createProduct(c.env.VENTRATA, param)
 if (!newPost) {
   return c.json({ error: 'Can not create new Product', ok: false }, 422)
 }
 return c.json({ post: newPost, ok: true }, 201)
})

api.get('/products/:id', async (c:any) => {
 const id = c.req.param('id')
 const post = await model.getProduct(c.env.VENTRATA, id)
 if (!post) {
   return c.json({ error: 'Not Found', ok: false }, 404)
 }
 return c.json({ post: post, ok: true })
})

api.put('/products/:id', async (c:any) => {
 const id = c.req.param('id')
 const post = await model.getProduct(c.env.VENTRATA, id)
 if (!post) {
   // 204 No Content
   return new Response(null, { status: 204 })
 }
 const param = c.req.parsedBody
 const success = await model.updateProduct(c.env.VENTRATA, id, param)
 return c.json({ ok: success })
})

api.delete('/products/:id', async (c:any) => {
 const id = c.req.param('id')
 const post = await model.getProduct(c.env.VENTRATA, id)
 if (!post) {
   // 204 No Content
   return new Response(null, { status: 204 })
 }
 const success = await model.deletePost(c.env.VENTRATA, id)
 return c.json({ ok: success })
})

export { api } 

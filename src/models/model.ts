import { Param, Product } from '../types';

const PREFIX = 'v1:post:'

const generateID = (key: string) => {
    return `${PREFIX}${key}`
  }

  
export const getProducts = async (KV: KVNamespace): Promise<Product[]> => {
    const list = await KV.list({ prefix: PREFIX })
    const keys = list.keys
    const posts: Product[] = []
  
    const len = keys.length
    for (let i = 0; i < len; i++) {
      const value = await KV.get(keys[i].name)
      if (value) {
        const post: Product = JSON.parse(value)
        posts.push(post)
      }
    }
  
    return posts
  }
  
  export const getProduct = async (KV: KVNamespace, id: string): Promise<Product | undefined> => {
    const value = await KV.get(generateID(id))
    if (!value) return
    const post: Product = JSON.parse(value)
    return post
  }
  
  export const createProduct = async (KV: KVNamespace, param: Param): Promise<Product | undefined> => {
    if (!(param && param.name && param.options)) return
    const id = crypto.randomUUID()
    const newPost: Product = { id: id, name: param.name, options: param.options }
    await KV.put(generateID(id), JSON.stringify(newPost))
    return newPost
  }
  
  export const updateProduct = async (KV: KVNamespace, id: string, param: Param): Promise<boolean> => {
    if (!(param && param.name && param.options)) return false
    const post = await getProduct(KV, id)
    if (!post) return false
    post.name = param.name
    post.options = param.options
    await KV.put(generateID(id), JSON.stringify(post))
    return true
  }
  
  export const deletePost = async (KV: KVNamespace, id: string): Promise<boolean> => {
    const post = await getProduct(KV, id)
    if (!post) return false
    await KV.delete(generateID(id))
    return true
  }
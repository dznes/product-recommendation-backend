import { Product } from './product'

export interface Category {
  id: string
  title: string
  description: string
  slug: string
  products: Product[]
}

import { Order } from './orders'
import { Tag } from './tag'
import { User } from './user'

export type Address = {
  id: string
  street: string
  status: number
  type: string
  country: string
  state: string
  city: string
  zip_code: string
  neighborhood: string
  number: number
  created_at: Date
  updated_at: Date
  complement: string
  user: User
  orders: Order[]
  tags: Tag[]
}

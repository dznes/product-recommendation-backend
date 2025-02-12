import { Order } from './orders'

export interface Telephone {
  id: string
  status: 200 | 400 | 1
  ddd_code: string
  number: string
  created_at: string
  updated_at: string
  user_id: string
  orders: Order[]
}

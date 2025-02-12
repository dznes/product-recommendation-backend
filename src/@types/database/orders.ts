import { Address } from './addresses'
import { OrderInvoice } from './order-invoces'
import { OrderItem } from './order-items'
import { Transaction } from './transactions'
import { User } from './user'

export interface Order {
  id: string
  code: string
  status: number
  type: number
  items_quantity: number
  total_items: number
  discount_value: number
  total_value: number
  created_at: Date
  updated_at?: Date
  utm_campaign?: string
  utm_source?: string
  utm_medium?: string
  utm_content?: string
  utm_term?: string
  fiscal_code?: string
  gateway_id?: string
  arrival_date?: string
  order_vtex_id?: string
  totvs_branch_code?: number
  totvs_creation_date?: Date
  representative_code?: string
  representative_name?: string
  operation_code?: string
  operation_name?: string
  payment_condition_code?: string
  payment_condition_name?: string
  freight_type?: number
  freight_value?: number
  shipping_company_code?: string
  shipping_company_cnpj?: string
  shipping_company_name?: string
  shipping_service_code?: string
  shipping_service_name?: string
  totvs_order_status?: string
  user: User
  user_id: string
  user_code: string
  order_items: OrderItem[]
  shipping_address?: Address
  order_invoices: OrderInvoice[]
  transactions: Transaction[]
}

export interface OrderInvoice {
  id: number
  product_code: string
  product_name: string
  product_reference_code: string
  product_reference_name: string
  product_sku_code: string
  color_code: string
  color_name: string
  size_name: string
  created_at: Date
  updated_at?: Date
  to_settle_quantity?: number
  settled_quantity?: number
  canceled_quantity?: number
  extra_quantity?: number
  pending_quantity?: number
  original_price?: number
  price?: number
  discount_percentage?: number
  totvs_created_at?: Date
  totvs_updated_at?: Date

  order_id: string
  order_code: string
}

export type ProductImage = {
  id: number
  title: string
  file_key: string
  slug?: string
  content_type: string
  position?: number
  created_at: Date
  updated_at?: Date
  product_id?: number
  sku_id: number
}

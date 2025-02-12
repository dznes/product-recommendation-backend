import { Color } from './colors'
import { ProductImage } from './product-image'
import { Size } from './sizes'
import { SkuBalance } from './sku-balance'
import { Tag } from './tag'
import { Variation } from './variation'

export type Sku = {
  id: number
  code: string
  status: 200 | 400 | 1
  title: string
  ncm: string
  mpn?: string
  ean?: string
  slug: string
  created_at: Date
  price_wholesale: string
  price_retail?: string
  cost?: string
  discount_percentage?: number
  reference_id?: string
  reference_name?: string
  integration_code?: string
  quantity_op?: number
  updated_at?: Date
  product_id: number
  stock_available: number
  product_images?: ProductImage[]
  sku_balances?: SkuBalance[]
  variations?: Variation[]
  colorId?: number
  color_code: string
  sizeId?: number
  size_code: string
  tags?: Tag[]
  color: Color
  size: Size
}

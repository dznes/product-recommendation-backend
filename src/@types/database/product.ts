import { Category } from './categories'
import { Color } from './colors'
import { Size } from './sizes'
import { Sku } from './sku'

export interface Product {
  id: number
  status: 200 | 400 | 1
  code: string
  title: string
  weight: number
  mpn: string
  description: string
  slug: string
  created_at: Date
  price_wholesale: number
  price_retail: number
  cost: number
  package_weight: number | null
  package_height: number | null
  package_length: number | null
  package_width: number | null
  ean: number
  updated_at: Date | null
  discount_percentage: null
  reference_id: string
  reference_name: string
  integration_code: string
  skus: Sku[]
  sizes: Size[]
  colors: Color[]
  categories?: Category[]
}

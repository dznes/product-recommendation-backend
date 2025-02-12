export type Size = {
  id: string
  code: string
  status: 200 | 400 | 1
  title: string
  variation_type: number
  created_at: Date
  updated_at: Date | null
}

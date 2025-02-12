export type Color = {
  id: string
  code: string
  status: 200 | 400 | 1
  title: string
  variation_type: number
  created_at: Date
  background_color: string
  image_tags: string | null
  image_url: string | null
  image_text: string | null
  image_label: string | null
  updated_at: Date | null
}

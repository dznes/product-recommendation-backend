export interface Transaction {
  id: string
  status: string
  created_at: Date
  updated_at?: Date
  approved_date?: Date
  cancellation_date?: Date
  currency: string
  total_value: number
  installments: number
  installment_values: number
  gateway_name: string
  gateway_transaction_id?: string
  gateway_authorization_code?: string
  user_gateway_id: string
  user_gateway_score?: string
  user_gateway_card_id?: string
  payment_type: string
  payment_name: string
  payment_link: string
  payment_card_nsu?: string
  payment_card_brand?: string

  order_id: string
}

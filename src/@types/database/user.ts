import { Address } from './addresses'
import { Telephone } from './telephone'

export type User = {
  id: string
  code: string
  status: number
  email: string
  name: string
  first_name: string
  last_name: string
  cpf: string
  cnpj: string
  document_code: string
  document_type: string
  gender: string
  birth_date: string
  newsletter: number
  created_at: string
  updated_at?: string | null
  role: string
  token: string
  addresses: Address[]
  phones: Telephone[]
}

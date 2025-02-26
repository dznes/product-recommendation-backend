import { Order } from '@/@types/database/orders'
import { Product } from '@/@types/database/product'
import { env } from '@/env'

const externalDatabaseUrl = env.EXTERNAL_DATABASE_URL


export function databaseApi(path: string, init?: RequestInit) {
  const baseUrl = env.EXTERNAL_DATABASE_URL
  const apiPrefix = '/api'
  const url = new URL(apiPrefix.concat(path), baseUrl)

  return fetch(url, init)
}


interface getUserProps {
  bearer: string | null
  params: {
    slug: string
  }
}

export async function getUser({ bearer }: getUserProps) {
  const { user } = await databaseApi('/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`,
    }
  }).then((res) => res.json())
  return user
}

interface ProductProps {
  product: Product
}

export async function getProduct(slug: string): Promise<ProductProps> {
  const response = await databaseApi(`/products/${slug}`)

  const product = await response.json()

  return product
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { products } = await fetch(
      `${externalDatabaseUrl}/products/search-with-image-and-stock?q=&page=1&perPage=50`).then((res) => res.json())

    return products
  } catch (error) {
    return []
  }
}

interface ApiProductsResponse {
  products: Product[]
}

export async function getProductsFromCategory(
  categorySlug: string,
): Promise<ApiProductsResponse> {
  try {
    const { products } = await databaseApi(
      `/category/${categorySlug}?q=&page=1&perPage=20`).then((res) => res.json())

    return { products }
  } catch (error) {
    return { products: [] }
  }
}

export async function getProductsFromClassification(
  classificationSlug: string,
): Promise<ApiProductsResponse> {
  try {
    const { products } = await databaseApi(
      `/classification/${classificationSlug}?q=&page=1&perPage=20`).then((res) => res.json())

    return { products }
  } catch (error) {
    return { products: [] }
  }
}

interface GetFeaturedProductsRequest {
  q: string
  page: number
  perPage: number
}

interface GetFeaturedProductsResponse {
  products: Product[]
  count: number
}

export async function getFeaturedProducts({
  q,
  page,
  perPage,
}: GetFeaturedProductsRequest): Promise<GetFeaturedProductsResponse> {
  try {
    const response = await databaseApi(
      `/products/search-with-image-and-stock?q=${q}&page=${page}&perPage=${perPage}`)

    const { products, count } = await response.json()

    return { products, count }
  } catch (error) {
    return { products: [], count: 0 }
  }
}

interface GetOrderResponse {
  order: Order
}

export async function getOrder(id: string): Promise<GetOrderResponse> {
  const response = await databaseApi(`/orders/${id}`)

  const order = await response.json()

  return order
}

export async function getOrders(
  userId: string | undefined | null,
): Promise<Order[] | null> {
  // const cookieStore = cookies()

  // const token = cookieStore.get(REFRESH_TOKEN)

  try {
    const { orders } = await databaseApi(`/orders/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())

    return orders
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return null // or you can throw the error depending on your needs
  }
}
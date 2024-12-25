// Cart

import { CartItemToAdd } from '@/app/api/cart/add/route'

// [GET]
export const getCartApi = async () => {
  // no cache
  const res = await fetch('/api/cart', { next: { revalidate: 60 } })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]
export const updateProductsInLocalCartApi = async (ids: string[]) => {
  const res = await fetch('/api/cart/update-local-cart', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]
export const addToCartApi = async (products: CartItemToAdd[]) => {
  const res = await fetch('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify({ products }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PATCH]
export const updateCartQuantityApi = async (cartItemId: string, quantity: number) => {
  const res = await fetch(`/api/cart/${cartItemId}/set-quantity`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]
export const deleteCartItemApi = async (cartItemId: string) => {
  const res = await fetch(`/api/cart/${cartItemId}/delete`, {
    method: 'DELETE',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// Page
export * from './pageRequest'

// Auth
export * from './authRequest'

// Product
export * from './productRequest'

// Category
export * from './categoryRequest'

// Tag
export * from './tagRequest'

// Account
export * from './accountRequest'

// Order
export * from './orderRequest'

// User
export * from './userRequest'

// Voucher
export * from './voucherRequest'

// Flash Sale
export * from './flashSaleRequest'

// Cart
export * from './cartRequest'

// Comment
export * from './commentRequest'

// Reviews
export * from './reviewRequest'

// Admin
export * from './adminRequest'

export const getTrendingMovies = async (params: any) => {
  const url = `https://api.themoviedb.org/3/movie/popular?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&${new URLSearchParams(params)}`
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message)
  }
  return response.json()
}

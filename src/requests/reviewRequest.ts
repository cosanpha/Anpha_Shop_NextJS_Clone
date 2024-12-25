// Review -------------------------------------

type ReviewForm = {
  rating: number
  content: string
}

// [GET]: /review/:productId
export const getAllProductReviewsApi = async (
  productId: string,
  query: string = '',
  option: RequestInit = { cache: 'no-store' }
) => {
  const res = await fetch(`/api/review/${productId}${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /admin/review/:productId
export const getForceAllProductReviewsApi = async (
  productId: string,
  query: string = '',
  option: RequestInit = { cache: 'no-store' }
) => {
  const res = await fetch(`/api/admin/review/${productId}${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [GET]: /review/:productId/check-user-reviewed
export const checkUserReviewedApi = async (
  productId: string,
  query: string = '',
  option: RequestInit = { cache: 'no-store' }
) => {
  const res = await fetch(`/api/review/${productId}/check-user-reviewed${query}`, option)

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /review/:productId/add
export const addReviewApi = async (productId: string, review: ReviewForm) => {
  const res = await fetch(`/api/review/${productId}/add`, {
    method: 'POST',
    body: JSON.stringify(review),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [POST]: /admin/review/:productId/add
export const addFakeReviewApi = async (
  productId: string,
  review: {
    image: string
    displayName: string
    rating: number
    content: string
    reviewDate: Date
    status: 'show' | 'hide' | 'pinned'
  }
) => {
  const res = await fetch(`/api/admin/review/${productId}/add`, {
    method: 'POST',
    body: JSON.stringify(review),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /review/:productId/:reviewId/edit
export const editReviewApi = async (productId: string, reviewId: string, review: ReviewForm) => {
  const res = await fetch(`/api/review/${productId}/${reviewId}/edit`, {
    method: 'PUT',
    body: JSON.stringify(review),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PUT]: /admin/review/:productId/:reviewId/edit
export const editForceReviewApi = async (
  productId: string,
  reviewId: string,
  review: { image: string; displayName: string; rating: number; content: string; reviewDate: Date }
) => {
  const res = await fetch(`/api/admin/review/${productId}/${reviewId}/edit`, {
    method: 'PUT',
    body: JSON.stringify(review),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PATCH]: /admin/review/change-status
export const changeReviewStatusApi = async (ids: string[], status: 'show' | 'hide' | 'pinned') => {
  const res = await fetch(`/api/admin/review/change-status`, {
    method: 'PATCH',
    body: JSON.stringify({ ids, status }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [PATCH]: /admin/review/:productId
export const syncProductReviewsApi = async (productId: string) => {
  const res = await fetch(`/api/admin/review/${productId}/sync`, {
    method: 'PATCH',
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

// [DELETE]: /review/delete
export const deleteReviewsApi = async (productId: string, ids: string[]) => {
  const res = await fetch(`/api/review/${productId}/delete`, {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  })

  // check status
  if (!res.ok) {
    throw new Error((await res.json()).message)
  }

  return await res.json()
}

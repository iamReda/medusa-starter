import { sdk } from "./sdk"

export type ReviewStatus = "pending" | "approved" | "flagged"

export type AdminProductReview = {
  id: string
  status: ReviewStatus
  product_id: string | null
  order_id: string | null
  rating: number
  name: string | null
  email: string | null
  content: string | null
  created_at: string
  updated_at: string
  images: { id?: string; url: string }[]
  response: {
    id: string
    content: string
    created_at: string
    updated_at: string
  } | null
  product?: {
    id: string
    title: string
    thumbnail?: string | null
    handle?: string | null
  } | null
  order?: {
    id: string
    display_id?: number | null
  } | null
}

export type ListAdminProductReviewsQuery = {
  q?: string
  status?: ReviewStatus | ReviewStatus[]
  product_id?: string | string[]
  order_id?: string | string[]
  rating?: number | number[]
  limit?: number
  offset?: number
  order?: string
}

export type ListAdminProductReviewsResponse = {
  product_reviews: AdminProductReview[]
  count: number
  offset?: number
  limit?: number
}

export const REVIEW_STATUSES: ReviewStatus[] = [
  "pending",
  "approved",
  "flagged",
]

export const listAdminProductReviews = async (
  query: ListAdminProductReviewsQuery = {}
) => {
  return sdk.client.fetch<ListAdminProductReviewsResponse>(
    "/admin/product-reviews",
    {
      method: "GET",
      query,
    }
  )
}

export const updateAdminProductReviewStatus = async (
  reviewId: string,
  status: ReviewStatus
) => {
  return sdk.client.fetch<{ product_review: AdminProductReview }>(
    `/admin/product-reviews/${reviewId}/status`,
    {
      method: "PUT",
      body: { status },
    }
  )
}

export const createAdminProductReviewResponse = async (
  reviewId: string,
  content: string
) => {
  return sdk.client.fetch(`/admin/product-reviews/${reviewId}/response`, {
    method: "POST",
    body: { content },
  })
}

export const updateAdminProductReviewResponse = async (
  reviewId: string,
  content: string
) => {
  return sdk.client.fetch(`/admin/product-reviews/${reviewId}/response`, {
    method: "PUT",
    body: { content },
  })
}

export const deleteAdminProductReviewResponse = async (reviewId: string) => {
  return sdk.client.fetch(`/admin/product-reviews/${reviewId}/response`, {
    method: "DELETE",
  })
}

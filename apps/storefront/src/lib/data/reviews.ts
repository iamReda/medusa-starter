"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions, getCacheTag } from "./cookies"
import { revalidateTag } from "next/cache"

export type ProductReviewImage = {
  id?: string
  url: string
}

export type ProductReviewResponse = {
  id: string
  content: string
  created_at: string
  updated_at: string
}

export type ProductReview = {
  id: string
  status: "pending" | "approved" | "flagged"
  product_id: string
  name: string | null
  rating: number
  content: string
  order_id?: string
  order_line_item_id?: string
  created_at: string
  updated_at: string
  response: ProductReviewResponse | null
  images: ProductReviewImage[]
}

export type ProductReviewStats = {
  id: string
  product_id: string
  average_rating: number
  review_count: number
  rating_count_1: number
  rating_count_2: number
  rating_count_3: number
  rating_count_4: number
  rating_count_5: number
  created_at: string
  updated_at: string
}

export type ListProductReviewsParams = {
  product_id?: string | string[]
  order_id?: string | string[]
  status?: "pending" | "approved" | "flagged" | Array<"pending" | "approved" | "flagged">
  rating?: number | number[]
  limit?: number
  offset?: number
  order?: string
}

export type UpsertProductReviewInput = {
  order_id: string
  order_line_item_id: string
  rating: number
  content: string
  images?: ProductReviewImage[]
}

const getReviewsCacheConfig = async () => {
  const scoped = await getCacheOptions("reviews")
  const tags = Array.isArray(scoped.tags) ? scoped.tags : []

  // Always tag with a stable key so approvals/updates can invalidate storefront
  // data even when the cookie-scoped cache id is missing.
  return {
    tags: Array.from(new Set(["reviews", ...tags])),
    // Moderated reviews change from Admin; avoid serving a stale empty page.
    revalidate: 30,
  }
}

export const listProductReviews = async (
  query: ListProductReviewsParams = {}
): Promise<{
  product_reviews: ProductReview[]
  count: number
  offset: number
  limit: number
}> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{
      product_reviews: ProductReview[]
      count: number
      offset: number
      limit: number
    }>("/store/product-reviews", {
      method: "GET",
      query: {
        limit: 50,
        offset: 0,
        order: "-created_at",
        status: "approved",
        ...query,
      },
      headers,
      next: await getReviewsCacheConfig(),
    })
    .catch((err) => medusaError(err))
}

export const getProductReviewStats = async (
  productId: string
): Promise<ProductReviewStats | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const { product_review_stats } = await sdk.client
    .fetch<{
      product_review_stats: ProductReviewStats[]
      count: number
    }>("/store/product-review-stats", {
      method: "GET",
      query: {
        product_id: productId,
        limit: 1,
      },
      headers,
      next: await getReviewsCacheConfig(),
    })
    .catch((err) => medusaError(err))

  return product_review_stats?.[0] ?? null
}

export const createProductReview = async (
  _prevState: {
    success: boolean
    error: string | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
}> => {
  const orderId = formData.get("order_id") as string
  const orderLineItemId = formData.get("order_line_item_id") as string
  const rating = Number(formData.get("rating"))
  const content = (formData.get("content") as string)?.trim()

  if (!orderId || !orderLineItemId) {
    return { success: false, error: "Missing order information." }
  }

  if (!rating || rating < 1 || rating > 5) {
    return { success: false, error: "Please select a rating from 1 to 5." }
  }

  if (!content || content.length < 10) {
    return {
      success: false,
      error: "Please write at least 10 characters for your review.",
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  try {
    await sdk.client.fetch("/store/product-reviews", {
      method: "POST",
      headers,
      body: {
        reviews: [
          {
            order_id: orderId,
            order_line_item_id: orderLineItemId,
            rating,
            content,
            images: [],
          },
        ],
      },
    })

    revalidateTag("reviews")
    const reviewsCacheTag = await getCacheTag("reviews")
    if (reviewsCacheTag) {
      revalidateTag(reviewsCacheTag)
    }

    return { success: true, error: null }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to submit review."
    return { success: false, error: message }
  }
}

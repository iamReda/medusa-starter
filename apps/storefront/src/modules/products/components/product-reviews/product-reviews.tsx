"use client"

import { useMemo, useState } from "react"
import {
  ProductReview,
  ProductReviewStats,
} from "@lib/data/reviews"
import { Heading, Text, clx } from "@modules/common/components/ui"
import RatingStars from "./rating-stars"

type ProductReviewsProps = {
  productId: string
  reviews: ProductReview[]
  stats: ProductReviewStats | null
}

type SortOption = "recent" | "highest" | "lowest"

const ProductReviews = ({ reviews, stats }: ProductReviewsProps) => {
  const [sort, setSort] = useState<SortOption>("recent")
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    if (stats) {
      counts[4] = stats.rating_count_5
      counts[3] = stats.rating_count_4
      counts[2] = stats.rating_count_3
      counts[1] = stats.rating_count_2
      counts[0] = stats.rating_count_1
    }
    return counts
  }, [stats])

  const totalCount = stats?.review_count ?? reviews.length
  const average = stats?.average_rating ?? 0

  const filteredReviews = useMemo(() => {
    let next = [...reviews]

    if (ratingFilter) {
      next = next.filter((review) => review.rating === ratingFilter)
    }

    next.sort((a, b) => {
      if (sort === "highest") {
        return b.rating - a.rating
      }
      if (sort === "lowest") {
        return a.rating - b.rating
      }
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    })

    return next
  }, [reviews, ratingFilter, sort])

  if (!totalCount) {
    return (
      <div
        className="content-container py-12 border-t border-ui-border-base"
        id="reviews"
        data-testid="product-reviews-empty"
      >
        <Heading level="h2" className="text-xl-semi mb-2">
          Customer reviews
        </Heading>
        <Text className="text-ui-fg-subtle">
          No reviews yet. Purchase this product to leave the first review from
          your order page.
        </Text>
      </div>
    )
  }

  return (
    <div
      className="content-container py-12 border-t border-ui-border-base"
      id="reviews"
      data-testid="product-reviews"
    >
      <div className="flex flex-col small:flex-row gap-10 small:gap-16">
        <div className="small:w-72 shrink-0 flex flex-col gap-y-4">
          <Heading level="h2" className="text-xl-semi">
            Customer reviews
          </Heading>
          <div className="flex items-center gap-x-3">
            <span className="text-3xl-semi text-ui-fg-base">
              {average.toFixed(1)}
            </span>
            <div>
              <RatingStars rating={average} size={18} />
              <Text className="text-small-regular text-ui-fg-subtle mt-1">
                Based on {totalCount} review{totalCount === 1 ? "" : "s"}
              </Text>
            </div>
          </div>

          <div className="flex flex-col gap-y-2 mt-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars - 1]
              const percent = totalCount ? Math.round((count / totalCount) * 100) : 0
              const isActive = ratingFilter === stars

              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() =>
                    setRatingFilter((current) =>
                      current === stars ? null : stars
                    )
                  }
                  className={clx(
                    "flex items-center gap-x-2 text-left min-h-11",
                    isActive && "opacity-100",
                    !isActive && ratingFilter !== null && "opacity-50"
                  )}
                  aria-pressed={isActive}
                  aria-label={`Filter ${stars} star reviews`}
                >
                  <span className="w-8 text-small-regular text-ui-fg-subtle">
                    {stars} ★
                  </span>
                  <span className="flex-1 h-2 rounded-full bg-grey-10 overflow-hidden">
                    <span
                      className="block h-full bg-grey-50 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-small-regular text-ui-fg-muted">
                    {count}
                  </span>
                </button>
              )
            })}
            {ratingFilter !== null && (
              <button
                type="button"
                className="text-small-regular text-ui-fg-interactive underline self-start mt-1"
                onClick={() => setRatingFilter(null)}
              >
                Show all ratings
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-y-6">
          <div className="flex flex-col xsmall:flex-row xsmall:items-center justify-between gap-3">
            <Text className="text-small-regular text-ui-fg-subtle">
              Showing {filteredReviews.length} of {totalCount} reviews
            </Text>
            <label className="flex items-center gap-x-2 text-small-regular">
              <span className="text-ui-fg-subtle">Sort by</span>
              <select
                className="border border-ui-border-base rounded-rounded px-2 py-2 bg-white text-ui-fg-base min-h-11"
                value={sort}
                onChange={(event) => setSort(event.target.value as SortOption)}
                aria-label="Sort reviews"
              >
                <option value="recent">Most recent</option>
                <option value="highest">Highest rating</option>
                <option value="lowest">Lowest rating</option>
              </select>
            </label>
          </div>

          <ul className="flex flex-col gap-y-6">
            {filteredReviews.map((review) => (
              <li
                key={review.id}
                className="border-b border-ui-border-base pb-6 last:border-b-0"
                data-testid="product-review-item"
              >
                <div className="flex flex-col gap-y-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <RatingStars rating={review.rating} size={14} />
                    <Text className="txt-compact-medium-plus text-ui-fg-base">
                      {formatReviewerName(review.name)}
                    </Text>
                    <span className="text-small-regular text-ui-fg-muted">
                      Verified purchase
                    </span>
                  </div>
                  <Text className="text-small-regular text-ui-fg-muted">
                    {formatReviewDate(review.created_at)}
                  </Text>
                  <Text className="text-base-regular text-ui-fg-base whitespace-pre-line">
                    {review.content}
                  </Text>
                  {review.response?.content && (
                    <div className="mt-3 ml-0 small:ml-4 border-l-2 border-grey-20 pl-4 py-2 bg-grey-5 rounded-r-rounded">
                      <Text className="text-small-regular text-ui-fg-subtle mb-1">
                        Store response
                      </Text>
                      <Text className="text-small-regular text-ui-fg-base whitespace-pre-line">
                        {review.response.content}
                      </Text>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {!filteredReviews.length && (
            <Text className="text-ui-fg-subtle">
              No reviews match this filter.
            </Text>
          )}
        </div>
      </div>
    </div>
  )
}

function formatReviewerName(name: string | null) {
  if (!name?.trim()) {
    return "Customer"
  }

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0]
  }

  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
}

function formatReviewDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default ProductReviews

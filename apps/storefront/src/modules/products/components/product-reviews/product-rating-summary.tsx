import { getProductReviewStats } from "@lib/data/reviews"
import RatingStars from "@modules/products/components/product-reviews/rating-stars"
import { Text } from "@modules/common/components/ui"

type ProductRatingSummaryProps = {
  productId: string
}

export default async function ProductRatingSummary({
  productId,
}: ProductRatingSummaryProps) {
  const stats = await getProductReviewStats(productId)

  if (!stats?.review_count) {
    return (
      <a
        href="#reviews"
        className="text-small-regular text-ui-fg-subtle hover:text-ui-fg-base underline-offset-4 hover:underline"
      >
        Be the first to review
      </a>
    )
  }

  return (
    <a
      href="#reviews"
      className="inline-flex items-center gap-x-2 group"
      aria-label={`${stats.average_rating.toFixed(1)} out of 5 from ${stats.review_count} reviews`}
    >
      <RatingStars rating={stats.average_rating} size={14} />
      <Text className="text-small-regular text-ui-fg-subtle group-hover:text-ui-fg-base">
        {stats.average_rating.toFixed(1)} ({stats.review_count})
      </Text>
    </a>
  )
}

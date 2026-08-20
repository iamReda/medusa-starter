import { ProductReviewStats } from "@lib/data/reviews"
import { HttpTypes } from "@medusajs/types"

type ProductReviewsJsonLdProps = {
  product: HttpTypes.StoreProduct
  stats: ProductReviewStats | null
}

export default function ProductReviewsJsonLd({
  product,
  stats,
}: ProductReviewsJsonLdProps) {
  if (!stats?.review_count || !product.title) {
    return null
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.thumbnail ?? undefined,
    sku: product.id,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: stats.average_rating,
      reviewCount: stats.review_count,
      bestRating: 5,
      worstRating: 1,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

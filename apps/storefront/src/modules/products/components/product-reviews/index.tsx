import {
  getProductReviewStats,
  listProductReviews,
} from "@lib/data/reviews"
import { HttpTypes } from "@medusajs/types"
import ProductReviews from "./product-reviews"
import ProductReviewsJsonLd from "./product-reviews-json-ld"

type ProductReviewsSectionProps = {
  product: HttpTypes.StoreProduct
}

export default async function ProductReviewsSection({
  product,
}: ProductReviewsSectionProps) {
  if (!product.id) {
    return null
  }

  const [{ product_reviews }, stats] = await Promise.all([
    listProductReviews({
      product_id: product.id,
      status: "approved",
      limit: 50,
    }),
    getProductReviewStats(product.id),
  ])

  return (
    <>
      <ProductReviewsJsonLd product={product} stats={stats} />
      <ProductReviews
        productId={product.id}
        reviews={product_reviews}
        stats={stats}
      />
    </>
  )
}

import { listProductReviews } from "@lib/data/reviews"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import Thumbnail from "@modules/products/components/thumbnail"
import ReviewForm from "@modules/order/components/review-form"

type OrderReviewSectionProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderReviewSection({
  order,
}: OrderReviewSectionProps) {
  const items = order.items ?? []

  if (!items.length) {
    return null
  }

  const { product_reviews } = await listProductReviews({
    order_id: order.id,
    status: ["pending", "approved", "flagged"],
    limit: 100,
  })

  const reviewedProductIds = new Set(
    product_reviews.map((review) => review.product_id).filter(Boolean)
  )

  return (
    <div
      className="flex flex-col gap-y-4 border-t border-ui-border-base pt-6"
      data-testid="order-review-section"
    >
      <div>
        <Heading level="h2" className="text-xl-semi">
          Review your purchase
        </Heading>
        <Text className="text-small-regular text-ui-fg-subtle mt-1">
          Reviews help other customers and appear on the product page after
          approval.
        </Text>
      </div>

      <ul className="flex flex-col gap-y-6">
        {items.map((item) => {
          if (!item.id) {
            return null
          }

          const alreadyReviewed = item.product_id
            ? reviewedProductIds.has(item.product_id)
            : false

          return (
            <li
              key={item.id}
              className="flex flex-col small:flex-row gap-4 small:items-start"
            >
              <div className="flex gap-x-3 flex-1 min-w-0">
                <div className="w-16 shrink-0">
                  <Thumbnail thumbnail={item.thumbnail} size="square" />
                </div>
                <div className="min-w-0">
                  <Text className="txt-medium-plus text-ui-fg-base truncate">
                    {item.product_title}
                  </Text>
                  {item.variant?.title && (
                    <Text className="text-small-regular text-ui-fg-muted">
                      {item.variant.title}
                    </Text>
                  )}
                </div>
              </div>
              <div className="small:max-w-md w-full">
                <ReviewForm
                  orderId={order.id}
                  orderLineItemId={item.id}
                  productTitle={item.product_title || "this product"}
                  alreadyReviewed={alreadyReviewed}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

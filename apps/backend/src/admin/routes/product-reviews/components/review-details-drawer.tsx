import { Button, Drawer, Text } from "@medusajs/ui"
import { type ReactNode } from "react"
import { Link } from "react-router-dom"
import { AdminProductReview } from "../../../lib/reviews"
import { ReviewStars } from "./review-stars"

type ReviewDetailsDrawerProps = {
  review: AdminProductReview | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const Row = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => {
  return (
    <div className="text-ui-fg-subtle grid grid-cols-2 items-start gap-4 px-6 py-4">
      <Text size="small" weight="plus" leading="compact">
        {label}
      </Text>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export const ReviewDetailsDrawer = ({
  review,
  open,
  onOpenChange,
}: ReviewDetailsDrawerProps) => {
  if (!review) {
    return null
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Review details</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col divide-y p-0">
          <Row label="Customer">
            <div className="flex flex-col gap-1">
              <Text size="small" leading="compact">
                {review.name || "Customer"}
              </Text>
              {review.email && (
                <Text size="small" leading="compact" className="text-ui-fg-muted">
                  {review.email}
                </Text>
              )}
            </div>
          </Row>
          <Row label="Status">
            <Text size="small" leading="compact" className="capitalize">
              {review.status}
            </Text>
          </Row>
          <Row label="Created">
            <Text size="small" leading="compact">
              {new Date(review.created_at).toLocaleString()}
            </Text>
          </Row>
          <Row label="Product">
            {review.product?.id ? (
              <Link to={`/products/${review.product.id}`} className="hover:underline">
                <div className="flex items-center gap-3">
                  {review.product.thumbnail ? (
                    <img
                      src={review.product.thumbnail}
                      alt={review.product.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="bg-ui-bg-component h-10 w-10 rounded-md" />
                  )}
                  <Text size="small" leading="compact">
                    {review.product.title}
                  </Text>
                </div>
              </Link>
            ) : (
              <Text size="small" leading="compact">
                -
              </Text>
            )}
          </Row>
          <Row label="Order">
            {review.order?.id ? (
              <Link to={`/orders/${review.order.id}`} className="hover:underline">
                <Text size="small" leading="compact">
                  #{review.order.display_id ?? review.order.id}
                </Text>
              </Link>
            ) : (
              <Text size="small" leading="compact">
                -
              </Text>
            )}
          </Row>
          <Row label="Rating">
            <ReviewStars rating={review.rating} />
          </Row>
          <Row label="Review">
            <Text size="small" leading="compact" className="whitespace-pre-wrap">
              {review.content || "-"}
            </Text>
          </Row>
          {!!review.images?.length && (
            <Row label="Images">
              <div className="grid grid-cols-3 gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={image.id || image.url || index}
                    src={image.url}
                    alt={`Review image ${index + 1}`}
                    className="h-20 w-full rounded-md object-cover"
                  />
                ))}
              </div>
            </Row>
          )}
          <Row label="Response">
            <Text size="small" leading="compact" className="whitespace-pre-wrap">
              {review.response?.content || "No response"}
            </Text>
          </Row>
          {review.response?.created_at && (
            <Row label="Responded">
              <Text size="small" leading="compact">
                {new Date(review.response.created_at).toLocaleString()}
              </Text>
            </Row>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              Close
            </Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

"use client"

import { createProductReview } from "@lib/data/reviews"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"
import Star from "@modules/common/icons/star"
import { useActionState, useEffect, useState } from "react"

type ReviewFormProps = {
  orderId: string
  orderLineItemId: string
  productTitle: string
  alreadyReviewed?: boolean
}

const initialState = {
  success: false,
  error: null as string | null,
}

const ReviewForm = ({
  orderId,
  orderLineItemId,
  productTitle,
  alreadyReviewed = false,
}: ReviewFormProps) => {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [state, formAction, isPending] = useActionState(
    createProductReview,
    initialState
  )

  useEffect(() => {
    if (state.success) {
      setOpen(false)
      setRating(0)
    }
  }, [state.success])

  if (alreadyReviewed || state.success) {
    return (
      <Text
        className="text-small-regular text-ui-fg-subtle"
        data-testid="review-submitted"
      >
        {state.success
          ? "Thanks! Your review was submitted and is pending approval."
          : "You already reviewed this item."}
      </Text>
    )
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="medium"
        className="min-h-11"
        onClick={() => setOpen(true)}
        data-testid="write-review-button"
      >
        Write a review
      </Button>
    )
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-y-3 border border-ui-border-base rounded-rounded p-4 bg-grey-5 w-full max-w-md"
      data-testid="review-form"
    >
      <Heading level="h3" className="text-base-semi">
        Review {productTitle}
      </Heading>

      <input type="hidden" name="order_id" value={orderId} />
      <input type="hidden" name="order_line_item_id" value={orderLineItemId} />
      <input type="hidden" name="rating" value={rating || ""} />

      <div>
        <Text className="text-small-regular text-ui-fg-subtle mb-2">
          Your rating
        </Text>
        <div
          className="flex items-center gap-x-1"
          role="radiogroup"
          aria-label="Rating"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const active = (hoverRating || rating) >= value
            return (
              <button
                key={value}
                type="button"
                className="min-h-11 min-w-11 flex items-center justify-center"
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(value)}
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                aria-checked={rating === value}
                role="radio"
              >
                <Star
                  size="20"
                  color={active ? "#111111" : "#D4D4D8"}
                  filled={active}
                />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor={`review-content-${orderLineItemId}`}
          className="text-small-regular text-ui-fg-subtle"
        >
          Your review
        </label>
        <textarea
          id={`review-content-${orderLineItemId}`}
          name="content"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder="What did you like or dislike?"
          className={clx(
            "mt-1 w-full rounded-rounded border border-ui-border-base px-3 py-2",
            "text-base-regular text-ui-fg-base bg-white resize-y min-h-[96px]"
          )}
          data-testid="review-content-input"
        />
      </div>

      {state.error && (
        <Text className="text-small-regular text-rose-500" role="alert">
          {state.error}
        </Text>
      )}

      <div className="flex items-center gap-x-2">
        <Button
          type="submit"
          size="small"
          disabled={isPending || rating < 1}
          isLoading={isPending}
          data-testid="submit-review-button"
        >
          Submit review
        </Button>
        <Button
          type="button"
          variant="transparent"
          size="small"
          onClick={() => setOpen(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default ReviewForm

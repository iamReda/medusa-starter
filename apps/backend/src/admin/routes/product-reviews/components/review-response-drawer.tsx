import { Button, Drawer, Label, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import {
  AdminProductReview,
  createAdminProductReviewResponse,
  deleteAdminProductReviewResponse,
  updateAdminProductReviewResponse,
} from "../../../lib/reviews"

type ReviewResponseDrawerProps = {
  review: AdminProductReview | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ReviewResponseDrawer = ({
  review,
  open,
  onOpenChange,
}: ReviewResponseDrawerProps) => {
  const queryClient = useQueryClient()
  const [content, setContent] = useState("")

  useEffect(() => {
    setContent(review?.response?.content ?? "")
  }, [review])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-product-reviews"] })
  }

  const saveMutation = useMutation({
    mutationFn: async (value: string) => {
      if (!review) {
        return
      }
      if (review.response) {
        return updateAdminProductReviewResponse(review.id, value)
      }
      return createAdminProductReviewResponse(review.id, value)
    },
    onSuccess: () => {
      invalidate()
      toast.success(review?.response ? "Response updated" : "Response added")
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save response")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!review) {
        return
      }
      return deleteAdminProductReviewResponse(review.id)
    },
    onSuccess: () => {
      invalidate()
      toast.success("Response deleted")
      onOpenChange(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete response")
    },
  })

  if (!review) {
    return null
  }

  const isPending = saveMutation.isPending || deleteMutation.isPending
  const title = review.response ? "Edit response" : "Add response"

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{title}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-2">
            <Label weight="plus">Customer review</Label>
            <Text
              size="small"
              leading="compact"
              className="text-ui-fg-subtle whitespace-pre-wrap"
            >
              {review.content || "-"}
            </Text>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="review-response" weight="plus">
              Your response
            </Label>
            <Textarea
              id="review-response"
              rows={5}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write a response to this review..."
              disabled={isPending}
            />
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              {review.response && (
                <Button
                  size="small"
                  variant="danger"
                  onClick={() => deleteMutation.mutate()}
                  disabled={isPending}
                  isLoading={deleteMutation.isPending}
                >
                  Delete response
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Drawer.Close asChild>
                <Button size="small" variant="secondary" disabled={isPending}>
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                size="small"
                onClick={() => saveMutation.mutate(content.trim())}
                disabled={isPending || !content.trim()}
                isLoading={saveMutation.isPending}
              >
                Save
              </Button>
            </div>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

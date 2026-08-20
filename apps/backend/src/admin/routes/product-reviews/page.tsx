import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ChatBubble,
  CheckCircleSolid,
  EllipsisHorizontal,
  Eye,
  XCircleSolid,
} from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  DataTableRowSelectionState,
  DropdownMenu,
  Heading,
  IconButton,
  Select,
  StatusBadge,
  Text,
  toast,
  useDataTable,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  AdminProductReview,
  listAdminProductReviews,
  REVIEW_STATUSES,
  ReviewStatus,
  updateAdminProductReviewStatus,
} from "../../lib/reviews"
import { ReviewDetailsDrawer } from "./components/review-details-drawer"
import { ReviewResponseDrawer } from "./components/review-response-drawer"
import { ReviewStars } from "./components/review-stars"

const PAGE_SIZE = 20
const QUERY_KEY = ["admin-product-reviews"] as const

const columnHelper = createDataTableColumnHelper<AdminProductReview>()

const statusColor = (
  status: ReviewStatus
): "orange" | "green" | "red" | "grey" => {
  switch (status) {
    case "pending":
      return "orange"
    case "approved":
      return "green"
    case "flagged":
      return "red"
    default:
      return "grey"
  }
}

const ProductReviewsPage = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("all")
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all")
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>(
    {}
  )
  const [selectedForResponse, setSelectedForResponse] =
    useState<AdminProductReview | null>(null)
  const [selectedForDetails, setSelectedForDetails] =
    useState<AdminProductReview | null>(null)

  const limit = pagination.pageSize
  const offset = pagination.pageIndex * limit

  const queryParams = useMemo(
    () => ({
      q: search || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      rating: ratingFilter === "all" ? undefined : ratingFilter,
      limit,
      offset,
      order: "-created_at",
    }),
    [search, statusFilter, ratingFilter, limit, offset]
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...QUERY_KEY, queryParams],
    queryFn: () => listAdminProductReviews(queryParams),
  })

  const { data: pendingData } = useQuery({
    queryKey: [...QUERY_KEY, "count", "pending"],
    queryFn: () =>
      listAdminProductReviews({ status: "pending", limit: 1, offset: 0 }),
  })
  const { data: approvedData } = useQuery({
    queryKey: [...QUERY_KEY, "count", "approved"],
    queryFn: () =>
      listAdminProductReviews({ status: "approved", limit: 1, offset: 0 }),
  })
  const { data: flaggedData } = useQuery({
    queryKey: [...QUERY_KEY, "count", "flagged"],
    queryFn: () =>
      listAdminProductReviews({ status: "flagged", limit: 1, offset: 0 }),
  })
  const { data: allData } = useQuery({
    queryKey: [...QUERY_KEY, "count", "all"],
    queryFn: () => listAdminProductReviews({ limit: 1, offset: 0 }),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }

  const statusMutation = useMutation({
    mutationFn: async ({
      reviewId,
      status,
    }: {
      reviewId: string
      status: ReviewStatus
    }) => updateAdminProductReviewStatus(reviewId, status),
    onSuccess: (_data, variables) => {
      invalidate()
      toast.success(`Review marked as ${variables.status}`)
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status")
    },
  })

  const bulkStatusMutation = useMutation({
    mutationFn: async (status: ReviewStatus) => {
      const ids = Object.keys(rowSelection).filter((id) => rowSelection[id])
      await Promise.all(
        ids.map((reviewId) => updateAdminProductReviewStatus(reviewId, status))
      )
      return { count: ids.length, status }
    },
    onSuccess: (result) => {
      invalidate()
      setRowSelection({})
      toast.success(
        `Updated ${result.count} review${result.count === 1 ? "" : "s"} to ${result.status}`
      )
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update selected reviews")
    },
  })

  const selectedCount = Object.values(rowSelection).filter(Boolean).length

  const columns = useMemo(
    () => [
      columnHelper.select(),
      columnHelper.accessor("product", {
        header: "Product",
        cell: ({ row }) => {
          const product = row.original.product
          if (!product?.id) {
            return (
              <Text size="small" leading="compact" className="text-ui-fg-muted">
                -
              </Text>
            )
          }
          return (
            <Link
              to={`/products/${product.id}`}
              className="flex items-center gap-x-3 min-w-[180px] max-w-[260px]"
            >
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-8 w-8 rounded-md object-cover shrink-0"
                />
              ) : (
                <div className="bg-ui-bg-component h-8 w-8 rounded-md shrink-0" />
              )}
              <Text
                size="small"
                leading="compact"
                className="hover:underline line-clamp-2"
              >
                {product.title}
              </Text>
            </Link>
          )
        },
      }),
      columnHelper.accessor("order", {
        header: "Order",
        cell: ({ row }) => {
          const order = row.original.order
          if (!order?.id) {
            return (
              <Text size="small" leading="compact" className="text-ui-fg-muted">
                -
              </Text>
            )
          }
          return (
            <Link to={`/orders/${order.id}`} className="hover:underline">
              <Text size="small" leading="compact">
                #{order.display_id ?? order.id}
              </Text>
            </Link>
          )
        },
      }),
      columnHelper.accessor("name", {
        header: "Customer",
        cell: ({ getValue, row }) => (
          <div className="min-w-[120px] max-w-[180px]">
            <Text size="small" leading="compact" className="line-clamp-1">
              {getValue() || "Customer"}
            </Text>
            {row.original.email && (
              <Text
                size="small"
                leading="compact"
                className="text-ui-fg-muted line-clamp-1"
              >
                {row.original.email}
              </Text>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("content", {
        header: "Review",
        cell: ({ row }) => (
          <div className="flex flex-col gap-y-1 min-w-[200px] max-w-[320px] py-2">
            <ReviewStars rating={row.original.rating} />
            <Text
              size="small"
              leading="compact"
              className="text-ui-fg-subtle line-clamp-2 whitespace-pre-wrap"
            >
              {row.original.content || "-"}
            </Text>
          </div>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue()
          return (
            <StatusBadge color={statusColor(status)}>
              <span className="capitalize">{status}</span>
            </StatusBadge>
          )
        },
      }),
      columnHelper.accessor("response", {
        header: "Response",
        cell: ({ getValue }) => {
          const response = getValue()
          if (!response?.content) {
            return (
              <Text size="small" leading="compact" className="text-ui-fg-muted">
                No response
              </Text>
            )
          }
          return (
            <Text
              size="small"
              leading="compact"
              className="line-clamp-2 max-w-[220px]"
            >
              {response.content}
            </Text>
          )
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: ({ getValue }) => (
          <Text size="small" leading="compact" className="whitespace-nowrap">
            {new Date(getValue()).toLocaleString()}
          </Text>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const review = row.original
          return (
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <IconButton size="small" variant="transparent">
                  <EllipsisHorizontal />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setSelectedForDetails(review)}
                >
                  <Eye className="text-ui-fg-subtle" />
                  View details
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="gap-x-2"
                  onClick={() => setSelectedForResponse(review)}
                >
                  <ChatBubble className="text-ui-fg-subtle" />
                  {review.response ? "Edit response" : "Add response"}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                {REVIEW_STATUSES.filter((status) => status !== review.status).map(
                  (status) => (
                    <DropdownMenu.Item
                      key={status}
                      className="gap-x-2"
                      onClick={() =>
                        statusMutation.mutate({
                          reviewId: review.id,
                          status,
                        })
                      }
                      disabled={statusMutation.isPending}
                    >
                      {status === "approved" ? (
                        <CheckCircleSolid className="text-ui-fg-subtle" />
                      ) : status === "flagged" ? (
                        <XCircleSolid className="text-ui-fg-subtle" />
                      ) : (
                        <EllipsisHorizontal className="text-ui-fg-subtle" />
                      )}
                      Mark as {status}
                    </DropdownMenu.Item>
                  )
                )}
              </DropdownMenu.Content>
            </DropdownMenu>
          )
        },
      }),
    ],
    [statusMutation.isPending]
  )

  const table = useDataTable({
    columns,
    data: data?.product_reviews ?? [],
    getRowId: (review) => review.id,
    rowCount: data?.count ?? 0,
    isLoading,
    search: {
      state: search,
      onSearchChange: (value) => {
        setSearch(value)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      },
    },
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
  })

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex flex-col gap-y-1 px-1">
        <Heading level="h1">Product reviews</Heading>
        <Text size="small" leading="compact" className="text-ui-fg-subtle">
          Moderate customer reviews, update status, and manage store responses.
        </Text>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(
          [
            { key: "all", label: "All", count: allData?.count ?? 0 },
            {
              key: "pending",
              label: "Pending",
              count: pendingData?.count ?? 0,
            },
            {
              key: "approved",
              label: "Approved",
              count: approvedData?.count ?? 0,
            },
            {
              key: "flagged",
              label: "Flagged",
              count: flaggedData?.count ?? 0,
            },
          ] as const
        ).map((item) => {
          const active =
            item.key === "all"
              ? statusFilter === "all"
              : statusFilter === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setStatusFilter(item.key === "all" ? "all" : item.key)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className={`text-left rounded-lg border px-4 py-3 transition-colors ${
                active
                  ? "border-ui-border-interactive bg-ui-bg-base shadow-elevation-card-rest"
                  : "border-ui-border-base bg-ui-bg-subtle hover:bg-ui-bg-base"
              }`}
            >
              <Text size="small" leading="compact" className="text-ui-fg-subtle">
                {item.label}
              </Text>
              <Text size="large" leading="compact" weight="plus">
                {item.count}
              </Text>
            </button>
          )
        })}
      </div>

      <Container className="divide-y p-0">
        <DataTable instance={table}>
          <DataTable.Toolbar className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between px-6 py-4">
            <div className="flex flex-wrap items-center gap-2">
              <DataTable.Search placeholder="Search reviews..." />
              <div className="w-[140px]">
                <Select
                  value={String(ratingFilter)}
                  onValueChange={(value) => {
                    setRatingFilter(
                      value === "all" ? "all" : Number(value)
                    )
                    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
                  }}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Rating" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">All ratings</Select.Item>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <Select.Item key={rating} value={String(rating)}>
                        {rating} stars
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
              {statusFilter !== "all" && (
                <Badge size="2xsmall" color={statusColor(statusFilter)}>
                  Status: {statusFilter}
                </Badge>
              )}
            </div>

            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {selectedCount} selected
                </Text>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={bulkStatusMutation.isPending}
                  isLoading={bulkStatusMutation.isPending}
                  onClick={() => bulkStatusMutation.mutate("approved")}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={bulkStatusMutation.isPending}
                  onClick={() => bulkStatusMutation.mutate("pending")}
                >
                  Mark pending
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={bulkStatusMutation.isPending}
                  onClick={() => bulkStatusMutation.mutate("flagged")}
                >
                  Flag
                </Button>
              </div>
            )}
          </DataTable.Toolbar>

          {isError ? (
            <div className="px-6 py-10">
              <Text size="small" className="text-ui-fg-error">
                {(error as Error)?.message || "Failed to load reviews."}
              </Text>
            </div>
          ) : (
            <>
              <DataTable.Table />
              <DataTable.Pagination />
            </>
          )}
        </DataTable>
      </Container>

      <ReviewResponseDrawer
        review={selectedForResponse}
        open={!!selectedForResponse}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedForResponse(null)
          }
        }}
      />
      <ReviewDetailsDrawer
        review={selectedForDetails}
        open={!!selectedForDetails}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedForDetails(null)
          }
        }}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Reviews",
  icon: ChatBubble,
})

export default ProductReviewsPage

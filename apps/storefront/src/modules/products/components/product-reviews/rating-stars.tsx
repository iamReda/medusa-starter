import { clx } from "@modules/common/components/ui"
import Star from "@modules/common/icons/star"

type RatingStarsProps = {
  rating: number
  size?: number
  className?: string
  showValue?: boolean
  "aria-label"?: string
}

const RatingStars = ({
  rating,
  size = 16,
  className,
  showValue = false,
  "aria-label": ariaLabel,
}: RatingStarsProps) => {
  const rounded = Math.round(rating * 2) / 2
  const fullStars = Math.floor(rounded)
  const hasHalf = rounded - fullStars === 0.5

  return (
    <div
      className={clx("flex items-center gap-x-1", className)}
      role="img"
      aria-label={
        ariaLabel ?? `Rated ${rating.toFixed(1)} out of 5 stars`
      }
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < fullStars || (hasHalf && index === fullStars)
        return (
          <Star
            key={index}
            size={String(size)}
            color={filled ? "#111111" : "#D4D4D8"}
            filled={index < fullStars}
          />
        )
      })}
      {showValue && (
        <span className="text-small-regular text-ui-fg-subtle ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default RatingStars

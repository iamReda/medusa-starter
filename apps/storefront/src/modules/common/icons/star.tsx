import React from "react"

import { IconProps } from "types/icon"

type StarProps = IconProps & {
  filled?: boolean
}

const Star: React.FC<StarProps> = ({
  size = "16",
  color = "currentColor",
  filled = true,
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...attributes}
    >
      <path
        d="M10 1.667L12.575 7.017L18.333 7.808L14.167 11.892L15.15 17.5L10 14.808L4.85 17.5L5.833 11.892L1.667 7.808L7.425 7.017L10 1.667Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default Star

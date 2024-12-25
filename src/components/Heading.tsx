import { memo } from 'react'

interface HeadingProps {
  title: string
  className?: string
}

function Heading({ title, className = '' }: HeadingProps) {
  return (
    <h2
      className={`mx-auto my-11 w-full max-w-1200 gap-4 text-center font-sans text-4xl font-semibold italic tracking-wide text-white sm:text-nowrap md:text-nowrap ${className}`}
    >
      {title}
    </h2>
  )
}

export default memo(Heading)

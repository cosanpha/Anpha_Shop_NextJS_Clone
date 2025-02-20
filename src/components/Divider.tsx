import { memo } from 'react'

interface DividerProps {
  size: number
  border?: boolean
}

function Divider({ size, border }: DividerProps) {
  return border ? (
    <div
      className="border"
      style={{ marginTop: size * 4, marginBottom: size * 4 }}
    />
  ) : (
    <div
      style={{
        paddingTop: size * 4,
      }}
    />
  )
}

export default memo(Divider)

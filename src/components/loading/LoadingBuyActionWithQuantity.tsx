import { memo } from 'react'

function BuyActionWithQuantity({ className = '' }: { className?: string }) {
  return (
    <>
      {/* MARK: Main */}
      <div className={`my-3 inline-flex gap-[1.5px] rounded-md ${className}`}>
        <div className={`loading h-[37px] w-[42px] rounded-bl-md rounded-tl-md`} />
        <div className="loading h-[37px] w-[56px]" />
        <div className={`loading h-[37px] w-[42px] rounded-br-md rounded-tr-md`} />
      </div>

      {/* MARK: Action Buttons */}
      <div className="mt-2 flex flex-row-reverse items-center justify-start gap-3 md:flex-row">
        <div className="loading h-[38px] w-[113px] rounded-md text-white" />
        <div className="loading h-[38px] w-[46px] rounded-md text-white" />
      </div>
    </>
  )
}

export default memo(BuyActionWithQuantity)

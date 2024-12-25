import { IUser } from '@/models/UserModel'
import { IVoucher } from '@/models/VoucherModel'
import { formatPrice } from '@/utils/number'
import { formatDate } from '@/utils/time'
import React, { memo } from 'react'
import { IoIosSend } from 'react-icons/io'
import { RiDonutChartFill } from 'react-icons/ri'

interface SummaryItemProps {
  data: IUser
  loadingSummaries: string[]
  className?: string

  selectedSummaries: string[]
  setSelectedSummaries: React.Dispatch<React.SetStateAction<string[]>>

  handleSendSummaries: (ids: string[]) => void
}

function SummaryItem({
  data,
  loadingSummaries,
  className = '',
  // selected
  selectedSummaries,
  setSelectedSummaries,
  // functions
  handleSendSummaries,
}: SummaryItemProps) {
  return (
    <div
      className={`justify trans-200 relative flex w-full cursor-pointer items-start gap-2 rounded-lg p-4 shadow-lg ${
        selectedSummaries.includes(data._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
      } ${className}`}
      onClick={() =>
        setSelectedSummaries(prev =>
          prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
        )
      }
    >
      {/* MARK: Body */}
      <div className="w-full">
        <p className="text-sm">
          <span className="font-semibold">Email: </span>
          <span>{data.email}</span>
        </p>

        <div
          className="flex items-center font-semibold"
          title="netflix"
        >
          <span
            title="Collaborator"
            className="mr-2 font-semibold text-secondary"
          >
            {data.firstname && data.lastname
              ? `${data.firstname} ${data.lastname}`
              : data.username || 'No name'}
          </span>
          <span
            className="trans-200 rounded-lg border border-dark bg-sky-200 px-[6px] py-[2px] text-xs shadow-lg hover:bg-sky-300"
            title="Commission"
          >
            {data.commission?.type === 'percentage'
              ? data.commission.value
              : formatPrice(+(data.commission?.value || 0))}
          </span>
        </div>

        <p className="text-sm font-semibold">
          All Income: <span className="text-rose-500">{formatPrice(data.totalIncome)}</span>
        </p>
        <p className="text-sm font-semibold">
          Temporary Income:{' '}
          <span className="text-sky-500">
            {formatPrice(
              (data.vouchers as IVoucher[]).reduce((total, voucher) => total + voucher.accumulated, 0)
            )}
          </span>
        </p>
        <p className="text-sm font-semibold">
          Vouchers:{' '}
          {(data.vouchers as IVoucher[]).map((voucher, index) => (
            <span
              className="text-slate-500"
              title={`${voucher.type} | ${
                voucher.type !== 'percentage' ? formatPrice(+voucher.value) : voucher.value
              } | ${voucher.timesLeft} | ${
                voucher.expire ? formatDate(voucher.expire) : 'no-expire'
              } | ${formatPrice(voucher.minTotal)} | ${formatPrice(voucher.maxReduce)}`}
              key={voucher.code}
            >
              {voucher.code}
              {index === (data.vouchers as IVoucher[]).length - 1 ? '' : ', '}
            </span>
          ))}
        </p>
      </div>

      {/* MARK: Action Buttons */}
      <div className="flex flex-shrink-0 flex-col gap-4 rounded-lg border border-dark p-2 text-dark">
        {/* Send Summary Button */}
        <button
          className="group block"
          onClick={e => {
            e.stopPropagation()
            handleSendSummaries([data._id])
          }}
          disabled={loadingSummaries.includes(data._id)}
          title="Send"
        >
          {loadingSummaries.includes(data._id) ? (
            <RiDonutChartFill
              size={18}
              className="animate-spin text-slate-300"
            />
          ) : (
            <IoIosSend
              size={18}
              className="wiggle"
            />
          )}
        </button>
      </div>
    </div>
  )
}

export default memo(SummaryItem)

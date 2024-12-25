import { IUser } from '@/models/UserModel'
import { IVoucher } from '@/models/VoucherModel'
import { formatPrice } from '@/utils/number'
import { formatTime } from '@/utils/time'
import Link from 'next/link'
import React, { memo, useState } from 'react'
import { FaCheck, FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../ConfirmDialog'

interface VoucherItemProps {
  data: IVoucher
  loadingVouchers: string[]
  className?: string

  selectedVouchers: string[]
  setSelectedVouchers: React.Dispatch<React.SetStateAction<string[]>>

  handleActivateVouchers: (ids: string[], value: boolean) => void
  handleDeleteVouchers: (ids: string[]) => void
}

function VoucherItem({
  data,
  loadingVouchers,
  className = '',
  // selected
  selectedVouchers,
  setSelectedVouchers,
  // functions
  handleActivateVouchers,
  handleDeleteVouchers,
}: VoucherItemProps) {
  // states
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  return (
    <>
      <div
        className={`trans-200 relative flex cursor-pointer items-start justify-between gap-2 rounded-lg p-4 text-dark shadow-lg ${
          selectedVouchers.includes(data._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
        } ${className}`}
        onClick={() =>
          setSelectedVouchers(prev =>
            prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
          )
        }
      >
        {/* MARK: Body */}
        <div>
          <div className="flex items-center gap-3">
            {/* Code */}
            <p
              className="font-semibold text-secondary"
              title="code"
            >
              {data.code}
            </p>

            {/* Value */}
            <p
              className="font-semibold text-primary"
              title="value"
            >
              {data.type === 'percentage' ? data.value : formatPrice(+data.value)}
            </p>

            {/* Times Left */}
            <p
              className="font-semibold text-slate-400"
              title="timesLeft"
            >
              {data.timesLeft}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm">
            {/* Min Totals */}
            <p>
              <span
                className="font-semibold"
                title="minTotal"
              >
                Min Total:{' '}
              </span>
              {formatPrice(data.minTotal)}
            </p>

            {/* Max Reduce */}
            <p>
              <span
                className="font-semibold"
                title="maxReduce"
              >
                Max Reduce:{' '}
              </span>
              {formatPrice(data.maxReduce)}
            </p>
          </div>

          {/* Begin */}
          <p
            className="text-sm"
            title="begin (d/m/y)"
          >
            <span className="font-semibold">Begin: </span>
            <span>{formatTime(data.begin)}</span>
          </p>

          {/* Expire */}
          {data.expire && (
            <p
              className="text-sm"
              title="expire (d/m/y)"
            >
              <span className="font-semibold">Expire: </span>
              <span>{formatTime(data.expire)}</span>
            </p>
          )}

          {/* Desc */}
          {data.desc?.trim() && (
            <p
              className="text-sm"
              title="desc"
            >
              <span className="font-semibold">Desc: </span>
              <span>{data.desc}</span>
            </p>
          )}

          {/* Owner */}
          <p
            className="text-sm"
            title="owner"
          >
            <span className="font-semibold">Owner: </span>
            <span>{(data.owner as IUser)?.firstname + ' ' + (data.owner as IUser)?.lastname}</span>
          </p>

          {/* Used Users */}
          {!!data.usedUsers.length && (
            <p
              className="text-sm"
              title="usedUsers"
            >
              <span className="font-semibold">Used users: </span>
              {data.usedUsers.map((email, index) => (
                <span key={email}>
                  {email} {index < data.usedUsers.length - 1 && ', '}
                </span>
              ))}
            </p>
          )}

          {/* Accumulated */}
          <p
            className="text-sm font-semibold"
            title="accumulated"
          >
            <span>Accumulated: </span>
            <span className="text-rose-700">{formatPrice(data.accumulated)}</span>
          </p>
        </div>

        {/* MARK: Action Buttons */}
        <div className="flex flex-col gap-4 rounded-lg border border-dark px-2 py-3">
          {/* Active Button */}
          <button
            className="group block"
            onClick={e => {
              e.stopPropagation()
              handleActivateVouchers([data._id], !data.active)
            }}
            title={data.active ? 'Deactivate' : 'Activate'}
          >
            <FaCheck
              size={18}
              className={`wiggle ${data.active ? 'text-green-500' : 'text-slate-300'}`}
            />
          </button>

          {/* Edit Button Link */}
          <Link
            href={`/admin/voucher/${data.code}/edit`}
            className="group block"
            onClick={e => e.stopPropagation()}
            title="Edit"
          >
            <MdEdit
              size={18}
              className="wiggle"
            />
          </Link>

          {/* Delete Button */}
          <button
            className="group block"
            onClick={e => {
              e.stopPropagation()
              setIsOpenConfirmModal(true)
            }}
            disabled={loadingVouchers.includes(data._id)}
            title="Delete"
          >
            {loadingVouchers.includes(data._id) ? (
              <RiDonutChartFill
                size={18}
                className="animate-spin text-slate-300"
              />
            ) : (
              <FaTrash
                size={18}
                className="wiggle"
              />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={isOpenConfirmModal}
        setOpen={setIsOpenConfirmModal}
        title="Delete Voucher"
        content="Are you sure that you want to delete these products?"
        onAccept={() => handleDeleteVouchers([data._id])}
        isLoading={loadingVouchers.includes(data._id)}
      />
    </>
  )
}

export default memo(VoucherItem)

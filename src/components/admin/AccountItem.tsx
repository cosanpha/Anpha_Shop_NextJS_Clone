import { IAccount } from '@/models/AccountModel'
import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { formatTime, getColorClass, getTimeRemaining, isToday, usingPercentage } from '@/utils/time'
import Image from 'next/image'
import Link from 'next/link'
import React, { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCheck, FaCopy, FaTrash } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'
import ConfirmDialog from '../ConfirmDialog'

interface AccountItemProps {
  data: IAccount
  loadingAccounts: string[]
  className?: string

  selectedAccounts: string[]
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>

  handleActivateAccounts: (ids: string[], value: boolean) => void
  handleDeleteAccounts: (ids: string[]) => void
}

function AccountItem({
  data,
  loadingAccounts,
  className = '',
  // selected
  selectedAccounts,
  setSelectedAccounts,
  // functions
  handleActivateAccounts,
  handleDeleteAccounts,
}: AccountItemProps) {
  // states
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState<boolean>(false)

  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép: ' + text)
  }, [])

  return (
    <>
      <div
        className={`trans-200 relative flex w-full cursor-pointer items-start gap-2 rounded-lg p-4 shadow-lg ${
          selectedAccounts.includes(data._id) ? '-translate-y-1 bg-violet-50' : 'bg-white'
        } ${className}`}
        onClick={() =>
          setSelectedAccounts(prev =>
            prev.includes(data._id) ? prev.filter(id => id !== data._id) : [...prev, data._id]
          )
        }
      >
        <div className="w-[calc(100%_-_42px)]">
          {/* MARK: Thumbnails */}
          <Link
            href={`/${(data.type as IProduct)?.slug || ''}`}
            prefetch={false}
            onClick={e => e.stopPropagation()}
            className="mb-2 mr-4 flex max-w-[160px] items-center overflow-hidden rounded-lg shadow-md"
          >
            <div className="no-scrollbar flex w-full snap-x snap-mandatory items-center overflow-x-scroll">
              <Image
                className="aspect-video h-full w-full flex-shrink-0 snap-start object-cover"
                src={(data.type as IProduct)?.images[0] || '/images/not-found.jpg'}
                height={200}
                width={200}
                alt="thumbnail"
              />
            </div>
          </Link>

          {/* Using User */}
          <div
            className={`absolute -top-3 left-1/2 z-10 -translate-x-1/2 select-none rounded-lg px-2 py-[2px] font-body text-sm text-dark shadow-md ${
              data.usingUser ? 'bg-secondary text-white' : 'bg-slate-300 text-slate-400'
            }`}
            onClick={e => {
              e.stopPropagation()
              data.usingUser && handleCopy(data.usingUser)
            }}
          >
            {data.usingUser ? data.usingUser : '___'}
          </div>

          {/* Type */}
          <p
            className="mb-2 mr-2 inline-flex flex-wrap items-center gap-2 font-body text-[18px] font-semibold leading-5 tracking-wide"
            title={(data.type as IProduct)?.title}
          >
            <span
              className={`text-xs shadow-md ${
                ((data.type as IProduct)?.category as ICategory).title
                  ? 'bg-yellow-300 text-dark'
                  : 'bg-slate-200 text-slate-400'
              } select-none rounded-md px-2 py-px font-body`}
            >
              {((data.type as IProduct)?.category as ICategory).title || 'empty'}
            </span>
            {(data.type as IProduct)?.title}
          </p>

          {/* Begin */}
          <p
            className="text-sm"
            title="Begin (d/m/y)"
          >
            <span className="font-semibold">Begin: </span>
            <span
              className={
                data.begin && isToday(new Date(data.begin)) ? 'font-semibold text-slate-600' : ''
              }
            >
              {data.begin ? formatTime(data.begin) : '-'}
            </span>
          </p>

          {/* Expire */}
          <p
            className="text-sm"
            title="Expire (d/m/y)"
          >
            <span className="font-semibold">Expire: </span>
            {data.expire ? (
              <>
                <span
                  className={`${
                    new Date() > new Date(data.expire || '') ? 'font-semibold text-red-500' : ''
                  }`}
                >
                  {data.expire ? formatTime(data.expire) : '-'}
                </span>{' '}
                {data?.begin && data?.expire && usingPercentage(data.begin, data.expire) < 100 && (
                  <span
                    className={`text-xs font-semibold ${getColorClass(data.begin, data.expire)}`}
                    title={`${
                      usingPercentage(data.begin, data.expire) >= 93
                        ? '>= 93'
                        : usingPercentage(data.begin, data.expire) >= 80
                          ? '>= 80'
                          : ''
                    }`}
                  >
                    (<span>{usingPercentage(data.begin, data.expire) + '%'}</span>
                    {' - '}
                    <span>
                      {data.expire && getTimeRemaining(data.expire)
                        ? `${getTimeRemaining(data.expire)}`
                        : 'Expired'}
                    </span>
                    )
                  </span>
                )}{' '}
              </>
            ) : (
              <span className="text-slate-500">
                +{data.times.days ? data.times.days + 'd' : ''}
                {data.times.hours ? ':' + data.times.hours + 'h' : ''}
                {data.times.minutes ? ':' + data.times.minutes + 'm' : ''}
              </span>
            )}
          </p>

          {/* Renew */}
          <p
            className="text-sm"
            title="Expire (d/m/y)"
          >
            <span className="font-semibold">Renew: </span>
            <span className={`${new Date() > new Date(data.renew) ? 'font-semibold text-red-500' : ''}`}>
              {formatTime(data.renew)}
            </span>
          </p>

          {/* Updated  */}
          <p
            className="text-sm"
            title="Expire (d/m/y)"
          >
            <span className="font-semibold">Updated: </span>
            <span
              className={`${
                +new Date() - +new Date(data.updatedAt) <= 60 * 60 * 1000 ? 'text-yellow-500' : ''
              }`}
            >
              {formatTime(data.updatedAt)}
            </span>
          </p>

          {/* Info */}
          <div className="relative">
            <button
              className="group absolute right-1.5 top-1.5 rounded-md border bg-white p-1.5 text-slate-500"
              onClick={e => {
                e.stopPropagation()
                handleCopy(data.info)
              }}
            >
              <FaCopy
                size={16}
                className="wiggle"
              />
            </button>
            <div className="mt-2 max-h-[200px] w-full overflow-scroll whitespace-pre break-all rounded-lg border p-2 font-body text-sm tracking-wide">
              {data.info.split('\n').map((line, index) => (
                <span
                  key={index}
                  className="block"
                >
                  {line.split(' ').map((word, index) => (
                    <span
                      key={index}
                      className="inline-block cursor-pointer"
                      onClick={e => {
                        e.stopPropagation()
                        handleCopy(word)
                      }}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* MARK: Action Buttons */}
        <div className="flex flex-shrink-0 flex-col gap-4 rounded-lg border border-dark px-2 py-3 text-dark">
          {/* Active Button */}
          <button
            className="group block"
            onClick={e => {
              e.stopPropagation()
              handleActivateAccounts([data._id], !data.active)
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
            href={`/admin/account/${data._id}/edit`}
            className="group block"
            title="Edit"
            onClick={e => e.stopPropagation()}
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
            disabled={loadingAccounts.includes(data._id)}
            title="Delete"
          >
            {loadingAccounts.includes(data._id) ? (
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
        title="Delete Account"
        content="Are you sure that you want to delete this account?"
        onAccept={() => handleDeleteAccounts([data._id])}
        isLoading={loadingAccounts.includes(data._id)}
      />
    </>
  )
}

export default memo(AccountItem)

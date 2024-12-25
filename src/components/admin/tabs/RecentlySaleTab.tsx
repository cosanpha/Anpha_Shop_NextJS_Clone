'use client'

import { IAccount } from '@/models/AccountModel'
import { IProduct } from '@/models/ProductModel'
import { getAllAccountsApi } from '@/requests'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCircleNotch } from 'react-icons/fa'

interface RecentlySaleTab {
  className?: string
}

function RecentlySaleTab({ className = '' }: RecentlySaleTab) {
  // states
  const [accounts, setAccounts] = useState<IAccount[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)

  // get recently sale accounts
  const getAccounts = useCallback(async (page: number) => {
    console.log('Get Recently Sale Accounts')

    // start loading
    setLoading(true)

    try {
      const query = `?limit=15&sort=begin|-1&active=true&usingUser=true&page=${page}`
      const { accounts } = await getAllAccountsApi(query)

      return accounts
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setLoading(false)
    }
  }, [])

  // get recently sale accounts (on mount)
  useEffect(() => {
    // get accounts on mount
    const initialGetAccounts = async () => {
      const accounts = await getAccounts(1)
      setAccounts(accounts)
    }

    initialGetAccounts()
  }, [getAccounts])

  // handle load more
  const handleLoadMore = useCallback(async () => {
    const newAccounts = await getAccounts(page + 1)
    setPage(page + 1)
    setAccounts(prev => [...prev, ...newAccounts])
  }, [getAccounts, setAccounts, page])

  return (
    <div className={`${className}`}>
      {accounts.map(account => {
        const minutesAgo = moment().diff(moment(account.begin), 'minutes')

        let color
        if (minutesAgo <= 30) {
          color = 'green-500' // Màu xanh lá
        } else if (minutesAgo <= 60) {
          color = 'sky-500' // Màu xanh dương
        } else if (minutesAgo <= 120) {
          color = 'yellow-400' // Màu vàng
        } else {
          color = 'default' // Màu mặc định nếu hơn 30 phút
        }

        return (
          <div
            className="mb-4 flex gap-3"
            key={account._id}
          >
            <Link
              href={`/${(account.type as IProduct).slug}`}
              className="no-scrollbar flex w-full max-w-[80px] flex-shrink-0 items-start"
            >
              <Image
                className="aspect-video rounded-lg shadow-lg"
                src={(account.type as IProduct)?.images[0] || '/images/not-found.jpg'}
                height={80}
                width={80}
                alt="thumbnail"
              />
            </Link>
            <div className="font-body tracking-wider">
              <p className="-mt-1.5 line-clamp-1 text-ellipsis font-semibold">
                {(account.type as IProduct).title}
              </p>
              <Link
                href={`/admin/account/all?search=${account.usingUser}`}
                className="line-clamp-1 text-ellipsis text-sm"
              >
                {account.usingUser}
              </Link>
              <p className={`line-clamp-1 text-ellipsis text-sm text-${color}`}>
                {moment(account.begin).format('DD/MM/YYYY HH:mm:ss')}
              </p>
            </div>
          </div>
        )
      })}

      {/* Load More */}
      <div className="flex items-center justify-center">
        <button
          className={`trans-200 flex h-8 items-center justify-center rounded-md border-2 px-3 text-sm font-semibold text-white hover:bg-white hover:text-dark ${
            loading ? 'pointer-events-none border-slate-400 bg-white' : 'border-dark bg-dark-100'
          }`}
          onClick={handleLoadMore}
        >
          {loading ? (
            <FaCircleNotch
              size={18}
              className="animate-spin text-slate-400"
            />
          ) : (
            <span>({accounts.length}) Load more...</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default memo(RecentlySaleTab)

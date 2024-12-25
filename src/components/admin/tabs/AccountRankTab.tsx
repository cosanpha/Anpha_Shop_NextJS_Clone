import Divider from '@/components/Divider'
import { getAllOrdersApi, getForceAllCagetoriesApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import { rankAccountRevenue } from '@/utils/stat'
import moment from 'moment'
import { memo, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCircleNotch } from 'react-icons/fa'

interface AccountRankTabProps {
  className?: string
}

function AccountRankTab({ className = '' }: AccountRankTabProps) {
  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [by, setBy] = useState<'day' | 'month' | 'year'>('day')

  useEffect(() => {
    const getOrders = async () => {
      // start loading
      setLoading(true)

      try {
        let from: string = ''
        const currentTime = moment()
        if (by === 'day') {
          from = currentTime.startOf('day').format('YYYY-MM-DD HH:mm:ss')
        } else if (by === 'month') {
          from = currentTime.startOf('month').format('YYYY-MM-DD HH:mm:ss')
        } else if (by === 'year') {
          from = currentTime.startOf('year').format('YYYY-MM-DD HH:mm:ss')
        }

        const query = `?limit=no-limit&status=done&sort=createdAt|-1&from-to=${from}|`
        const { orders } = await getAllOrdersApi(query)

        const { categories } = await getForceAllCagetoriesApi()
        const accounts = rankAccountRevenue(orders, categories)
        setAccounts(accounts)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setLoading(false)
      }
    }

    getOrders()
  }, [by])

  return (
    <div className={`${className}`}>
      {!loading ? (
        <>
          <select
            className="peer cursor-pointer appearance-none rounded-lg bg-dark-100 p-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-0"
            value={by}
            onChange={e => setBy(e.target.value as never)}
          >
            <option
              className="bg-dark-100 p-5 font-body font-semibold tracking-wider text-white"
              value="day"
            >
              By Day
            </option>
            <option
              className="bg-dark-100 p-5 font-body font-semibold tracking-wider text-white"
              value="month"
            >
              By Month
            </option>
            <option
              className="bg-dark-100 p-5 font-body font-semibold tracking-wider text-white"
              value="year"
            >
              By Year
            </option>
          </select>

          <Divider size={4} />

          {accounts.map((account, index) => (
            <div
              className="mb-3 flex flex-col items-start gap-1"
              key={index}
            >
              <p className="rounded-lg bg-slate-700 px-2 py-[2px] text-sm text-white">{account.email}</p>
              <div className="flex gap-2">
                <span className="text-sm font-semibold text-green-500">
                  {formatPrice(account.revenue)}
                </span>
                <span
                  className={`select-none rounded-md px-1 py-[3px] font-body text-xs shadow-md`}
                  style={{
                    background: account.category.color,
                  }}
                >
                  <span className="tex-dark rounded-md bg-white px-1 text-[11px]">
                    {account.category.title}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="flex items-center justify-center">
          <FaCircleNotch
            size={18}
            className="animate-spin text-slate-400"
          />
        </div>
      )}
    </div>
  )
}

export default memo(AccountRankTab)

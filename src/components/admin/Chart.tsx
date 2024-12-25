'use client'

import { getAllOrdersApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import moment from 'moment'
import { memo, useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCircleNotch } from 'react-icons/fa'
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts'

interface ChartProps {
  by: string
  chart: 'Revenue' | 'New Orders' | 'Sale Accounts' | 'New Users' | 'Used Vouchers'
  chunk: number
  className?: string
}

function Chart({ by, chart, chunk, className = '' }: ChartProps) {
  // states
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<any>([])
  const [currentTime, setCurrentTime] = useState<moment.Moment>(moment())

  // get current time
  useEffect(() => {
    const currentTime = moment().subtract(
      chunk,
      by === 'day' ? 'months' : by === 'month' ? 'years' : 'days'
    )
    setCurrentTime(currentTime)
  }, [by, chunk])

  // get orders
  useEffect(() => {
    const getData = async () => {
      // start loading
      setLoading(true)

      try {
        let from: string = ''
        let to: string = ''

        const cloneCurrentTime = currentTime.clone()
        if (by === 'day') {
          // from first day of current month
          from = cloneCurrentTime.startOf('month').format('YYYY-MM-DD HH:mm:ss')
          // to last day of current month
          to = cloneCurrentTime.endOf('month').format('YYYY-MM-DD HH:mm:ss')
        } else if (by === 'month') {
          // from first month of current year
          from = cloneCurrentTime.startOf('year').format('YYYY-MM-DD HH:mm:ss')
          // to last month of current year
          to = cloneCurrentTime.endOf('year').format('YYYY-MM-DD HH:mm:ss')
        } else if (by === 'year') {
          // from 5 years ago to current year
          from = cloneCurrentTime.subtract(5, 'years').format('YYYY-MM-DD HH:mm:ss')
        }

        const query = `?limit=no-limit&status=done&sort=createdAt|-1&from-to=${from}|${to}`
        const { orders } = await getAllOrdersApi(query)
        setOrders(orders)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        setLoading(false)
      }
    }
    getData()
  }, [by, chunk, currentTime])

  // get value to build chart
  const getValue = useCallback(
    (orders: any) => {
      switch (chart) {
        case 'Revenue': {
          return orders.reduce((acc: number, order: any) => {
            return acc + order.total
          }, 0)
        }
        case 'New Orders': {
          return orders.length
        }
        case 'Sale Accounts': {
          let newAccounts = 0
          orders.forEach((order: any) => {
            order.items.forEach((item: any) => {
              newAccounts += item.accounts.length
            })
          })
          return newAccounts
        }
        case 'New Users': {
          let newUserEmails: string[] = []
          orders.forEach((order: any) => {
            const email = order.email
            if (!newUserEmails.includes(email)) {
              newUserEmails.push(email)
            }
          })
          return newUserEmails.length
        }
        case 'Used Vouchers': {
          let usedVouchers = 0
          orders.forEach((order: any) => {
            if (order.discount && order.discount !== 0) {
              usedVouchers++
            }
          })
          return usedVouchers
        }
      }
    },
    [chart]
  )

  // build chart data
  useEffect(() => {
    let chartData: any[] = []

    if (by === 'day') {
      // [1,2,3, ..., daysInMonth]
      const days = Array.from({ length: currentTime.daysInMonth() }, (_, i) => i + 1)

      // build data chart
      chartData = days.map((day: number) => {
        // all orders in day
        const data = orders.filter((order: any) => {
          return day.toString() === moment(order.createdAt).format('D')
        })

        // current day statistic
        return {
          name: day.toString(),
          value: getValue(data),
        }
      })
    } else if (by === 'month') {
      // build data chart
      chartData = Array.from({ length: 12 }).map((_, index) => {
        // all orders in month
        const data =
          index <= currentTime.month()
            ? orders.filter((order: any) => {
                return (index + 1).toString() === moment(order.createdAt).format('M')
              })
            : []

        // current month statistic
        return {
          name: moment(index + 1, 'M').format('MMM'),
          value: getValue(data),
        }
      })
    } else if (by === 'year') {
      // [currentYear - 5, currentYear]
      const years = Array.from({ length: 5 }, (_, i) => currentTime.year() - i).reverse()

      // build data chart
      chartData = years.map((year: number) => {
        // all orders in year
        const data = orders.filter((order: any) => {
          return year.toString() === moment(order.createdAt).format('YYYY')
        })

        // current year revenue
        return {
          name: year.toString(),
          value: getValue(data),
        }
      })
    }

    setData(chartData)
  }, [by, chart, orders, currentTime, getValue])

  return !loading ? (
    <div className={`relative ${className}`}>
      <span className="absolute right-0 top-0 z-10 rounded-lg border-2 border-dark bg-white px-2 py-1 text-sm font-semibold text-dark">
        {currentTime.format(by === 'day' ? 'MMMM YYYY' : by === 'month' ? 'YYYY' : 'YYYY')}
      </span>
      <div className="overflow-x-auto">
        <BarChart
          data={data}
          width={896}
          height={500}
        >
          {/* <Legend /> */}
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey={'name'}
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis
            dataKey={'value'}
            tickFormatter={value =>
              chart === 'Revenue'
                ? `${(value / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })}k`
                : value
            }
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <Bar
            dataKey={'value'}
            fill="#111"
            radius={[4, 4, 4, 4]}
          />
          <Tooltip
            cursor={{
              stroke: '#333',
              strokeWidth: 2,
              fill: '#fff',
              radius: 4,
              className: 'transition-all duration-75',
            }}
            animationEasing="ease-in-out"
            animationDuration={200}
            labelFormatter={(value: string) => `${by.charAt(0).toUpperCase() + by.slice(1)} ${value}`}
            formatter={value => {
              if (chart === 'Revenue') {
                const formattedValue = formatPrice(+value)
                return [`Revenue: ${formattedValue}`]
              } else {
                return [`Quantity: ${value}`]
              }
            }}
            labelStyle={{ color: '#01dbe5' }}
            contentStyle={{
              background: '#fff',
              borderRadius: 8,
              border: 'none',
              boxShadow: '0px 14px 10px 5px rgba(0, 0, 0, 0.2)',
            }} // Đổi màu nền của hình chữ nhật
          />
        </BarChart>
      </div>
    </div>
  ) : (
    <div className="flex h-[500px] items-center justify-center">
      <FaCircleNotch
        size={50}
        className="animate-spin text-slate-300"
      />
    </div>
  )
}

export default memo(Chart)

'use client'

import Divider from '@/components/Divider'
import Chart from '@/components/admin/Chart'
import Stats from '@/components/admin/Stats'
import AccountRankTab from '@/components/admin/tabs/AccountRankTab'
import CategoryRankTab from '@/components/admin/tabs/CategoryRankTab'
import RecentlySaleTab from '@/components/admin/tabs/RecentlySaleTab'
import TagRankTab from '@/components/admin/tabs/TagRankTab'
import UserSpendingRankTab from '@/components/admin/tabs/UserSpendingRank'
import moment from 'moment'
import { useMemo, useState } from 'react'
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa'

function AdminPage() {
  // states
  const [by, setBy] = useState<'day' | 'month' | 'year'>('day')
  const [selectedChart, setSelectedChart] = useState<
    'Revenue' | 'New Orders' | 'Sale Accounts' | 'New Users' | 'Used Vouchers'
  >('Revenue')
  const [tab, setTab] = useState<number>(1)
  const [chartChunk, setChartChunk] = useState<number>(0)

  // tabs
  const tabs = useMemo(
    () => [
      <RecentlySaleTab
        className="h-[500px] overflow-y-scroll"
        key={1}
      />,
      <AccountRankTab
        className="h-[500px] overflow-y-scroll"
        key={2}
      />,
      <UserSpendingRankTab
        className="h-[500px]"
        key={5}
      />,
      <CategoryRankTab
        className="h-[500px] overflow-y-scroll"
        key={3}
      />,
      <TagRankTab
        className="h-[500px] overflow-y-scroll"
        key={4}
      />,
    ],
    []
  )

  const prevChunk = () => {
    const curMonth = moment().month() + 1

    if (by === 'day' && chartChunk < curMonth) {
      setChartChunk(chartChunk + 1)
    } else if (by === 'month') {
      setChartChunk(chartChunk + 1)
    }
  }

  const nextChunk = () => {
    if (by === 'day' && chartChunk > 0) {
      setChartChunk(chartChunk - 1)
    } else if (by === 'month' && chartChunk > 0) {
      setChartChunk(chartChunk - 1)
    }
  }

  return (
    <div className="rounded-medium bg-white p-21 text-dark shadow-medium">
      {/* Staticticals */}
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Filter By Time */}
      <div className="flex justify-end">
        <select
          className="peer cursor-pointer appearance-none rounded-lg bg-dark-100 p-2.5 text-sm font-semibold text-white focus:outline-none focus:ring-0"
          value={by}
          onChange={e => {
            setBy(e.target.value as never)
            setChartChunk(0)
          }}
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
      </div>

      <Divider size={4} />

      <div className="grid grid-cols-12 gap-x-21 gap-y-16">
        {/* Stats */}
        <Stats
          by={by}
          className="col-span-12 grid grid-cols-4 gap-x-21 gap-y-21/2"
        />

        {/* Chart & Rank */}
        <div className="col-span-12 grid grid-cols-12 gap-21">
          {/* BarChart */}
          <div className="col-span-12 lg:col-span-7">
            <div className="flex gap-2 px-2">
              {['Revenue', , 'New Orders', 'Sale Accounts', 'Used Vouchers'].map((label, index) => (
                <span
                  className={`trans-200 line-clamp-1 block max-w-[100px] cursor-pointer text-ellipsis text-nowrap rounded-t-lg border border-b-0 px-2 py-1 ${
                    selectedChart === label ? 'border-transparent bg-dark-100 text-white' : ''
                  }`}
                  onClick={() => setSelectedChart(label as never)}
                  title={label}
                  key={index}
                >
                  {label}
                </span>
              ))}

              {by !== 'year' && (
                <div className="flex flex-1 justify-end">
                  <span
                    className={`flex cursor-pointer items-center justify-center rounded-tl-md border border-b-0 px-2 py-1`}
                    title="Previous"
                    onClick={prevChunk}
                  >
                    <FaAngleLeft size={16} />
                  </span>
                  <span
                    className={`flex cursor-pointer items-center justify-center rounded-tr-md border border-b-0 px-2 py-1`}
                    title="Next"
                    onClick={nextChunk}
                  >
                    <FaAngleRight size={16} />
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-lg border p-21 shadow-lg">
              <Chart
                chart={selectedChart}
                by={by}
                chunk={chartChunk}
              />
            </div>
          </div>

          {/* Rank */}
          <div className="col-span-12 lg:col-span-5">
            <div className="flex gap-2 px-2">
              {['Recently Sales', 'Account Rank', 'User Spending Rank', 'Category Rank', 'Tag Rank'].map(
                (label, index) => (
                  <span
                    className={`trans-200 line-clamp-1 block max-w-[100px] cursor-pointer text-ellipsis text-nowrap rounded-t-lg border border-b-0 px-2 py-1 ${
                      tab === index + 1 ? 'border-transparent bg-dark-100 text-white' : ''
                    }`}
                    onClick={() => setTab(index + 1)}
                    title={label}
                    key={index}
                  >
                    {label}
                  </span>
                )
              )}
            </div>
            <div className="rounded-lg border p-21 shadow-lg">{tabs[tab - 1]}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage

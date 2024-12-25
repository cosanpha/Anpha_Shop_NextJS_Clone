import { ICategory } from '@/models/CategoryModel'
import moment from 'moment'

// MARK: Revenue
const calculateRevenue = (orders: any[], date: Date | string, interval: string) => {
  const startOfInterval = moment(date).startOf(interval as moment.unitOfTime.StartOf)
  const endOfInterval = moment(date).endOf(interval as moment.unitOfTime.StartOf)

  const filteredOrders = orders.filter(order =>
    moment(order.createdAt).isBetween(startOfInterval, endOfInterval, undefined, '[]')
  )

  const revenue = filteredOrders.reduce((total, order) => total + order.total, 0)
  return revenue
}

export const revenueStatCalc = (orders: any) => {
  const currentDate = moment()

  // prev day, month, year
  const lastDay = moment(currentDate).subtract(1, 'days')
  const lastMonth = moment(currentDate).subtract(1, 'months')
  const lastYear = moment(currentDate).subtract(1, 'years')

  // revenues
  const revenueToday = calculateRevenue(orders, currentDate.toDate(), 'day')
  const revenueYesterday = calculateRevenue(orders, lastDay.toDate(), 'day')
  const revenueThisMonth = calculateRevenue(orders, currentDate.toDate(), 'month')
  const revenueLastMonth = calculateRevenue(orders, lastMonth.toDate(), 'month')
  const revenueThisYear = calculateRevenue(orders, currentDate.toDate(), 'year')
  const revenueLastYear = calculateRevenue(orders, lastYear.toDate(), 'year')

  // build revenue stat
  const revenueStat = {
    day: [
      revenueToday,
      revenueYesterday,
      (((revenueToday - revenueYesterday) / revenueYesterday) * 100 || 0).toFixed(2),
    ],
    month: [
      revenueThisMonth,
      revenueLastMonth,
      (((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 || 0).toFixed(2),
    ],
    year: [
      revenueThisYear,
      revenueLastYear,
      (((revenueThisYear - revenueLastYear) / revenueLastYear) * 100 || 0).toFixed(2),
    ],
  }

  return revenueStat
}

// MARK: New Order
const calculateNewOrders = (orders: any[], startDate: Date | string, endDate: Date | string) => {
  const filteredOrders = orders.filter(order =>
    moment(order.createdAt).isBetween(startDate, endDate, undefined, '[]')
  )

  return filteredOrders.length
}

export const newOrderStatCalc = (orders: any[]) => {
  const currentDate = moment()

  // prev day, month, year
  const lastDay = moment(currentDate).subtract(1, 'days')
  const lastMonth = moment(currentDate).subtract(1, 'months')
  const lastYear = moment(currentDate).subtract(1, 'years')

  // new orders
  const newOrdersToday = calculateNewOrders(
    orders,
    currentDate.startOf('day').toDate(),
    currentDate.endOf('day').toDate()
  )
  const newOrdersYesterday = calculateNewOrders(
    orders,
    lastDay.startOf('day').toDate(),
    lastDay.endOf('day').toDate()
  )
  const newOrdersThisMonth = calculateNewOrders(
    orders,
    currentDate.startOf('month').toDate(),
    currentDate.endOf('month').toDate()
  )
  const newOrdersLastMonth = calculateNewOrders(
    orders,
    lastMonth.startOf('month').toDate(),
    lastMonth.endOf('month').toDate()
  )
  const newOrdersThisYear = calculateNewOrders(
    orders,
    currentDate.startOf('year').toDate(),
    currentDate.endOf('year').toDate()
  )
  const newOrdersLastYear = calculateNewOrders(
    orders,
    lastYear.startOf('year').toDate(),
    lastYear.endOf('year').toDate()
  )

  // build new order stat
  const newOrderStat = {
    day: [
      newOrdersToday,
      newOrdersYesterday,
      (((newOrdersToday - newOrdersYesterday) / newOrdersYesterday) * 100 || 0).toFixed(2),
    ],
    month: [
      newOrdersThisMonth,
      newOrdersLastMonth,
      (((newOrdersThisMonth - newOrdersLastMonth) / newOrdersLastMonth) * 100 || 0).toFixed(2),
    ],
    year: [
      newOrdersThisYear,
      newOrdersLastYear,
      (((newOrdersThisYear - newOrdersLastYear) / newOrdersLastYear) * 100 || 0).toFixed(2),
    ],
  }

  return newOrderStat
}

// MARK: New User
const calculateNewUsers = (orders: any[], startDate: Date | string, endDate: Date | string) => {
  let newUserEmails: string[] = []
  orders.forEach(order => {
    if (moment(order.createdAt).isBetween(startDate, endDate, undefined, '[]')) {
      const email = order.email
      if (!newUserEmails.includes(email)) {
        newUserEmails.push(email)
      }
    }
  })
  return newUserEmails.length
}

export const newUserStatCalc = (users: any[]) => {
  const currentDate = moment()

  // prev day, month, year
  const lastDay = moment(currentDate).subtract(1, 'days')
  const lastMonth = moment(currentDate).subtract(1, 'months')
  const lastYear = moment(currentDate).subtract(1, 'years')

  // new users
  const newUsersToday = calculateNewUsers(
    users,
    currentDate.startOf('day').toDate(),
    currentDate.endOf('day').toDate()
  )
  const newUsersYesterday = calculateNewUsers(
    users,
    lastDay.startOf('day').toDate(),
    lastDay.endOf('day').toDate()
  )
  const newUsersThisMonth = calculateNewUsers(
    users,
    currentDate.startOf('month').toDate(),
    currentDate.endOf('month').toDate()
  )
  const newUsersLastMonth = calculateNewUsers(
    users,
    lastMonth.startOf('month').toDate(),
    lastMonth.endOf('month').toDate()
  )
  const newUsersThisYear = calculateNewUsers(
    users,
    currentDate.startOf('year').toDate(),
    currentDate.endOf('year').toDate()
  )
  const newUsersLastYear = calculateNewUsers(
    users,
    lastYear.startOf('year').toDate(),
    lastYear.endOf('year').toDate()
  )

  // build new user stat
  const newUserStat = {
    day: [
      newUsersToday,
      newUsersYesterday,
      (((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100 || 0).toFixed(2),
    ],
    month: [
      newUsersThisMonth,
      newUsersLastMonth,
      (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 || 0).toFixed(2),
    ],
    year: [
      newUsersThisYear,
      newUsersLastYear,
      (((newUsersThisYear - newUsersLastYear) / newUsersLastYear) * 100 || 0).toFixed(2),
    ],
  }

  return newUserStat
}

// MARK: New Account Sold
const calculateNewAccountsSold = (orders: any[], startDate: Date | string, endDate: Date | string) => {
  let newAccounts = 0
  orders.forEach(order => {
    if (moment(order.createdAt).isBetween(startDate, endDate, undefined, '[]')) {
      order.items.forEach((item: any) => {
        newAccounts += item.accounts.length
      })
    }
  })
  return newAccounts
}

export const newAccountSoldStatCalc = (orders: any[]) => {
  const currentDate = moment()

  // prev day, month, year
  const lastDay = moment(currentDate).subtract(1, 'days')
  const lastMonth = moment(currentDate).subtract(1, 'months')
  const lastYear = moment(currentDate).subtract(1, 'years')

  // new accounts sold
  const newAccountsSoldToday = calculateNewAccountsSold(
    orders,
    currentDate.startOf('day').toDate(),
    currentDate.endOf('day').toDate()
  )
  const newAccountsSoldYesterday = calculateNewAccountsSold(
    orders,
    lastDay.startOf('day').toDate(),
    lastDay.endOf('day').toDate()
  )
  const newAccountsSoldThisMonth = calculateNewAccountsSold(
    orders,
    currentDate.startOf('month').toDate(),
    currentDate.endOf('month').toDate()
  )
  const newAccountsSoldLastMonth = calculateNewAccountsSold(
    orders,
    lastMonth.startOf('month').toDate(),
    lastMonth.endOf('month').toDate()
  )
  const newAccountsSoldThisYear = calculateNewAccountsSold(
    orders,
    currentDate.startOf('year').toDate(),
    currentDate.endOf('year').toDate()
  )
  const newAccountsSoldLastYear = calculateNewAccountsSold(
    orders,
    lastYear.startOf('year').toDate(),
    lastYear.endOf('year').toDate()
  )

  // build new account sold stat
  const newAccountSoldStat = {
    day: [
      newAccountsSoldToday,
      newAccountsSoldYesterday,
      (
        ((newAccountsSoldToday - newAccountsSoldYesterday) / newAccountsSoldYesterday) * 100 || 0
      ).toFixed(2),
    ],
    month: [
      newAccountsSoldThisMonth,
      newAccountsSoldLastMonth,
      (
        ((newAccountsSoldThisMonth - newAccountsSoldLastMonth) / newAccountsSoldLastMonth) * 100 || 0
      ).toFixed(2),
    ],
    year: [
      newAccountsSoldThisYear,
      newAccountsSoldLastYear,
      (
        ((newAccountsSoldThisYear - newAccountsSoldLastYear) / newAccountsSoldLastYear) * 100 || 0
      ).toFixed(2),
    ],
  }

  return newAccountSoldStat
}

// MARK: Used Voucher
const calculateUsedVouchers = (orders: any[], startDate: Date | string, endDate: Date | string) => {
  let usedVouchers = 0
  orders.forEach(order => {
    if (moment(order.createdAt).isBetween(startDate, endDate, undefined, '[]')) {
      if (order.discount && order.discount !== 0) {
        usedVouchers++
      }
    }
  })
  return usedVouchers
}

export const newUsedVoucherStatCalc = (orders: any[]) => {
  const currentDate = moment()

  // prev day, month, year
  const lastDay = moment(currentDate).subtract(1, 'days')
  const lastMonth = moment(currentDate).subtract(1, 'months')
  const lastYear = moment(currentDate).subtract(1, 'years')

  // used vouchers
  const usedVouchersToday = calculateUsedVouchers(
    orders,
    currentDate.startOf('day').toDate(),
    currentDate.endOf('day').toDate()
  )
  const usedVouchersYesterday = calculateUsedVouchers(
    orders,
    lastDay.startOf('day').toDate(),
    lastDay.endOf('day').toDate()
  )
  const usedVouchersThisMonth = calculateUsedVouchers(
    orders,
    currentDate.startOf('month').toDate(),
    currentDate.endOf('month').toDate()
  )
  const usedVouchersLastMonth = calculateUsedVouchers(
    orders,
    lastMonth.startOf('month').toDate(),
    lastMonth.endOf('month').toDate()
  )
  const usedVouchersThisYear = calculateUsedVouchers(
    orders,
    currentDate.startOf('year').toDate(),
    currentDate.endOf('year').toDate()
  )
  const usedVouchersLastYear = calculateUsedVouchers(
    orders,
    lastYear.startOf('year').toDate(),
    lastYear.endOf('year').toDate()
  )

  // build used voucher stat
  const newUsedVoucherStat = {
    day: [
      usedVouchersToday,
      usedVouchersYesterday,
      (((usedVouchersToday - usedVouchersYesterday) / usedVouchersYesterday) * 100 || 0).toFixed(2),
    ],
    month: [
      usedVouchersThisMonth,
      usedVouchersLastMonth,
      (((usedVouchersThisMonth - usedVouchersLastMonth) / usedVouchersLastMonth) * 100 || 0).toFixed(2),
    ],
    year: [
      usedVouchersThisYear,
      usedVouchersLastYear,
      (((usedVouchersThisYear - usedVouchersLastYear) / usedVouchersLastYear) * 100 || 0).toFixed(2),
    ],
  }

  return newUsedVoucherStat
}

// MARK: Revenue By Account Rank
export const rankAccountRevenue = (orders: any[], categories: ICategory[]) => {
  const accs: any = []

  // export accounts from orders
  orders.forEach(order => {
    const items: any[] = order.items
    const discount = order.discount || 0
    const quantity = items.reduce((qty, item) => qty + item.quantity, 0)

    items.forEach(item => {
      const { product } = item
      const { flashSale } = product

      let price = product.price
      if (flashSale) {
        switch (flashSale.type) {
          case 'fixed-reduce': {
            price = price + +flashSale.value >= 0 ? price + +flashSale.value : 0
            break
          }
          case 'fixed': {
            price = +flashSale.value
            break
          }
          case 'percentage': {
            price = price + Math.floor((price * parseFloat(flashSale.value)) / 100)
            break
          }
        }
      }

      price = price - discount / quantity
      const accounts: any[] = item.accounts
      accounts.forEach(account => {
        let category = null
        if (typeof product.category === 'string') {
          category = categories.find(c => c._id === product.category)
        } else {
          category = categories.find(c => c._id === product.category._id)
        }

        accs.push({
          ...account,
          price,
          category,
        })
      })
    })
  })

  const categoryAccountsMap: { [key: string]: any[] } = {}
  accs.forEach((acc: any) => {
    const slug: string = acc.category.slug

    if (!categoryAccountsMap[slug]) {
      categoryAccountsMap[slug] = [acc]
    } else {
      categoryAccountsMap[slug].push(acc)
    }
  })

  const groupAccountsByEmail = (categoryAccountsMap: { [key: string]: any[] }) => {
    const groupedAccountsByEmail: { [key: string]: { [key: string]: any[] } } = {}

    for (const category in categoryAccountsMap) {
      if (categoryAccountsMap.hasOwnProperty(category)) {
        const accounts = categoryAccountsMap[category]

        const groupedByEmail: { [key: string]: any[] } = {}

        accounts.forEach((account, index) => {
          const emailMatch = account.info.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

          if (emailMatch) {
            const email = emailMatch[0]

            if (!groupedByEmail[email]) {
              groupedByEmail[email] = [account]
            } else {
              groupedByEmail[email].push(account)
            }
          }
        })

        groupedAccountsByEmail[category] = groupedByEmail
      }
    }

    return groupedAccountsByEmail
  }

  // Sử dụng hàm để nhóm các accounts lại dựa trên email
  const groupedAccountsByEmail = groupAccountsByEmail(categoryAccountsMap)

  const accounts = Object.entries(groupedAccountsByEmail).map(([_, accountByEmailGroups]) => {
    return Object.entries(accountByEmailGroups)
      .map(([email, accounts]) => {
        const totalRevenue = accounts.reduce((total, account) => total + account.price, 0)
        return {
          email,
          category: accounts[0].category,
          revenue: totalRevenue.toFixed(2),
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
  })

  return accounts.flat()
}

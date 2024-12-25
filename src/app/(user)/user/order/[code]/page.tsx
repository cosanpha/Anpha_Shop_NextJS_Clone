'use client'

import CartItem from '@/components/CartItem'
import Divider from '@/components/Divider'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { IAccount } from '@/models/AccountModel'
import { IOrder } from '@/models/OrderModel'
import { IVoucher } from '@/models/VoucherModel'
import { getOrderApi } from '@/requests'
import { formatPrice } from '@/utils/number'
import { formatTime } from '@/utils/time'
import { Fragment, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { IoIosHelpCircle } from 'react-icons/io'

function OrderDetailPage({ params: { code } }: { params: { code: string } }) {
  // hooks
  const dispatch = useAppDispatch()

  // states
  const [order, setOrder] = useState<IOrder | null>(null)

  // MARK: Get Data
  // get order
  useEffect(() => {
    const getOrder = async () => {
      // start page loading
      dispatch(setPageLoading(true))

      try {
        const { order } = await getOrderApi(code)

        // set order to state
        setOrder(order)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop page loading
        dispatch(setPageLoading(false))
      }
    }

    if (code) {
      getOrder()
    }
  }, [code, dispatch])

  return (
    <div className="-m-3">
      <h1 className="mb-5 font-body text-3xl font-semibold tracking-wide">
        CHI TIẾT ĐƠN HÀNG: <span className="font-sans text-secondary">{order?.code}</span>
      </h1>

      <Divider
        size={5}
        border
      />

      {/* MARK: Info */}
      <div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2">
        <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          <span className="font-semibold">Ngày mua: </span>
          {order && <span className="">{formatTime(order.createdAt)}</span>}
        </div>
        <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          <span className="font-semibold">Trạng thái: </span>
          <span
            className={`${
              order?.status === 'pending'
                ? 'text-yellow-500'
                : order?.status === 'done'
                  ? 'text-green-500'
                  : 'text-slate-400'
            }`}
          >
            {order?.status === 'pending'
              ? 'Đang xử lí'
              : order?.status === 'done'
                ? 'Hoàn tất'
                : 'Đã hủy'}
          </span>
        </div>
        <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          <span className="font-semibold">Email: </span>
          <span className="text-sky-500">{order?.email}</span>
        </div>
        <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
          <span className="font-semibold">Tổng tiền: </span>
          <span className="font-semibold text-green-500">{formatPrice(order?.total)}</span>
        </div>
        {order?.voucherApplied && (
          <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
            <span className="font-semibold">Voucher: </span>
            <span
              className="font-semibold text-slate-400"
              title={(order?.voucherApplied as IVoucher).desc}
            >
              {(order?.voucherApplied as IVoucher).code}
            </span>
          </div>
        )}
        {!!order?.discount && (
          <div className="trans-200 rounded-xl px-4 py-2 shadow-lg hover:tracking-wide">
            <span className="font-semibold">Giảm giá: </span>
            <span className="font-semibold text-secondary">{formatPrice(order?.discount)}</span>
          </div>
        )}
      </div>

      <Divider size={6} />

      {/* MARK: Product */}
      <h3 className="mb-4 text-2xl font-semibold">SẢN PHẨM</h3>

      {order?.items.map(item => (
        <div
          className="relative mb-5 pl-21/2"
          key={item.product._id}
        >
          <div className="absolute left-0 top-1/2 h-[88%] w-px -translate-y-1/2 bg-slate-200" />

          <div className="rounded-medium border border-slate-300 p-21/2 shadow-lg">
            <CartItem
              cartItem={item}
              isCheckout
              localCartItem
              isOrderDetailProduct
            />

            {order.status === 'done' ? (
              item.accounts.map((account: IAccount) => (
                <Fragment key={account._id}>
                  <hr className="mb-3 mt-5" />

                  <div className="mt-2 max-h-[200px] w-full overflow-auto whitespace-pre break-all rounded-xl border border-slate-300 p-4 font-body text-sm tracking-wide">
                    {account.info.split('\n').map((line, index) => (
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
                              navigator.clipboard.writeText(word)
                              toast.success('Đã sao chép: ' + word)
                            }}
                          >
                            {word}{' '}
                          </span>
                        ))}
                      </span>
                    ))}
                  </div>
                </Fragment>
              ))
            ) : (
              <p
                className={`mt-6 text-center italic ${
                  order.status === 'pending' ? 'text-yellow-500' : 'text-slate-400'
                } border-t border-slate-200 pt-2`}
              >
                {order.status === 'pending' ? 'Đang xử lí' : 'Đã hủy'}
              </p>
            )}

            {order.status === 'done' && (
              <p className="mt-2 flex items-center gap-1 text-slate-500">
                <IoIosHelpCircle size={20} /> Ấn để sao chép từng phần
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderDetailPage

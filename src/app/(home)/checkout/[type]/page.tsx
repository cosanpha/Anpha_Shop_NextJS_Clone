'use client'

import CartItem from '@/components/CartItem'
import Divider from '@/components/Divider'
import { admins } from '@/constansts'
import { useAppDispatch } from '@/libs/hooks'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { ICartItem } from '@/models/CartItemModel'
import { formatPrice } from '@/utils/number'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FaBookOpen } from 'react-icons/fa'
import { FaCopy } from 'react-icons/fa6'
import { IoIosHelpCircle, IoMdArrowRoundBack } from 'react-icons/io'

function CheckoutPage({ params }: { params: { type: string } }) {
  // hooks
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [checkout, setCheckout] = useState<any>(null)

  // values
  const admin = admins[(process.env.NEXT_PUBLIC_ADMIN! as keyof typeof admins) || 'KHOA']
  const type: string = params.type

  // MARK: Get Data
  // get checkout from local storage
  useEffect(() => {
    // stop page loading initially
    dispatch(setPageLoading(false))

    const checkout = JSON.parse(localStorage.getItem('checkout') ?? 'null')

    if (!checkout) {
      // start page loading for redirecting
      dispatch(setPageLoading(true))
      toast.error('Đang quay lại giỏ hàng...')
      router.push('/cart')
    } else {
      setCheckout(checkout)
    }
  }, [router, dispatch])

  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép: ' + text)
  }, [])

  return (
    <div className="mt-20 grid grid-cols-1 gap-8 overflow-x-auto rounded-medium bg-white p-8 pb-16 text-dark shadow-medium lg:grid-cols-12">
      {/* MARK: Payment info */}
      <div className="order-2 col-span-1 lg:order-first lg:col-span-7">
        {type === 'momo' ? (
          <h1 className="text-center text-4xl font-semibold text-[#a1396c]">Thanh toán Momo</h1>
        ) : (
          <h1 className="text-center text-4xl font-semibold text-[#62b866]">Thanh toán BANKING</h1>
        )}

        <div className="pt-4" />

        <p className="mb-2 font-semibold text-secondary">
          * Hãy chuyển vào tài khoản bên dưới với nội dung sau:{' '}
        </p>

        {type === 'momo' ? (
          <a href="https://me.momo.vn/anphashop">
            Ấn vào link sau để chuyển nhanh:{' '}
            <span className="text-[#a1396c] underline">Link thanh toán bằng Momo</span>
          </a>
        ) : (
          <a
            href={`https://dl.vietqr.io/pay?app=vcb&ba=1040587211@vcb&am=${checkout?.total}&tn=${checkout?.code}`}
          >
            Ấn vào link sau để chuyển nhanh:{' '}
            <span className="text-[#62b866] underline">Link thanh toán bằng Vietcombank</span>
          </a>
        )}

        <div className="rounded-md border border-slate-400 px-4 py-2">
          {type === 'banking' && (
            <div>
              Ngân hàng:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-[#399162]"
                onClick={() => handleCopy(admin.banking.name)}
              >
                <span className="px-2 py-0.5">{admin.banking.name}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
          )}
          {type === 'momo' ? (
            <div>
              Số tài khoản Momo:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-[#a1396c]"
                onClick={() => handleCopy(admin.momo.account)}
              >
                <span className="px-2 py-0.5">{admin.momo.account}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-0.5">
              Số tài khoản:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-secondary"
                onClick={() => handleCopy(admin.banking.account)}
              >
                <span className="px-2 py-0.5">{admin.banking.account}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
          )}
          {checkout?.total >= 0 && (
            <div className="mt-0.5">
              Số tiền chuyển:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-green-500"
                onClick={() => handleCopy(checkout?.total)}
              >
                <span className="px-2 py-0.5">{formatPrice(checkout?.total)}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
          )}
          {checkout?.code && (
            <div className="mt-0.5">
              Nội dung chuyển khoản:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-yellow-500"
                onClick={() => handleCopy(checkout?.code)}
              >
                <span className="px-2 py-0.5">{checkout?.code}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
          )}
        </div>
        <p className="mb-1 flex items-center gap-1 text-slate-500">
          <IoIosHelpCircle size={20} /> Ấn để sao chép
        </p>

        <p className="">
          Tài khoản sẽ được gửi cho bạn qua email:{' '}
          <span
            className="cursor-pointer text-green-500 underline"
            onClick={() => handleCopy(checkout?.email)}
          >
            {checkout?.email}
          </span>{' '}
          sau khi đã thanh toán.
        </p>

        <div className="mt-6 flex justify-center">
          <div className="relative overflow-hidden rounded-lg shadow-medium transition duration-300 hover:-translate-y-2">
            {type === 'momo' ? (
              <>
                <Image
                  src={admin.momo.image}
                  height={700}
                  width={350}
                  alt="momo-qr"
                />
                <Image
                  className="absolute left-1/2 top-[56%] w-[58%] -translate-x-1/2 -translate-y-[50%]"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=2|99|${admin.momo.account}|||0|0|${checkout?.total}|${checkout?.code}|transfer_p2p`}
                  height={700}
                  width={350}
                  alt="momo-qr"
                />
                <Image
                  className="absolute left-1/2 top-[56%] w-[12%] -translate-x-1/2 -translate-y-[50%] rounded-md bg-[#333] p-1"
                  src="/images/logo.jpg"
                  height={42}
                  width={42}
                  alt="momo-qr"
                />
              </>
            ) : (
              <>
                <Image
                  src={admin.banking.image}
                  height={700}
                  width={350}
                  alt="banking-qr"
                />
                <Image
                  className="absolute left-1/2 top-[41%] w-[47%] -translate-x-1/2 -translate-y-[50%]"
                  src={`https://img.vietqr.io/image/970436-1040587211-eeua38J.jpg?amount=${
                    checkout?.total
                  }&addInfo=${encodeURI(checkout?.code)}&accountName=${admin.banking.receiver}`}
                  height={700}
                  width={350}
                  alt="banking-qr"
                />
              </>
            )}
          </div>
        </div>

        {/* MARK: Action Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-21 gap-y-21/2 font-body tracking-wide lg:hidden">
          <Link
            href={`/user/order/${checkout?.code}`}
            className="trans-200 group flex items-center justify-center gap-2 rounded-lg bg-primary px-21 py-3 hover:bg-secondary hover:text-white"
            onClick={e => {
              if (!curUser?._id) {
                e.preventDefault()
                toast.error('Bạn cần có tài khoản để có thể xem thông tin đơn hàng ngay khi mua')
              } else {
                localStorage.removeItem('checkout')
              }
            }}
            title="Xem đơn hàng ngay"
          >
            <FaBookOpen
              size={18}
              className="wiggle mb-[-2px] flex-shrink-0"
            />
            <span className="line-clamp-1 text-ellipsis">Xem đơn hàng ngay</span>
          </Link>
          <a
            href={`/cart`}
            className="trans-200 group flex items-center justify-center gap-2 rounded-lg bg-slate-300 px-21 py-3 hover:bg-secondary hover:text-white"
            title="Quay lại giỏ hàng"
            onClick={() => localStorage.removeItem('checkout')}
          >
            <IoMdArrowRoundBack
              size={18}
              className="wiggle mb-[-2px] flex-shrink-0"
            />
            <span className="line-clamp-1 text-ellipsis">Quay lại giỏ hàng</span>
          </a>
        </div>
      </div>

      {/* MARK: Cart items */}
      <div className="col-span-1 lg:col-span-5">
        <h1 className="text-center text-3xl font-semibold">Sản phẩm</h1>

        <Divider size={5} />

        <div>
          {checkout?.items.map((cartItem: ICartItem, index: number) => (
            <CartItem
              cartItem={cartItem}
              className={index != 0 ? 'mt-4' : ''}
              key={cartItem._id}
              localCartItem
              isCheckout
            />
          ))}

          <Divider
            size={7}
            border
          />

          {!!checkout?.discount && (
            <div className="flex items-center justify-between">
              <span>Ưu đãi:</span>
              <span className="font-semibold text-yellow-500">
                {formatPrice(checkout?.discount || 0)}
              </span>
            </div>
          )}

          <div className="mb-4 flex items-end justify-between">
            <span className="text-xl font-semibold">Thành tiền:</span>
            <span className="text-3xl font-semibold text-green-500">
              {formatPrice(checkout?.total || 0)}
            </span>
          </div>

          {/* MARK: Action Buttons */}
          <div className="mt-6 hidden flex-wrap justify-center gap-x-21 gap-y-21/2 font-body tracking-wide sm:flex">
            <Link
              href={`/user/order/${checkout?.code}`}
              className="trans-200 group flex items-center justify-center gap-2 rounded-lg bg-primary px-21 py-3 hover:bg-secondary hover:text-white"
              onClick={e => {
                if (!curUser?._id) {
                  e.preventDefault()
                  toast.error('Bạn cần có tài khoản để có thể xem thông tin đơn hàng ngay khi mua')
                } else {
                  localStorage.removeItem('checkout')
                }
              }}
              title="Xem đơn hàng ngay"
            >
              <FaBookOpen
                size={18}
                className="wiggle mb-[-2px] flex-shrink-0"
              />
              <span className="line-clamp-1 text-ellipsis">Xem đơn hàng ngay</span>
            </Link>
            <a
              href={`/cart`}
              className="trans-200 group flex items-center justify-center gap-2 rounded-lg bg-slate-300 px-21 py-3 hover:bg-secondary hover:text-white"
              title="Quay lại giỏ hàng"
              onClick={() => localStorage.removeItem('checkout')}
            >
              <IoMdArrowRoundBack
                size={18}
                className="wiggle mb-[-2px] flex-shrink-0"
              />
              <span className="line-clamp-1 text-ellipsis">Quay lại giỏ hàng</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

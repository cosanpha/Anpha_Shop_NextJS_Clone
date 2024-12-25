'use client'

import { CartItemToAdd } from '@/app/api/cart/add/route'
import CartItem from '@/components/CartItem'
import Divider from '@/components/Divider'
import Input from '@/components/Input'
import { blackEmails } from '@/constansts/blackList'
import { commonEmailMistakes } from '@/constansts/mistakes'
import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import {
  addCartItem,
  setCartItems,
  setLocalCartItems,
  setSelectedItems,
} from '@/libs/reducers/cartReducer'
import { setLoading, setPageLoading } from '@/libs/reducers/modalReducer'
import { ICartItem } from '@/models/CartItemModel'
import { IProduct } from '@/models/ProductModel'
import { IVoucher } from '@/models/VoucherModel'
import { addToCartApi, applyVoucherApi, createOrderApi } from '@/requests'
import { applyFlashSalePrice, calcPercentage, formatPrice } from '@/utils/number'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaArrowCircleDown, FaPlusSquare } from 'react-icons/fa'
import { FaCartShopping } from 'react-icons/fa6'
import { MdEmail } from 'react-icons/md'
import { RiCoupon2Fill, RiDonutChartFill } from 'react-icons/ri'

function CartPage() {
  // hooks
  const dispatch = useAppDispatch()
  const queryParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const curUser: any = session?.user

  // store
  const balance = useAppSelector(state => state.user.balance)
  const isLoading = useAppSelector(state => state.modal.isLoading)
  let localCartItems = useAppSelector(state => state.cart.localItems)
  let cartItems = useAppSelector(state => state.cart.items)
  const selectedItems = useAppSelector(state => state.cart.selectedItems)

  // states
  const [voucher, setVoucher] = useState<IVoucher | null>(null)
  const [voucherMessage, setVoucherMessage] = useState<string>('')
  const [subTotal, setSubTotal] = useState<number>(0)
  const [discount, setDiscount] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [cartLength, setCartLength] = useState<number>(0)
  const [items, setItems] = useState<ICartItem[]>([])
  const [localItems, setLocalItems] = useState<ICartItem[]>([])

  // loading and showing
  const [isShowVoucher, setIsShowVoucher] = useState<boolean>(false)
  const [isBuying, setIsBuying] = useState<boolean>(false)

  // form
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
    clearErrors,
  } = useForm<FieldValues>({
    defaultValues: {
      email: curUser?.email || '',
      code: '',
    },
  })

  // MARK: Auto functions
  // auto get cart length
  useEffect(() => {
    // stop page loading
    dispatch(setPageLoading(false))

    if (curUser) {
      setCartLength(cartItems.reduce((total, item) => total + item.quantity, 0))
      setItems(cartItems)
      setLocalItems(localCartItems)
    } else {
      setCartLength(localCartItems.reduce((total, item) => total + item.quantity, 0))
      setItems(localCartItems)
    }
  }, [cartItems, localCartItems, curUser, dispatch])

  // auto calc total, discount, subTotal
  useEffect(() => {
    const subTotal = selectedItems.reduce((total, cartItem) => {
      const item: any = items.find(cI => cI._id === cartItem._id)

      return (
        total +
        (item?.quantity ?? 0) * (applyFlashSalePrice(item?.product.flashSale, item?.product.price) ?? 0)
      )
    }, 0)
    setSubTotal(subTotal)

    let finalTotal = subTotal
    let discount = 0
    if (voucher) {
      if (voucher.type === 'fixed-reduce') {
        discount = +voucher.value
        finalTotal = subTotal + discount < 0 ? 0 : subTotal + discount
      } else if (voucher.type === 'fixed') {
        discount = +voucher.value
        finalTotal = discount
      } else if (voucher.type === 'percentage') {
        discount = +calcPercentage(voucher.value, subTotal)
        if (Math.abs(discount) > voucher.maxReduce) {
          discount = -voucher.maxReduce
        }
        finalTotal = subTotal + discount < 0 ? 0 : subTotal + discount
      }
    }
    setDiscount(discount)
    setTotal(finalTotal)
  }, [selectedItems, voucher, items])

  // auto select cart item
  useEffect(() => {
    const selectedItems = items.filter(item =>
      queryParams.getAll('product').includes((item.product as IProduct).slug)
    )

    dispatch(setSelectedItems(selectedItems))
  }, [queryParams, items, dispatch])

  // MARK: Api functions
  // send request to server to check voucher
  const handleApplyVoucher: SubmitHandler<FieldValues> = useCallback(
    async data => {
      if (selectedItems.length) {
        // start loading
        dispatch(setLoading(true))

        try {
          // send request to server
          const { voucher, message } = await applyVoucherApi(data.code, data.email, subTotal)

          // set voucher to state
          setVoucher(voucher)
          setVoucherMessage(message)

          // show success message
          toast.success(message)
        } catch (err: any) {
          console.log(err)
          const { message } = err
          toast.error(message)
          setVoucherMessage(message)
        } finally {
          // stop loading
          dispatch(setLoading(false))
        }
      } else {
        toast.error('Hãy chọn sản phẩm để tiến hành nhập voucher')
      }
    },
    [dispatch, selectedItems.length, subTotal]
  )

  // move all local items to global items
  const handleMoveAllLocalToGlobalCartItem = useCallback(async () => {
    // start loading
    dispatch(setLoading(true))

    try {
      // send request to add product to cart
      const { cartItems, message, errors } = await addToCartApi(
        localItems.map(
          item =>
            ({
              productId: item.productId,
              quantity: item.quantity,
            }) as CartItemToAdd
        )
      )

      // show toast success
      if (message) {
        toast.success(message)
      }
      if (errors.notEnough) {
        toast.error(errors.notEnough)
      }
      if (errors.notFound) {
        toast.error(errors.notFound)
      }

      // add cart item to state
      dispatch(addCartItem(cartItems))

      // clear LOCAL cart item
      dispatch(setLocalCartItems([]))
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      dispatch(setLoading(false))
    }
  }, [dispatch, localItems])

  // validate before checkout
  const handleValidateBeforeCheckout = useCallback(() => {
    let isValid = true
    if (!selectedItems.length || !total) {
      toast.error('Hãy chọn sản phẩm để tiến hành thanh toán')
      isValid = false
    }

    if (!curUser && !getValues('email')) {
      setError('email', { message: 'Email không được để trống' })
      isValid = false
    } else {
      const email = getValues('email')
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i

      if (!emailRegex.test(email)) {
        setError('email', { message: 'Email không hợp lệ' })
        isValid = false
      } else {
        if (commonEmailMistakes.some(mistake => email.toLowerCase().endsWith(mistake))) {
          setError('email', { message: 'Email không hợp lệ' })
          isValid = false
        }
      }
    }

    // total = 0 but not apply voucher
    if ((!total || total <= 0) && !voucher) {
      toast.error('Hãy chọn sản phẩm để tiến hành thanh toán')
      return
    }

    return isValid
  }, [curUser, getValues, selectedItems.length, setError, total, voucher])

  // MARK: Checkout
  // handle checkout
  const handleCheckout = useCallback(
    async (type: string) => {
      // not in black list
      if (blackEmails.includes(getValues('email'))) {
        toast.error('Không thể thực hiện giao dịch này')
        return
      }

      // validate before checkout
      if (!handleValidateBeforeCheckout()) return

      // start page loading
      dispatch(setPageLoading(true))

      try {
        // handle confirm payment
        const items = (selectedItems as any).map((cartItem: ICartItem) => ({
          _id: cartItem._id,
          product: cartItem.product,
          quantity: cartItem.quantity,
        }))

        // send request to server to create order
        const { code } = await createOrderApi(
          curUser?.email || getValues('email'),
          total,
          voucher?._id,
          discount,
          items,
          type
        )

        // create checkout
        const checkout = {
          items,
          code,
          email: curUser?.email || getValues('email'),
          voucher,
          discount,
          total,
        }
        localStorage.setItem('checkout', JSON.stringify(checkout))

        // remove cart items if is LOCAL cart
        const asd = localCartItems.filter(
          (item: ICartItem) => !selectedItems.map(i => i._id).includes(item._id)
        )

        if (!curUser?._id) {
          dispatch(setLocalCartItems(asd))
        }

        // move to checkout page
        router.push(`/checkout/${type}`)
      } catch (err: any) {
        console.log(err)
      }
    },
    [
      dispatch,
      getValues,
      handleValidateBeforeCheckout,
      router,
      selectedItems,
      voucher,
      discount,
      total,
      curUser,
      localCartItems,
    ]
  )

  // MARK: Buy with balance
  const handleBuyWithBalance = useCallback(async () => {
    // check user
    if (!curUser) {
      toast.error('Hãy đăng nhập để thực hiện chức năng này')
      return
    }

    // not enough money
    if (curUser && balance < total) {
      toast.error('Số dư không đủ để thực hiện giao dịch này')
      return
    }

    // not in black list
    if (blackEmails.includes(curUser?.email)) {
      toast.error('Không thể thực hiện giao dịch này')
      return
    }

    // validate before checkout
    if (!handleValidateBeforeCheckout()) return

    // start loading
    setIsBuying(true)

    try {
      // const { orderCode } = await generateOrderCodeApi() // cache: no-store

      const items = selectedItems.map((cartItem: ICartItem) => ({
        _id: cartItem._id,
        product: cartItem.product,
        quantity: cartItem.quantity,
      })) as ICartItem[]

      // send request to server to create order
      const { removedCartItems, message } = await createOrderApi(
        // orderCode,
        curUser.email,
        total,
        voucher?._id,
        discount,
        items,
        'balance'
      )

      // remove cart items in store
      dispatch(setCartItems(items.filter(item => !removedCartItems.includes(item._id))))

      // show success message
      toast.success(message)

      // redirect to order history page
      router.push('/user/order-history')
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setIsBuying(false)
    }
  }, [
    curUser,
    dispatch,
    handleValidateBeforeCheckout,
    router,
    selectedItems,
    total,
    voucher?._id,
    discount,
    balance,
  ])

  return (
    <div className="mt-20 grid grid-cols-3 gap-21 rounded-medium bg-white p-8 pb-16 text-dark shadow-medium">
      <div className="col-span-3 lg:col-span-2">
        <h1 className="flex items-center gap-2 font-body text-3xl font-semibold">
          <FaCartShopping
            size={30}
            className="wiggle text-dark"
          />
          <span>Giỏ hàng</span>
          <span>
            (<span className="font-normal text-primary">{cartLength}</span>)
          </span>
        </h1>

        <Divider size={6} />

        {/* MARK: Local Cart */}
        {!!localItems.length && curUser && (
          <div className="rounded-medium border border-slate-400 p-3">
            <p className="mb-3 italic text-primary">
              Có một số sản phẩm hiện đang tồn tại trên máy của bạn, bấm vào nút{' '}
              <FaPlusSquare
                size={19}
                className="wiggle inline-block"
              />{' '}
              bên dưới để thêm vào giỏ hàng.
            </p>

            <div
              className="trans-200 group mb-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-dark-200 p-1 text-white hover:bg-primary"
              onClick={handleMoveAllLocalToGlobalCartItem}
            >
              <span>Thêm tất cả</span>
              <FaArrowCircleDown
                size={18}
                className="wiggle-0 inline-block"
              />
            </div>

            <div className="max-h-[386px] overflow-y-auto">
              {localItems.map((cartItem, index) => (
                <CartItem
                  cartItem={cartItem}
                  className={index != 0 ? 'mt-4' : ''}
                  key={index}
                  localCartItem
                />
              ))}
            </div>
          </div>
        )}

        <Divider size={4} />

        {/* MARK: Cart */}
        {items.length ? (
          <div>
            <div className="flex select-none items-center justify-end gap-2 pr-21">
              <label
                htmlFor="selectAll"
                className="cursor-pointer font-semibold"
              >
                {items.length === selectedItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </label>
              <input
                name="selectAll"
                id="selectAll"
                type="checkbox"
                checked={items.length === selectedItems.length}
                onChange={() =>
                  items.length === selectedItems.length
                    ? dispatch(setSelectedItems([]))
                    : dispatch(setSelectedItems(items))
                }
                className="size-5 cursor-pointer accent-primary"
              />
            </div>

            <div className="pt-4" />

            {items.map((cartItem, index) => (
              <CartItem
                cartItem={cartItem}
                className={index != 0 ? 'mt-5' : ''}
                key={index}
              />
            ))}
          </div>
        ) : (
          <p className="text-center">
            Chưa có sản phẩm nào trong giỏ hàng của hàng. Hãy ấn vào{' '}
            <Link
              href="/"
              prefetch={false}
              className="text-sky-500 underline"
            >
              đây
            </Link>{' '}
            để bắt đầu mua hàng.{' '}
            <Link
              href="/"
              prefetch={false}
              className="italic text-sky-500 underline"
            >
              Quay lại
            </Link>
          </p>
        )}
      </div>

      {/* MARK: Summary */}
      <div className="col-span-3 lg:col-span-1">
        <div className="sticky top-[88px] overflow-auto rounded-medium border-2 border-primary bg-sky-50 p-4 shadow-lg lg:mt-[60px]">
          {/* Email */}
          {!curUser && (
            <>
              <p className="mb-2">
                Nhập email của bạn{' '}
                <span className="text-primary">
                  (Email này sẽ được dùng để gửi đơn hàng sau khi mua)
                </span>
              </p>
              <Input
                id="email"
                label="Email"
                disabled={isLoading}
                register={register}
                errors={errors}
                required
                type="email"
                icon={MdEmail}
                className="mb-2"
                onFocus={() => clearErrors('email')}
              />
            </>
          )}

          {/* Voucher */}
          <div className="mb-2">
            Bạn có voucher?{' '}
            <p className="inline text-nowrap">
              (
              <button
                className="z-10 text-sky-600 hover:underline"
                onClick={() => setIsShowVoucher(prev => !prev)}
              >
                ấn vào đây
              </button>
              )
            </p>
          </div>
          <div
            className={`trans-200 mb-2 flex items-center gap-1 overflow-hidden ${
              isShowVoucher ? 'max-h-[200px]' : 'max-h-0'
            }`}
          >
            <Input
              id="code"
              label="Voucher"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
              type="text"
              icon={RiCoupon2Fill}
              onFocus={() => clearErrors('code')}
              className="w-full"
            />
            <button
              className={`trans-200 h-[46px] flex-shrink-0 text-nowrap rounded-lg border px-2 py-2 text-[14px] hover:bg-primary hover:text-white ${
                isLoading
                  ? 'pointer-events-none border-slate-200 bg-slate-200'
                  : 'border-primary text-primary'
              }`}
              onClick={handleSubmit(handleApplyVoucher)}
              disabled={isLoading}
            >
              {isLoading ? (
                <RiDonutChartFill
                  size={26}
                  className="animate-spin text-slate-300"
                />
              ) : (
                'Áp dụng'
              )}
            </button>
          </div>
          {voucherMessage && (
            <p className={`${voucher ? 'text-green-500' : 'text-rose-500'} mb-2`}>{voucherMessage}</p>
          )}

          {/* Total */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <span>Tổng tiền:</span>
            <span className="font-semibold">{formatPrice(subTotal)}</span>
          </div>
          {voucher && (
            <div className="flex items-center justify-between">
              <span>Voucher:</span>
              <span className="font-semibold text-yellow-400">
                {voucher?.type === 'percentage'
                  ? `${voucher.value} (${formatPrice(calcPercentage(voucher.value, subTotal))})`
                  : formatPrice(+voucher?.value!)}
                {voucher?.type === 'percentage' && ` (tối đa ${formatPrice(voucher.maxReduce)})`}
              </span>
            </div>
          )}

          <Divider size={2} />
          <hr />
          <Divider size={2} />

          {/* Final Total */}
          <div className="mb-4 flex items-end justify-between gap-x-3">
            <span className="text-xl font-semibold">Thành tiền:</span>
            <span className="text-3xl font-semibold text-green-500">{formatPrice(total)}</span>
          </div>

          {/* MARK: Payment Methods */}
          <div className="flex select-none flex-col gap-3">
            <button
              className={`trans-200 group flex items-center justify-center gap-1 rounded-xl border border-primary px-3 py-2 hover:bg-primary ${
                isBuying ? 'pointer-events-none' : ''
              }`}
              disabled={isBuying || isLoading}
              onClick={handleBuyWithBalance}
            >
              {isBuying ? (
                <RiDonutChartFill
                  size={32}
                  className="animate-spin text-slate-200"
                />
              ) : (
                <Image
                  className="wiggle-0"
                  src="/images/logo.jpg"
                  height={32}
                  width={32}
                  alt="logo"
                />
              )}
              <span className="ml-1 font-semibold group-hover:text-white">
                Mua bằng số dư{' '}
                {curUser?._id && balance >= 0 ? (
                  <span className="text-xs tracking-tight text-secondary">
                    (hiện có {formatPrice(balance || 0)})
                  </span>
                ) : (
                  ''
                )}
              </span>
            </button>

            <button
              className={`trans-200 group flex items-center justify-center gap-2 rounded-xl border border-[#a1396c] px-3 py-2 hover:bg-[#a1396c] ${
                isBuying || isLoading ? 'pointer-events-none' : ''
              }`}
              onClick={() => handleCheckout('momo')}
              disabled={isBuying || isLoading}
            >
              <Image
                className="wiggle-0 rounded-md border-2 group-hover:border-white"
                src="/images/momo-icon.jpg"
                height={32}
                width={32}
                alt="logo"
              />
              <span className="font-semibold group-hover:text-white">Mua nhanh với Momo</span>
            </button>

            <button
              className={`trans-200 group flex items-center justify-center gap-2 rounded-xl border border-[#62b866] px-3 py-2 hover:bg-[#62b866] ${
                isBuying || isLoading ? 'pointer-events-none' : ''
              }`}
              onClick={() => handleCheckout('banking')}
              disabled={isBuying || isLoading}
            >
              <Image
                className="wiggle-0"
                src="/images/banking-icon.jpg"
                height={32}
                width={32}
                alt="logo"
              />
              <span className="font-semibold group-hover:text-white">Mua ngay với Banking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage

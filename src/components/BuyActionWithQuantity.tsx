'use client'

import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { addCartItem, addLocalCartItem } from '@/libs/reducers/cartReducer'
import { setLoading, setPageLoading } from '@/libs/reducers/modalReducer'
import { ICartItem } from '@/models/CartItemModel'
import { IProduct } from '@/models/ProductModel'
import { addToCartApi } from '@/requests'
import mongoose from 'mongoose'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCartPlus, FaMinus, FaPlus } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'

interface BuyActionWithQuantityProps {
  product: IProduct | null
  className?: string
}

function BuyActionWithQuantity({ product, className = '' }: BuyActionWithQuantityProps) {
  // hooks
  const dispatch = useAppDispatch()
  const isLoading = useAppSelector(state => state.modal.isLoading)
  const localCart = useAppSelector(state => state.cart.localItems)
  const router = useRouter()
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [quantity, setQuantity] = useState<number>(product && product.stock > 0 ? 1 : 0)

  // MARK: Add
  // add product to cart
  const addProductToCart = useCallback(async () => {
    if (product) {
      // start loading
      dispatch(setLoading(true))

      try {
        // send request to add product to cart
        const { cartItems, message, errors } = await addToCartApi([{ productId: product._id, quantity }])

        // show toast success
        toast.success(message)
        if (errors.notEnough) {
          toast.error(errors.notEnough)
        }
        if (errors.notFound) {
          toast.error(errors.notFound)
        }

        // add cart item to state
        dispatch(addCartItem(cartItems))
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      } finally {
        // stop loading
        dispatch(setLoading(false))
      }
    }
  }, [dispatch, product, quantity])

  // add product to cart - LOCAL
  const addProductToLocalCart = useCallback(() => {
    // add product to local cart
    // create cart item from product
    const existingCartItem = localCart.find(
      (item: ICartItem) => item.productId.toString() === product?._id
    )

    // product has already existed in cart
    if (existingCartItem) {
      // if not enough products in stock
      if (existingCartItem.quantity + 1 > (product?.stock || 0)) {
        toast.error('Hiện không đủ sản phẩm để thêm vào giỏ hàng của bạn. Xin lỗi vì sự bất tiện này')
        return
      }

      dispatch(addLocalCartItem({ ...existingCartItem, quantity: existingCartItem.quantity + 1 }))

      // success toast
      toast.success(`Đã thêm gói "${product?.title}" vào giỏ hàng`)
      return
    }

    // product has not existed in user cart
    // if not enough products in stock
    if (1 > (product?.stock || 0)) {
      toast.error('Hiện không đủ sản phẩm để thêm vào giỏ hàng của bạn. Xin lỗi vì sự bất tiện này')
      return
    }

    // still have enough products in stock
    // create new cart item
    const newCartItem = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId: curUser?._id,
      productId: product?._id,
      product,
      quantity: 1,
    }

    // add new cart item to local cart
    dispatch(addLocalCartItem(newCartItem as ICartItem))

    // success toast
    toast.success(`Đã thêm gói "${product?.title}" vào giỏ hàng`)
    return
  }, [curUser?._id, dispatch, localCart, product])

  // MARK: Buy
  // handle buy now (add to cart and move to cart)
  const buyNow = useCallback(async () => {
    if (product) {
      // start page loading
      dispatch(setPageLoading(true))

      try {
        // send request to add product to cart
        const { cartItems, message, errors } = await addToCartApi([{ productId: product._id, quantity }])

        // show toast success
        toast.success(message)
        if (errors.notEnough) {
          toast.error(errors.notEnough)
        }
        if (errors.notFound) {
          toast.error(errors.notFound)
        }

        // add cart item to state
        dispatch(addCartItem(cartItems))

        // move to cart page
        router.push(`/cart?product=${product?.slug}`)
      } catch (err: any) {
        console.log(err)
      }
    }
  }, [product, dispatch, quantity, router])

  // handle buy now (add to cart and move to cart) - LOCAL
  const buyNowLocal = useCallback(() => {
    addProductToLocalCart()

    // move to cart page
    router.push(`/cart?product=${product?.slug}`)
  }, [addProductToLocalCart, product?.slug, router])

  // MARK: handlers
  // handle add product to cart
  const handleAddToCart = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (curUser) {
        addProductToCart()
      } else {
        addProductToLocalCart()
      }
    },
    [curUser, addProductToCart, addProductToLocalCart]
  )

  // handle buy now
  const handleBuyNow = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()

      if (curUser) {
        buyNow()
      } else {
        buyNowLocal()
      }
    },
    [curUser, buyNow, buyNowLocal]
  )

  // MARK: Quantity
  // handle quantity
  const handleQuantity = useCallback(
    (value: number, isCustom: boolean = false) => {
      if (!isCustom) {
        // quantity must be > 0
        if (quantity + value <= 0) return

        // quantity must be <= product stock
        if (quantity + value > product?.stock!) return

        setQuantity(quantity + value)
      } else {
        // quantity must be > 0
        if (value < 1) value = 1

        // quantity must be <= product stock
        if (value > product?.stock!) value = product?.stock!

        setQuantity(value)
      }
    },
    [product?.stock, quantity]
  )

  return (
    <>
      {/* MARK: Main */}
      <div className={`my-3 inline-flex select-none overflow-hidden rounded-md ${className}`}>
        <button
          className={`trans-200 group flex items-center justify-center rounded-bl-md rounded-tl-md border px-3 py-[10px] hover:bg-secondary ${
            quantity <= 1
              ? 'pointer-events-none border-slate-100 bg-slate-100'
              : 'border border-secondary'
          }`}
          disabled={quantity <= 1 || isLoading || (product?.stock || 0) <= 0}
          onClick={() => handleQuantity(-1)}
        >
          <FaMinus
            size={16}
            className={`wiggle group-hover:text-white ${
              quantity <= 1 ? 'text-slate-300' : 'text-secondary'
            }`}
          />
        </button>
        <input
          className="max-w-14 border-y border-slate-100 px-2 text-center font-body text-lg font-semibold text-dark outline-none"
          type="text"
          inputMode="numeric"
          value={quantity}
          disabled={isLoading || (product?.stock || 0) <= 0}
          onChange={e => setQuantity(+e.target.value || 0)}
          onBlur={e => handleQuantity(+e.target.value, true)}
        />
        <button
          className={`trans-200 group flex items-center justify-center rounded-br-md rounded-tr-md border px-3 py-[10px] hover:bg-secondary ${
            quantity >= product?.stock!
              ? 'pointer-events-none border-slate-100 bg-slate-100'
              : 'border-secondary'
          }`}
          disabled={quantity === product?.stock || isLoading || (product?.stock || 0) <= 0}
          onClick={() => handleQuantity(1)}
        >
          <FaPlus
            size={16}
            className={`wiggle group-hover:text-white ${
              quantity >= product?.stock! ? 'text-slate-300' : 'text-secondary'
            }`}
          />
        </button>
      </div>

      {/* MARK: Action Buttons */}
      <div className="mt-2 flex flex-row-reverse items-center justify-start gap-3 md:flex-row">
        <button
          className={`trans-200 rounded-md bg-secondary px-3 py-[5px] font-body text-xl font-semibold text-white hover:bg-primary ${
            isLoading || (product?.stock || 0) <= 0 ? 'pointer-events-none bg-slate-200' : ''
          }`}
          onClick={handleBuyNow}
          disabled={isLoading || (product?.stock || 0) <= 0}
        >
          MUA NGAY
        </button>
        <button
          className={`hover:bg-primary-600 trans-200 group rounded-md bg-primary px-3 py-2 ${
            isLoading || (product?.stock || 0) <= 0 ? 'pointer-events-none bg-slate-200' : ''
          }`}
          onClick={handleAddToCart}
          disabled={isLoading || (product?.stock || 0) <= 0}
        >
          {isLoading ? (
            <RiDonutChartFill
              size={22}
              className="animate-spin text-white"
            />
          ) : (
            <FaCartPlus
              size={22}
              className="wiggle text-white"
            />
          )}
        </button>
        {['admin', 'editor'].includes(curUser?.role) && (
          <Link
            href={`/admin/product/all?_id=${product?._id}`}
            className="hover:bg-primary-600 trans-200 group flex h-[38px] items-center justify-center rounded-md border border-yellow-400 px-3"
          >
            <MdEdit
              size={22}
              className="wiggle text-yellow-400"
            />
          </Link>
        )}
      </div>
    </>
  )
}

export default memo(BuyActionWithQuantity)

'use client'

import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { addCartItem, addLocalCartItem } from '@/libs/reducers/cartReducer'
import { setPageLoading } from '@/libs/reducers/modalReducer'
import { ICartItem } from '@/models/CartItemModel'
import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { addToCartApi } from '@/requests'
import mongoose from 'mongoose'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { memo, useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { FaCartPlus } from 'react-icons/fa'
import { MdEdit } from 'react-icons/md'
import { RiDonutChartFill } from 'react-icons/ri'

interface CarouselProductProps {
  product: IProduct
  className?: string
}

function CarouselProduct({ product, className = '' }: CarouselProductProps) {
  // hooks
  const dispatch = useAppDispatch()
  const localCart = useAppSelector(state => state.cart.localItems)
  const router = useRouter()
  const { data: session } = useSession()
  const curUser: any = session?.user

  // states
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // MARK: Add
  // add product to cart - DATABASE
  const addProductToCart = useCallback(async () => {
    // start loading
    setIsLoading(true)

    try {
      // send request to add product to cart
      const { cartItems, message, errors } = await addToCartApi([
        { productId: product._id, quantity: 1 },
      ])

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

      // add cart items to state
      dispatch(addCartItem(cartItems))
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setIsLoading(false)
    }
  }, [dispatch, product._id])

  // handle add product to cart - LOCAL
  const addProductToLocalCart = useCallback(() => {
    // add product to local cart
    // create cart item from product
    const existingCartItem = localCart.find(
      (item: ICartItem) => item.productId.toString() === product._id
    )

    // product has already existed in cart
    if (existingCartItem) {
      // if not enough products in stock
      if (existingCartItem.quantity + 1 > product.stock) {
        toast.error('Hiện không đủ sản phẩm để thêm vào giỏ hàng của bạn. Xin lỗi vì sự bất tiện này')
        return
      }

      dispatch(addLocalCartItem({ ...existingCartItem, quantity: existingCartItem.quantity + 1 }))

      // success toast
      toast.success(`Đã thêm gói "${product.title}" vào giỏ hàng`)
      return
    }

    // product has not existed in user cart
    // if not enough products in stock
    if (1 > product.stock) {
      toast.error('Hiện không đủ sản phẩm để thêm vào giỏ hàng của bạn. Xin lỗi vì sự bất tiện này')
      return
    }

    // still have enough products in stock
    // create new cart item
    const newCartItem = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      userId: curUser?._id,
      productId: product._id,
      product,
      quantity: 1,
    }

    // calculate user cart length
    // const cartLength = localCart.reduce((total, cartItem) => total + cartItem.quantity, 0) + 1

    dispatch(addLocalCartItem(newCartItem as ICartItem))

    // success toast
    toast.success(`Đã thêm gói "${product.title}" vào giỏ hàng`)
    return
  }, [curUser?._id, dispatch, localCart, product])

  // MARK: Buy
  // buy now (add to cart and move to cart) - DATABASE
  const buyNow = useCallback(async () => {
    // start page loading
    dispatch(setPageLoading(true))
    try {
      // send request to add product to cart
      const { cartItems, message, errors } = await addToCartApi([
        { productId: product._id, quantity: 1 },
      ])

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

      // add cart items to state
      dispatch(addCartItem(cartItems))

      // move to cart page
      router.push(`/cart?product=${product.slug}`)
    } catch (err: any) {
      console.log(err)
    }
  }, [product._id, dispatch, product.slug, router])

  // handle buy now (add to cart and move to cart) - LOCAL
  const buyNowLocal = useCallback(() => {
    addProductToLocalCart()

    // move to cart page
    router.push(`/cart?product=${product.slug}`)
  }, [addProductToLocalCart, product.slug, router])

  // MARK: Handlers
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

  return (
    <Link
      href={`/${product.slug}`}
      prefetch={false}
      className={`aspect-video w-2/3 shrink-0 px-21/2 sm:w-1/3 lg:w-1/5 ${className}`}
    >
      <div className="group relative overflow-hidden rounded-small">
        {/* MARK: Thumbnail */}
        <Image
          className="block h-full w-full flex-shrink-0 snap-start object-cover"
          src={product.images[0]}
          width={1200}
          height={768}
          alt="account"
        />

        {/* MARK: Overlay */}
        <div className="absolute left-0 top-0 flex h-full w-full translate-y-full flex-col justify-center bg-sky-500 bg-opacity-65 p-3 text-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:gap-1">
          <h5
            className="line-clamp-2 flex-shrink-0 text-ellipsis font-body text-sm leading-4 text-white"
            title={product.title}
          >
            {product.title}
          </h5>
          <p className="text-xs font-semibold uppercase leading-3 text-slate-200">
            - {(product.category as ICategory).title} -
          </p>
          <p className="text-xs font-bold text-white">
            Đã bán: <span className="font-semibold text-green-200">{product.sold}</span>
          </p>
          {/* Action Buttons */}
          <div
            className="flex items-center justify-center gap-2"
            onClick={e => e.preventDefault()}
          >
            <button
              className="trans-200 h-[26px] text-nowrap rounded-[4px] bg-secondary px-2 font-body text-[12px] font-semibold tracking-wider text-white hover:bg-primary md:h-[30px]"
              onClick={handleBuyNow}
              disabled={isLoading}
            >
              MUA NGAY
            </button>
            <button
              className={`hover:bg-primary-600 trans-200 h-[26px] rounded-[4px] bg-primary px-2 hover:bg-secondary md:h-[30px] ${
                isLoading ? 'pointer-events-none bg-slate-200' : ''
              }`}
              onClick={handleAddToCart}
              disabled={isLoading}
            >
              {isLoading ? (
                <RiDonutChartFill
                  size={13}
                  className="animate-spin text-white"
                />
              ) : (
                <FaCartPlus
                  size={16}
                  className="wiggle-1 text-white"
                />
              )}
            </button>
            {['admin', 'editor'].includes(curUser?.role) && (
              <div
                onClick={() => router.push(`/admin/product/all?_id=${product?._id}`)}
                className="hover:bg-primary-600 trans-200 group flex h-[26px] items-center justify-center rounded-md border border-yellow-400 px-1"
              >
                <MdEdit
                  size={18}
                  className="wiggle text-yellow-400"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default memo(CarouselProduct)

'use client'

import { useAppDispatch, useAppSelector } from '@/libs/hooks'
import { setCartItems, setLocalCartItems } from '@/libs/reducers/cartReducer'
import { setUserBalance } from '@/libs/reducers/userReducer'
import { ICartItem } from '@/models/CartItemModel'
import { IProduct } from '@/models/ProductModel'
import {
  getCartApi,
  refreshUserBalanceApi,
  searchProductsApi,
  updateProductsInLocalCartApi,
} from '@/requests'
import { formatPrice } from '@/utils/number'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaSearch } from 'react-icons/fa'
import { FaBars, FaCartShopping } from 'react-icons/fa6'
import { HiLightningBolt } from 'react-icons/hi'
import { IoChevronDown, IoClose } from 'react-icons/io5'
import { PiLightningFill } from 'react-icons/pi'
import { RiDonutChartFill } from 'react-icons/ri'
import Menu from './Menu'

interface HeaderProps {
  isStatic?: boolean
  hideSearch?: boolean
}

function Header({ isStatic, hideSearch }: HeaderProps) {
  // hooks
  const dispatch = useAppDispatch()
  const { data: session } = useSession()
  const curUser: any = session?.user

  // store
  const balance = useAppSelector(state => state.user.balance)
  const localCartItems = useAppSelector(state => state.cart.localItems)
  const cartItems = useAppSelector(state => state.cart.items)

  // states
  const [isShow, setIsShow] = useState<boolean>(false)
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false)
  const lastScrollTop = useRef<number>(0)
  const [cartLength, setCartLength] = useState<number>(0)
  const [isLocalCartUpdated, setIsLocalCartUpdated] = useState<boolean>(false)
  const [openAds, setOpenAds] = useState<boolean>(true)

  // search
  const [openSearch, setOpenSearch] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>('')
  const [searchLoading, setSearchLoading] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const searchTimeout = useRef<any>(null)
  const [enableHideHeader, setEnableHideHeader] = useState<boolean>(true)
  const [openResults, setOpenResults] = useState<boolean>(false)

  // MARK: ADS
  useEffect(() => {
    const showTime = 5000
    const interval = 60000

    setTimeout(() => {
      setOpenAds(false)

      setInterval(() => {
        setOpenAds(true)

        setTimeout(() => {
          setOpenAds(false)
        }, showTime)
      }, interval)
    }, showTime)

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setOpenAds(prev => !prev)
      }
    }

    window.addEventListener('keypress', handleKeyPress)

    return () => {
      window.removeEventListener('keypress', handleKeyPress)
    }
  }, [])

  // refresh user balance
  useEffect(() => {
    const refreshUserBalance = async () => {
      try {
        // send request to refresh user balance
        const { balance } = await refreshUserBalanceApi()

        console.log('Balance:', balance)

        // update balance
        dispatch(setUserBalance(balance))
      } catch (err: any) {
        console.log(err)
      }
    }

    if (curUser?._id) {
      refreshUserBalance()
    }
  }, [dispatch, curUser?._id])

  // get cart length
  useEffect(() => {
    setCartLength(
      curUser?._id
        ? cartItems.reduce((total, item) => total + item.quantity, 0)
        : localCartItems.reduce((total, item) => total + item.quantity, 0)
    )
  }, [cartItems, localCartItems, curUser?._id])

  // update products in local cart
  useEffect(() => {
    const getCorrespondingProducts = async () => {
      try {
        // send product ids to get corresponding cart items
        const { products } = await updateProductsInLocalCartApi(
          localCartItems.map(item => (item.product as IProduct)._id)
        )

        const updatedLocalCartItems = localCartItems
          .map(cartItem => {
            const product = products.find(
              (product: IProduct) => product._id === (cartItem.product as IProduct)._id
            )

            // make sure quantity is not greater than stock
            let qty = cartItem.quantity > product?.stock ? product?.stock : cartItem.quantity
            qty = cartItem.quantity === 0 && product?.stock ? 1 : qty

            return product
              ? {
                  ...cartItem,
                  product,
                  quantity: qty,
                }
              : null
          })
          .filter(cartItem => cartItem) as ICartItem[]

        dispatch(setLocalCartItems(updatedLocalCartItems))
        setIsLocalCartUpdated(true)
      } catch (err: any) {
        console.log(err)
        toast.error(err.message)
      }
    }

    if (!curUser && !isLocalCartUpdated) {
      getCorrespondingProducts()
    }
  }, [curUser, dispatch, localCartItems, isLocalCartUpdated])

  // get user's cart
  useEffect(() => {
    const getUserCart = async () => {
      if (curUser?._id) {
        try {
          // send request to get user's cart
          const { cart } = await getCartApi() // cache: no-store

          // set cart to state
          dispatch(setCartItems(cart))
        } catch (err: any) {
          console.log(err)
          toast.error(err.response.data.message)
        }
      }
    }
    getUserCart()
  }, [dispatch, curUser?._id])

  // show and hide header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (enableHideHeader) {
        let scrollTop = window.scrollY

        // scroll down
        if (scrollTop >= 21) {
          // scroll top
          if (scrollTop > lastScrollTop.current) {
            setIsShow(true)
          } else {
            setIsShow(false)
            setIsOpenMenu(false)
          }

          lastScrollTop.current = scrollTop
        } else {
          setIsShow(false)
          setIsOpenMenu(false)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  })

  // handle search
  const handleSearch = useCallback(async () => {
    // start loading
    setSearchLoading(true)

    try {
      // send request to search products
      const { products } = await searchProductsApi(searchValue)

      // set search results
      setSearchResults(products)
    } catch (err: any) {
      console.log(err)
      toast.error(err.message)
    } finally {
      // stop loading
      setSearchLoading(false)
    }
  }, [searchValue])

  // auto search after 0.5s when search value changes
  useEffect(() => {
    if (searchValue) {
      clearTimeout(searchTimeout.current)
      searchTimeout.current = setTimeout(() => {
        handleSearch()
      }, 500)
    } else {
      setSearchResults(null)
      setEnableHideHeader(true)
    }
  }, [searchValue, handleSearch])

  return (
    <header
      className={`${
        isStatic ? 'static' : 'fixed left-0 top-0 z-50'
      } w-full bg-dark-100 text-white shadow-medium-light transition-all duration-300 ${
        isShow ? 'top-0' : 'top-[-100%]'
      }`}
    >
      {/* Ads */}
      <Link
        href="https://monaedu.com"
        target="_blank"
        rel="noreferrer"
        className={`${openAds ? 'max-h-[200px] py-0.5 sm:max-h-12 md:max-h-6' : 'max-h-0 py-0'} trans-300 group block w-full overflow-hidden bg-gradient-to-t from-[#2f2e3e] to-primary px-3 text-center font-body text-sm tracking-wider text-light`}
        title='Giảm đến 100.000đ hoặc 50% khi nhập mã "BIGSALE50" học tại monaedu.com'
      >
        <p className="">
          Nhập voucher{' '}
          <span className="wiggle-0 inline-block font-semibold text-yellow-300">
            &quot;BIGSALE50&quot;
          </span>{' '}
          giảm ngay <span className="font-semibold">50%</span> khi mua khóa học tại{' '}
          <span className="trans-200 font-semibold text-orange-400 underline underline-offset-1 group-hover:text-orange-500">
            monaedu.com
          </span>
        </p>
      </Link>

      {/* Main Header */}
      <div className="relative m-auto flex h-[72px] w-full max-w-1200 items-center justify-between px-21">
        {/* MARK: Brand */}
        <div
          className={`${
            openSearch ? 'max-w-0 overflow-hidden' : 'w-[90%] max-w-[300px]'
          } no-scrollbar -ml-4 flex h-full items-center overflow-x-scroll pl-4 transition-all duration-300 sm:flex-shrink-0`}
        >
          <Link
            href="/"
            prefetch={false}
            className="trans-200 spin hidden shrink-0 rounded-full sm:block"
          >
            <Image
              className="aspect-square rounded-full"
              src="/images/logo.jpg"
              width={40}
              height={40}
              alt="logo"
            />
          </Link>
          <Link
            href="/"
            prefetch={false}
            className="text-2xl font-bold"
          >
            .AnphaShop
          </Link>
          <Link
            href="/recharge"
            className="trans-200 group ml-3 flex items-center gap-1 rounded-lg bg-primary px-[10px] py-[6px] hover:bg-secondary"
          >
            <span className="trans-200 font-body text-[18px] font-bold tracking-[0.02em] group-hover:text-white">
              Nạp
            </span>
            <HiLightningBolt
              size={20}
              className="trans-200 animate-bounce group-hover:text-white"
            />
          </Link>
        </div>

        {/* Search */}
        <div
          className={`${openSearch ? 'max-w-full' : 'max-w-0 p-0'} ${
            !searchResults ? 'overflow-hidden' : ''
          } relative mr-2.5 flex h-[40px] w-full items-center justify-center text-dark transition-all duration-300 lg:max-w-[500px]`}
        >
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="rounded-0 h-full w-full appearance-none rounded-l-lg bg-white px-4 py-2 font-body tracking-wider outline-none"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onFocus={() => {
              setEnableHideHeader(false)
              setOpenResults(true)
            }}
            onBlur={() => {
              setEnableHideHeader(true)
              setOpenResults(false)
            }}
          />
          <Link
            href={`/search?search=${searchValue}`}
            onClick={e => !searchValue && e.preventDefault()}
            className={`group flex h-full w-[40px] items-center justify-center rounded-r-lg bg-white ${
              searchLoading ? 'pointer-events-none' : ''
            }`}
          >
            {searchLoading ? (
              <RiDonutChartFill
                size={20}
                className="animate-spin text-slate-300"
              />
            ) : (
              <FaSearch
                size={16}
                className="wiggle"
              />
            )}
          </Link>

          <ul
            className={`${
              searchResults && openResults ? 'max-h-[500px] p-2' : 'max-h-0 p-0'
            } absolute left-0 top-12 z-20 w-full gap-2 overflow-y-auto rounded-lg bg-white shadow-medium transition-all duration-300`}
          >
            {searchResults?.length ? (
              searchResults.map(product => (
                <Link
                  href={`/${product.slug}`}
                  key={product._id}
                  className="trans-200 flex items-start gap-4 rounded-lg p-2 py-2 hover:bg-sky-200"
                >
                  <div className="relative aspect-video flex-shrink-0">
                    {product.stock <= 0 && (
                      <div className="absolute left-0 right-0 top-0 flex aspect-video items-start justify-center rounded-lg bg-white bg-opacity-50">
                        <Image
                          className="-mt-1 animate-wiggle"
                          src="/images/sold-out.jpg"
                          width={28}
                          height={28}
                          alt="sold-out"
                        />
                      </div>
                    )}
                    <Image
                      className="rounded-md"
                      src={product.images[0]}
                      width={70}
                      height={70}
                      alt="product"
                    />

                    {product.flashsale && (
                      <PiLightningFill
                        className="absolute -top-1.5 left-1 animate-bounce text-yellow-400"
                        size={16}
                      />
                    )}
                  </div>

                  <p className="-mt-0.5 line-clamp-2 w-full text-ellipsis font-body text-sm leading-5 tracking-wide text-dark">
                    {product.title}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-center text-sm">0 kết quả tìm thấy</p>
            )}
          </ul>
        </div>

        {/* MARK: Nav */}
        <div className="hidden flex-shrink-0 items-center gap-4 md:flex">
          <button
            className="group flex h-full items-center justify-center lg:hidden"
            onClick={() => {
              setOpenSearch(prev => !prev)
              setSearchResults(null)
              setSearchValue('')
              setEnableHideHeader(true)
            }}
          >
            {openSearch ? (
              <IoClose
                size={30}
                className="wiggle -mr-1.5"
              />
            ) : (
              <FaSearch
                size={20}
                className="wiggle"
              />
            )}
          </button>

          <Link
            href="/cart"
            prefetch={false}
            className="wiggle relative"
          >
            <FaCartShopping size={24} />
            {!!cartLength && (
              <span className="absolute -top-2 right-[-5px] rounded-full bg-primary px-[6px] py-[2px] text-center text-[10px] font-bold">
                {cartLength}
              </span>
            )}
          </Link>

          {curUser ? (
            !!curUser._id && (
              <div
                className="flex cursor-pointer items-center gap-2"
                onClick={() => setIsOpenMenu(prev => !prev)}
              >
                <Image
                  className="wiggle-0 aspect-square rounded-full"
                  src={curUser?.avatar || process.env.NEXT_PUBLIC_DEFAULT_AVATAR!}
                  width={40}
                  height={40}
                  alt="avatar"
                />
                {balance >= 0 && (
                  <div className="font-body text-[18px] underline-offset-2 hover:underline">
                    {formatPrice(balance)}
                  </div>
                )}
                <IoChevronDown
                  size={22}
                  className="trans-200 wiggle"
                />
              </div>
            )
          ) : (
            <Link
              href="/auth/login"
              className="trans-200 cursor-pointer text-nowrap rounded-extra-small bg-secondary px-[10px] py-[6px] font-body font-semibold tracking-wider hover:bg-primary"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* Menu Button */}
        <div className="flex items-center md:hidden">
          <button
            className={`${
              hideSearch ? 'hidden' : ''
            } group h-full w-[40px] items-center justify-center sm:flex lg:hidden`}
            onClick={() => {
              setOpenSearch(prev => !prev)
              setSearchResults(null)
              setSearchValue('')
              setEnableHideHeader(true)
            }}
          >
            {openSearch ? (
              <IoClose
                size={30}
                className="wiggle"
              />
            ) : (
              <FaSearch
                size={20}
                className="wiggle"
              />
            )}
          </button>

          <button
            className="flex h-[40px] w-[40px] items-center justify-center"
            onClick={() => setIsOpenMenu(prev => !prev)}
          >
            <FaBars
              size={22}
              className="trans-200 wiggle"
            />
          </button>
        </div>

        {/* MARK: Menu */}
        <Menu
          open={isOpenMenu}
          setOpen={setIsOpenMenu}
        />
      </div>
    </header>
  )
}

export default memo(Header)

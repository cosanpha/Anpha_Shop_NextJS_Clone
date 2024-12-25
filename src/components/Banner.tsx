'use client'

import { ICategory } from '@/models/CategoryModel'
import { IProduct } from '@/models/ProductModel'
import { ITag } from '@/models/TagModel'
import { getTrendingMovies } from '@/requests'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'
import { BiSolidCategoryAlt } from 'react-icons/bi'
import { FaChevronDown, FaTag } from 'react-icons/fa'
import { FaBoltLightning } from 'react-icons/fa6'
import BannerMenu from './BannerMenu'
import Carousel from './Carousel'
import Header from './Header'
import Slider from './Slider'

interface BannerProps {
  categories: ICategory[]
  tags: ITag[]
  carouselProducts: IProduct[]
}

function Banner({ carouselProducts = [], categories = [], tags = [] }: BannerProps) {
  // states
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [width, setWidth] = useState<number>(-1)
  const [movies, setMovies] = useState<any[]>([])

  // set width
  useEffect(() => {
    // handle resize
    const handleResize = () => {
      setWidth(window.innerWidth)
    }

    // initial width
    setWidth(window.innerWidth)

    // add event listener
    window.addEventListener('resize', handleResize)

    // remove event listener
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // get popular movie
  useEffect(() => {
    const getMovies = async () => {
      try {
        const { results: movies } = await getTrendingMovies({ page: 1, language: 'vi-VN' })
        setMovies(movies.slice(0, 10))
      } catch (error) {
        console.log(error)
      }
    }

    getMovies()
  }, [])

  return (
    <section className="h-screen py-21">
      {/* Main Banner */}
      <div
        className="mx-auto flex h-full w-full max-w-1200 flex-col overflow-hidden rounded-medium bg-white bg-opacity-90 shadow-medium"
        style={{ height: 'calc(100vh - 2 * 21px)' }}
      >
        {/* MARK: Header in Banner */}
        <Header
          isStatic
          hideSearch
        />

        {/* Banner Content */}
        <div
          className="relative flex flex-col gap-21 overflow-hidden p-21"
          style={{ height: 'calc(100% - 72px)' }}
        >
          {/* MARK: Top */}
          <div className="flex h-2/3 flex-grow justify-between gap-21">
            {/* Tag */}
            <ul className="hidden min-w-[200px] overflow-y-auto rounded-lg bg-white p-2 pt-0 lg:block">
              <h5 className="sticky top-0 bg-white pt-2 text-center text-[18px] font-semibold text-dark">
                Thẻ
              </h5>

              {tags?.map(tag => (
                <li
                  className="trans-200 group rounded-extra-small text-dark hover:bg-primary"
                  key={tag.title}
                >
                  <Link
                    href={`/tag?tag=${tag.slug}`}
                    prefetch={false}
                    className="flex items-center px-[10px] py-[6px]"
                  >
                    <FaTag
                      size={13}
                      className="wiggle"
                    />
                    <span className="ms-2 text-sm">{tag.title}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Slider */}
            <Slider
              movies={movies}
              time={5000}
              mobile={width < 576}
              thumbs={
                width < 576
                  ? movies.length > 0
                    ? movies.map(movie => `https://image.tmdb.org/t/p/original/${movie?.poster_path}`)
                    : ['/banners/netflix-random-mobile.jpg']
                  : movies.length > 0
                    ? movies.map(movie => `https://image.tmdb.org/t/p/original/${movie?.backdrop_path}`)
                    : ['/banners/netflix-random.jpg']
              }
            >
              {movies.length > 0 ? (
                movies.map((movie, index) => (
                  <Link
                    className="relative"
                    href="/category?ctg=netflix"
                    key={index}
                  >
                    <Image
                      className="transition-all duration-700 hover:scale-105"
                      src={
                        width < 576
                          ? `https://image.tmdb.org/t/p/original/${movie?.poster_path}`
                          : `https://image.tmdb.org/t/p/original/${movie?.backdrop_path}`
                      }
                      alt="netflix"
                      width={1200}
                      height={768}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </Link>
                ))
              ) : (
                <Link href="/category?ctg=netflix">
                  <Image
                    className="transition-all duration-700 hover:scale-105"
                    src={
                      width < 576 ? '/banners/netflix-random-mobile.jpg' : '/banners/netflix-random.jpg'
                    }
                    alt="grammarly"
                    width={1200}
                    height={768}
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Link>
              )}
            </Slider>

            {/* Category */}
            <ul className="hidden min-w-[200px] overflow-y-auto rounded-lg bg-white p-2 lg:block">
              <h5 className="ml-2 text-center text-[18px] font-semibold text-dark">Thể loại</h5>

              <li className="trans-200 group rounded-extra-small text-dark hover:bg-primary">
                <Link
                  href="/flash-sale"
                  prefetch={false}
                  className="flex items-center gap-2 px-[10px] py-[6px]"
                >
                  <FaBoltLightning
                    size={14}
                    className="wiggle text-secondary"
                  />
                  <span className="text-sm font-bold text-secondary">FLASHSALES</span>
                </Link>
              </li>

              {categories?.map(category => (
                <li
                  className="trans-200 group rounded-extra-small text-dark hover:bg-primary"
                  key={category.title}
                >
                  <Link
                    href={`/category?ctg=${category.slug}`}
                    prefetch={false}
                    className="flex items-center px-[10px] py-[6px]"
                  >
                    <BiSolidCategoryAlt
                      size={15}
                      className="wiggle"
                    />
                    <span className="ms-2 text-sm">{category.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* MARK: Bottom */}
          <div className="relative -mb-4 shrink-0">
            <Carousel products={carouselProducts} />
          </div>

          {/* MARK: Menu Section */}
          {/* Menu Button */}
          <button
            className={`group absolute right-0 top-0 rounded-bl-lg bg-white p-2 transition-all delay-200 duration-300 lg:hidden ${
              isMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={() => setIsMenuOpen(true)}
          >
            <div className="rotate-45">
              <FaChevronDown
                size={18}
                className="wiggle"
              />
            </div>
          </button>

          {/* Menu */}
          <BannerMenu
            open={isMenuOpen}
            setOpen={setIsMenuOpen}
            categories={categories}
            tags={tags}
          />
        </div>
      </div>
    </section>
  )
}

export default memo(Banner)

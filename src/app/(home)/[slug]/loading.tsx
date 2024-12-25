import Divider from '@/components/Divider'
import Slider from '@/components/Slider'
import LoadingBuyActionWithQuantity from '@/components/loading/LoadingBuyActionWithQuantity'
import LoadingChooseMe from '@/components/loading/LoadingChooseMe'
import LoadingGroupProducts from '@/components/loading/LoadingGroupProducts'
import LoadingLinkBar from '@/components/loading/LoadingLinkBar'
import LoadingPrice from '@/components/loading/LoadingPrice'
import LoadingReviewContainer from '@/components/loading/LoadingReviewContainer'
import { FaCircleCheck, FaTags } from 'react-icons/fa6'
import { MdCategory } from 'react-icons/md'
import { TbPackages } from 'react-icons/tb'

async function LoadingProductPage() {
  return (
    <div className="pt-9">
      {/* MARK: Top */}
      <section className="flex flex-col gap-x-21 gap-y-21/2 rounded-medium bg-white p-8 shadow-medium md:flex-row">
        <div className="w-full md:w-[45%] md:max-w-[500px]">
          <div className="relative aspect-video rounded-md shadow-xl">
            <Slider>
              <div className="loading h-full w-full rounded-lg" />
            </Slider>
          </div>

          {/* Link */}
          <LoadingLinkBar className="mt-21" />
        </div>

        <div className="md:w-[55%]">
          <div className="loading mb-5 mt-3 h-2 w-full rounded" />
          <div className="loading mb-5 mt-3 h-2 w-full rounded" />

          <LoadingPrice big />

          <div className="mt-5 flex flex-col gap-3 font-body text-xl tracking-wide">
            {/* Category */}
            <div className="flex flex-wrap items-center gap-1">
              <MdCategory
                className="w-7 text-darker"
                size={26}
              />
              <span className="loading mr-2 h-2 w-[80px] rounded" />
              <span className="loading mr-2 h-2 w-[25px] rounded" />
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1">
              <FaTags
                className="w-7 text-darker"
                size={20}
              />
              <span className="loading mr-2 h-2 w-[80px] rounded" />
              {Array.from({ length: 2 }).map((_, index) => (
                <span
                  className="loading mr-2 h-2 w-[54px] rounded"
                  key={index}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <TbPackages
                className="w-7 text-darker"
                size={26}
              />
              <span className="loading mr-2 h-2 w-[80px] rounded" />
              <span className="loading mr-2 h-2 w-[25px] rounded" />
            </div>
            <div className="flex items-center gap-1">
              <FaCircleCheck
                className="w-7 text-darker"
                size={20}
              />
              <span className="loading mr-2 h-2 w-[80px] rounded" />
              <span className="loading mr-2 h-2 w-[25px] rounded" />
            </div>
          </div>

          <LoadingBuyActionWithQuantity />
        </div>
      </section>

      <Divider size={9} />

      {/* MARK: Related Products */}
      <section className="mx-auto max-w-1200 overflow-hidden rounded-medium border-4 border-white bg-dark-100 p-8 shadow-medium">
        <LoadingGroupProducts hideTop />
      </section>

      <Divider size={9} />

      {/* MARK: Detail */}
      <section className="mx-auto max-w-1200 rounded-medium bg-white p-8 shadow-medium">
        {/* MARK: Introduction */}
        <div className="loading mb-5 mt-3 h-2 w-full max-w-[300px] rounded" />

        <div className="-mx-21/2 flex w-full flex-wrap">
          <div className="mb-12 w-full px-21/2">
            <div className="loading my-3 mb-2 h-2 w-[90%] rounded" />
            <div className="loading my-3 mb-2 h-2 w-[90%] rounded" />
            <div className="loading my-3 mb-2 h-2 w-[90%] rounded" />
          </div>

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <div className="loading mb-5 mt-3 h-2 w-full max-w-[300px] rounded" />

            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
          </div>

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <div className="loading mb-5 mt-3 h-2 w-full max-w-[300px] rounded" />

            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
          </div>

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <div className="loading mb-5 mt-3 h-2 w-full max-w-[300px] rounded" />

            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
          </div>

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <div className="loading mb-5 mt-3 h-2 w-full max-w-[300px] rounded" />

            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
            <div className="loading m-3 mb-4 h-2 w-[90%] rounded" />
          </div>
        </div>

        {/* MARK: Choose Me */}
        <div className="mb-10">
          <div className="loading mb-5 mt-3 h-2 w-full max-w-[300px] rounded" />
          <LoadingChooseMe className="mx-[-16px]" />
        </div>
      </section>

      <Divider size={9} />

      {/* MARK: Reviews */}
      <section className="mx-auto max-w-1200 rounded-medium bg-white p-21 shadow-medium">
        <div className="loading h-5 w-[120px] rounded-lg" />

        <LoadingReviewContainer />
      </section>
    </div>
  )
}

export default LoadingProductPage

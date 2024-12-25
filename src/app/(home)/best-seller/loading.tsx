import LoadingHeading from '@/components/loading/LoadingHeading'
import LoadingProductCard from '@/components/loading/LoadingProductCard'

async function LoadingBestSellerPage() {
  return (
    <div className="pt-8">
      <LoadingHeading />

      {/* MARK: MAIN LIST */}
      <div className="mt-12 grid grid-cols-1 gap-21 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <LoadingProductCard key={index} />
        ))}
      </div>
    </div>
  )
}

export default LoadingBestSellerPage

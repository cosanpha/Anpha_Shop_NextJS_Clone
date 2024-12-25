import LoadingMeta from '@/components/loading/LoadingMeta'
import LoadingPagination from '@/components/loading/LoadingPagination'
import LoadingProductCard from '@/components/loading/LoadingProductCard'

async function LoadingTagPage() {
  return (
    <div className="pt-16">
      {/* MARK: Meta */}
      <LoadingMeta items />

      {/* MARK: Amount */}
      <div className="flex items-center justify-end gap-2">
        <span className="loading my-[16px] inline-block h-3 w-[50px] rounded border-2" />
        <span className="loading my-[16px] inline-block h-3 w-[50px] rounded border-2" />
      </div>

      {/* MARK: MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <LoadingProductCard key={index} />
        ))}
      </div>

      {/* MARK: Pagination */}
      <LoadingPagination className="mt-11" />
    </div>
  )
}

export default LoadingTagPage

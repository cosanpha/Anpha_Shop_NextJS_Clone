import Divider from '@/components/Divider'
import LoadingAbout from '@/components/loading/LoadingAbout'
import LoadingBanner from '@/components/loading/LoadingBanner'
import LoadingChooseMe from '@/components/loading/LoadingChooseMe'
import LoadingGroupProducts from '@/components/loading/LoadingGroupProducts'
import LoadingHeading from '@/components/loading/LoadingHeading'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Anpha Shop',
  description:
    'Chào mừng bạn đến với Anpha Shop, địa chỉ tin cậy cho những người đang tìm kiếm Account Cao Cấp. Tại Anpha Shop, chúng tôi tự hào mang đến cho bạn những tài khoản chất lượng và đẳng cấp, đáp ứng mọi nhu cầu của bạn. Khám phá bộ sưu tập Account Cao Cấp tại cửa hàng của chúng tôi ngay hôm nay và trải nghiệm sự khác biệt với Anpha Shop - Nơi đáng tin cậy cho sự đẳng cấp!',
}

async function LoadingHomePage() {
  return (
    <div className="min-h-screen">
      {/* MARK: Banner */}
      <LoadingBanner />

      <Divider size={28} />

      {/* MARK: Top #10 */}
      <LoadingHeading size={175} />
      <section className="mx-auto max-w-1200 px-4">
        <LoadingGroupProducts />
      </section>

      <Divider size={28} />

      {/* MARK: Products */}
      <LoadingHeading />
      <section className="mx-auto max-w-1200 px-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingGroupProducts
            className={index !== 6 - 1 ? 'mb-20' : ''}
            key={index}
          />
        ))}
      </section>

      <Divider size={28} />

      {/* MARK: About */}
      <LoadingHeading size={300} />
      <LoadingAbout />

      <Divider size={28} />

      {/* MARK: Choose Me */}
      <LoadingHeading size={300} />
      <LoadingChooseMe />
    </div>
  )
}

export default LoadingHomePage

import Image from 'next/image'
import { memo } from 'react'
import Slider from './Slider'

function About() {
  return (
    <section className="mx-auto max-w-1200">
      <Slider className="rounded-medium bg-white bg-opacity-90 shadow-medium">
        {/* MARK: slide 1 */}
        <div className="flex h-full flex-wrap gap-y-4 p-21">
          <div className="aspect-video w-full overflow-hidden rounded-lg md:w-2/3">
            <Image
              className="h-full w-full object-cover"
              src="/banners/watching-netflix.jpg"
              width={1200}
              height={1200}
              alt="banner"
            />
          </div>
          <div className="flex w-full items-center pb-16 md:w-1/3 md:pb-0 md:pl-21">
            <p className="font-body text-[18px] text-dark">
              Sử dụng các phần mềm, ứng dụng bản Crack gián tiếp gây ra rất nhiều vụ lộ dữ liệu nguy hiểm
              trong thời gian gần đây. Mặt khác, trải nghiệm người dùng của bản crack cũng không thể đầy
              đủ được như bản chính hãng. Do đó, Anpha Shop ra đời với mong muốn giúp người Việt tiếp cận
              với các phần mềm, ứng dụng bản quyền với giá rẻ hơn.{' '}
              <span className="font-semibold text-secondary">20% - 90%</span> giá gốc.
            </p>
          </div>
        </div>

        {/* MARK: slide 2 */}
        <div className="flex h-full flex-wrap gap-y-4 p-21">
          <div className="aspect-video w-full overflow-hidden rounded-lg md:w-2/3">
            <Image
              className="h-full w-full object-cover"
              src="/banners/spotify-banner.jpg"
              width={1920}
              height={1080}
              alt="banner"
            />
          </div>
          <div className="flex w-full items-center pb-16 md:w-1/3 md:pb-0 md:pl-21">
            <p className="font-body text-[18px] text-dark">
              <span className="font-semibold text-primary">Anpha Shop</span> - Đối tác{' '}
              <span className="font-semibold text-green-400">Spotify</span> chính hãng với giá cực kỳ hấp
              dẫn, giảm đến 90%. Tận hưởng âm nhạc không giới hạn với trải nghiệm an toàn và tiết kiệm.
              Đừng bỏ lỡ cơ hội, mua ngay để thưởng thức những giai điệu tuyệt vời mà không làm suy giảm
              túi tiền của bạn. Hãy chọn Anpha Shop, nơi âm nhạc và ưu đãi hội tụ!
            </p>
          </div>
        </div>

        {/* MARK: slide 3 */}
        <div className="flex h-full flex-wrap gap-y-4 p-21">
          <div className="aspect-video w-full overflow-hidden rounded-lg md:w-2/3">
            <Image
              className="h-full w-full object-cover"
              src="/banners/youtube-banner.jpg"
              width={1920}
              height={1080}
              alt="banner"
            />
          </div>
          <div className="flex w-full items-center pb-16 md:w-1/3 md:pb-0 md:pl-21">
            <p className="font-body text-[18px] text-dark">
              Dành cho người yêu thưởng thức nội dung trên{' '}
              <span className="font-semibold text-red-600">YouTube</span> . Chúng tôi mang đến ưu đãi
              siêu hấp dẫn với YouTube Premium, giảm giá đến 90%. Trải nghiệm xem video không quảng cáo,
              tải nội dung yêu thích và thưởng thức âm nhạc không giới hạn. Mua ngay để đắm chìm trong
              thế giới giải trí mà không làm giảm túi tiền của bạn!
            </p>
          </div>
        </div>
      </Slider>
    </section>
  )
}

export default memo(About)

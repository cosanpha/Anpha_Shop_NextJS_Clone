import BuyActionWithQuantity from '@/components/BuyActionWithQuantity'
import ChooseMe from '@/components/ChooseMe'
import Divider from '@/components/Divider'
import GroupProducts from '@/components/GroupProducts'
import LinkBar from '@/components/LinkBar'
import Price from '@/components/Price'
import ReviewContainer from '@/components/ReviewContainer'
import Slider from '@/components/Slider'
import { ICategory } from '@/models/CategoryModel'
import { IFlashSale } from '@/models/FlashSaleModel'
import { IProduct } from '@/models/ProductModel'
import { ITag } from '@/models/TagModel'
import { getProductPageApi } from '@/requests'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FaCircleCheck, FaTags } from 'react-icons/fa6'
import { MdCategory } from 'react-icons/md'
import { TbPackages } from 'react-icons/tb'

export const metadata: Metadata = {
  title: 'Product',
  description:
    'Chào mừng bạn đến với Anpha Shop, địa chỉ tin cậy cho những người đang tìm kiếm Account Cao Cấp. Tại Anpha Shop, chúng tôi tự hào mang đến cho bạn những tài khoản chất lượng và đẳng cấp, đáp ứng mọi nhu cầu của bạn. Khám phá bộ sưu tập Account Cao Cấp tại cửa hàng của chúng tôi ngay hôm nay và trải nghiệm sự khác biệt với Anpha Shop - Nơi đáng tin cậy cho sự đẳng cấp!',
}

async function ProductPage({ params: { slug } }: { params: { slug: string } }) {
  // Data
  let product: IProduct | null = null
  let relatedProducts: IProduct[] = []

  // MARK: Get Data
  try {
    // revalidate every 1 minute
    const data = await getProductPageApi(slug)

    product = data.product
    relatedProducts = data.relatedProducts
  } catch (err: any) {
    return notFound()
  }

  // jsonLD
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'Product',
    name: product?.title,
    description: product?.description,
    brand: {
      '@type': 'Brand',
      name: (product?.category as ICategory).title,
    },
    offers: {
      '@type': 'Offer',
      price: product?.price,
      priceCurrency: 'VND',
      availability: product?.stock ? 'InStock' : 'OutOfStock',
      priceValidUntil: null,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: (product?.rating || 0) < 4.5 ? 4.5 : product?.rating || 5,
      reviewCount: product?.reviewAmount || 50,
    },
    review: [
      {
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: 'hothingoctram03',
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5.0',
        },
        description: 'Sản phẩm tốt, ưu tín, chủ shop dễ thương còn được tặng voucher nữa',
      },
    ],
    image: product?.images[0],
    url: `${process.env.NEXT_PUBLIC_APP_URL}/${product?.slug}`,
  }

  const handleLines = (text: string) => {
    // Split the product description into separate lines
    const lines = text.split('\n').map(line => line.trim())

    // Render each line as a paragraph or list item
    const renderedLines = lines.map((line, index) => {
      const key = `line-${index}`

      if (line.startsWith('-')) {
        // If the line starts with "-", render it as a list item
        return (
          <p
            className="list-none pl-2"
            key={key}
          >
            - {line.substr(1).trim()}
          </p>
        )
      } else {
        const parts = line.split(':')
        if (parts.length === 2) {
          // If the line contains a ":" split it and render the parts with appropriate styling
          return (
            <p key={key}>
              <span className="font-semibold">{parts[0]}:</span> {parts[1]}
            </p>
          )
        } else {
          // If the line does not contain a ":" and doesn't start with "-", render it as a plain paragraph
          return <p key={key}>{line}</p>
        }
      }
    })

    return <div>{renderedLines}</div>
  }

  return (
    <div className="pt-9">
      {/* MARL: Add JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="flex flex-col gap-x-21 gap-y-21/2 rounded-medium bg-white p-8 shadow-medium md:flex-row">
        {/* MARK: Thumbnails */}
        <div className="w-full md:w-[45%] md:max-w-[500px]">
          <div className="relative aspect-video overflow-hidden rounded-md shadow-xl">
            {/* Sold out */}
            {(product?.stock || 0) <= 0 && (
              <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-start justify-center rounded-lg bg-white bg-opacity-50">
                <Image
                  className="-mt-1 animate-wiggle"
                  src="/images/sold-out.jpg"
                  width={60}
                  height={60}
                  alt="sold-out"
                />
              </div>
            )}

            {/* Thumbnails */}
            <Slider>
              {product?.images.map(src => (
                <Image
                  className="h-full w-full object-cover"
                  src={src}
                  width={1800}
                  height={1000}
                  alt="product"
                  key={src}
                />
              ))}
            </Slider>
          </div>

          {/* Link */}
          <LinkBar
            className="mt-21"
            link={`${process.env.NEXT_PUBLIC_APP_URL}/${slug}`}
          />
        </div>

        {/* MARK: Basic Product Info */}
        <div className="md:w-[55%]">
          {/* Title */}
          <h1
            className="mb-3 text-[28px] font-semibold leading-8 text-dark"
            title={product?.title}
          >
            {product?.title}
          </h1>

          {/* Price */}
          <Price
            price={product?.price || 0}
            oldPrice={product?.oldPrice}
            stock={product?.stock || 0}
            flashSale={product?.flashSale as IFlashSale}
            big
          />

          <div className="mt-5 flex flex-col gap-3 font-body text-xl tracking-wide">
            {/* Category */}
            <div className="flex flex-wrap items-center gap-1">
              <MdCategory
                className="w-7 text-darker"
                size={26}
              />
              <span className="text-nowrap font-bold text-darker">Thể loại:</span>
              <Link
                href={`/category?ctg=${(product?.category as ICategory).slug}`}
                prefetch={false}
                className="text-orange-500 hover:underline"
              >
                {(product?.category as ICategory).title}
              </Link>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1">
              <FaTags
                className="w-7 text-darker"
                size={20}
              />
              <span className="text-nowrap font-bold text-darker">Tags:</span>
              {(product?.tags as ITag[]).map((tag: ITag, index) => (
                <Link
                  href={`/tags?ctg=${tag.slug}`}
                  prefetch={false}
                  className="text-dark"
                  key={index}
                >
                  {tag.title + (index !== product!.tags.length - 1 ? ', ' : '')}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <TbPackages
                className="w-7 text-darker"
                size={26}
              />
              <span className="text-nowrap font-bold text-darker">Còn lại:</span>
              <span className="text-green-500">{product?.stock}</span>
            </div>
            <div className="flex items-center gap-1">
              <FaCircleCheck
                className="w-7 text-darker"
                size={20}
              />
              <span className="text-nowrap font-bold text-darker">Đã bán:</span>
              <span className="text-primary">{product?.sold}</span>
            </div>
          </div>

          <BuyActionWithQuantity product={product} />
        </div>
      </section>

      <Divider size={9} />

      {/* MARK: Related Products */}
      {!!relatedProducts.length && (
        <section className="mx-auto mb-9 max-w-1200 overflow-hidden rounded-medium border-4 border-white bg-dark-100 p-8 shadow-medium">
          <GroupProducts
            products={relatedProducts}
            hideTop
          />
        </section>
      )}

      {/* MARK: Detail */}
      <section className="mx-auto max-w-1200 rounded-medium bg-white p-8 shadow-medium">
        {/* MARK: Introduction */}
        <h3 className="text-[28px] text-dark">Giới thiệu sản phẩm</h3>
        <div className="-mx-21/2 flex w-full flex-wrap">
          {(product?.category as ICategory).slug === 'netflix' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với{' '}
                <a
                  href="/https://www.netflix.com"
                  className="text-[#e50914]"
                >
                  Netflix
                </a>{' '}
                - Ứng dụng giải trí số 1 thế giới!
              </p>
              <p className="font-body text-lg font-semibold">
                Khám phá thế giới phim và series truyền hình độc đáo, đỉnh cao với{' '}
                <a
                  href="/https://www.netflix.com"
                  className="text-[#e50914]"
                >
                  Netflix
                </a>
                . Đặc biệt, bạn sẽ được tận hưởng trải nghiệm xem phim linh hoạt trên mọi thiết bị. Hãy
                bắt đầu hành trình giải trí của bạn ngay hôm nay và không bỏ lỡ những thước phim độc
                quyền chỉ có tại{' '}
                <a
                  href="/https://www.netflix.com"
                  className="text-[#e50914]"
                >
                  Netflix
                </a>
                . 🍿🌟🎬
              </p>
            </div>
          )}

          {(product?.category as ICategory).slug === 'capcut' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với{' '}
                <a
                  href="https://www.capcut.com"
                  className="text-[#596ef4]"
                >
                  CapCut
                </a>{' '}
                - Ứng dụng chỉnh sửa video hàng đầu!
              </p>
              <p className="font-body text-lg font-semibold">
                Khám phá thế giới của sáng tạo video với{' '}
                <a
                  href="https://www.capcut.com"
                  className="text-[#596ef4]"
                >
                  CapCut
                </a>
                . Tận hưởng công cụ chỉnh sửa linh hoạt trên mọi thiết bị của bạn và biến những ý tưởng
                thành hiện thực một cách dễ dàng. Bắt đầu hành trình sáng tạo của bạn ngay hôm nay và
                khám phá các tính năng độc đáo chỉ có trong{' '}
                <a
                  href="https://www.capcut.com"
                  className="text-[#596ef4]"
                >
                  CapCut
                </a>
                . 🎥✨🎬
              </p>
            </div>
          )}

          {(product?.category as ICategory).slug === 'chatgpt' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với{' '}
                <a
                  href="https://chat.openai.com"
                  className="text-[#1da484]"
                >
                  ChatGPT
                </a>{' '}
                - Trợ lý thông minh của bạn! 🌟💬
              </p>
              <p className="font-body text-lg font-semibold">
                Khám phá thế giới của việc trò chuyện một cách tự nhiên và linh hoạt với Khám phá thế
                <a
                  href="https://chat.openai.com"
                  className="text-[#1da484]"
                >
                  ChatGPT
                </a>
                . Hãy đặt câu hỏi, tìm kiếm thông tin, hoặc đơn giản là trò chuyện để giải trí -{' '}
                <a
                  href="https://chat.openai.com"
                  className="text-[#1da484]"
                >
                  ChatGPT
                </a>{' '}
                sẽ là đối tác tin cậy của bạn. 🤖🗨️
              </p>
              <p className="font-body text-lg font-semibold">
                Dễ dàng sử dụng và luôn sẵn lòng hỗ trợ, ChatGPT là công cụ độc đáo để giải quyết mọi
                tình huống. Bắt đầu cuộc trò chuyện ngay bây giờ và khám phá sức mạnh của trí tuệ nhân
                tạo ngay trên đầu ngón tay của bạn! 💻🌐✨
              </p>
            </div>
          )}

          {(product?.category as ICategory).slug === 'youtube' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với{' '}
                <a
                  href="https://www.youtube.com"
                  className="text-[#ff0000]"
                >
                  Youtube
                </a>{' '}
                - Nền tảng giải trí vượt trội, nơi bạn sẽ khám phá thế giới qua những video độc đáo và
                thú vị hơn mọi khi!
              </p>
              <p className="font-body text-lg font-semibold">
                Tận hưởng trải nghiệm xem video mượt mà, dễ dàng tìm kiếm, và khám phá những nội dung mới
                mẻ. 🎥✨
              </p>
              <p className="font-body text-lg font-semibold">
                Hãy tham gia{' '}
                <a
                  href="https://www.youtube.com"
                  className="text-[#ff0000]"
                >
                  Youtube
                </a>{' '}
                ngay hôm nay để trải nghiệm sự khác biệt và sự đa dạng trong thế giới giải trí trực
                tuyến! 🌟🚀
              </p>
            </div>
          )}

          {(product?.category as ICategory).slug === 'spotify' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với{' '}
                <a
                  href="https://open.spotify.com"
                  className="text-[#1ed760]"
                >
                  Spotify🎵🌐
                </a>{' '}
                - Nền tảng âm nhạc tuyệt vời, nơi bạn sẽ khám phá âm nhạc với trải nghiệm nghe nhạc độc
                đáo và thú vị hơn mọi khi!
              </p>
              <p className="font-body text-lg font-semibold">
                Tận hưởng âm thanh chất lượng cao, tìm kiếm và khám phá hàng triệu bản nhạc, playlist và
                podcast. 🎶✨
              </p>
              <p className="font-body text-lg font-semibold">
                Hãy tham gia{' '}
                <a
                  href="https://open.spotify.com"
                  className="text-[#1ed760]"
                >
                  Spotify🎵🌐
                </a>{' '}
                ngay hôm nay để trải nghiệm sự đa dạng và sự hòa mình vào thế giới âm nhạc mới mẻ! 🌟🎧🚀
              </p>
            </div>
          )}

          {(product?.category as ICategory).slug === 'grammarly' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với{' '}
                <a
                  href="https://www.grammarly.com"
                  className="text-[#15c39a]"
                >
                  Grammarly📝✨
                </a>{' '}
                - Trợ lý văn bản thông minh, nơi bạn sẽ trải nghiệm công nghệ kiểm tra và cải thiện ngôn
                ngữ một cách nhanh chóng và hiệu quả!
              </p>
              <p className="font-body text-lg font-semibold">
                Với{' '}
                <a
                  href="https://www.grammarly.com"
                  className="text-[#15c39a]"
                >
                  Grammarly
                </a>
                , việc viết sẽ trở nên dễ dàng hơn bao giờ hết. Hãy để chúng tôi giúp bạn tạo ra văn bản
                hoàn hảo và chuyên nghiệp. 🚀📚
              </p>
              <p className="font-body text-lg font-semibold">
                Hãy tham gia{' '}
                <a
                  href="https://www.grammarly.com"
                  className="text-[#15c39a]"
                >
                  Grammarly
                </a>{' '}
                ngay hôm nay để trải nghiệm sự thuận tiện và nâng cao kỹ năng viết của bạn! 🌟💻🔍
              </p>
            </div>
          )}

          {(product?.category as ICategory).slug === 'canva' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với{' '}
                <a
                  href="https://www.canva.com"
                  className="text-[#04bdcc]"
                >
                  Canva🎨✨
                </a>{' '}
                - Nền tảng thiết kế sáng tạo, nơi bạn có thể biến ý tưởng thành hình ảnh và thiết kế độc
                đáo một cách dễ dàng!
              </p>
              <p className="font-body text-lg font-semibold">
                Sử dụng{' '}
                <a
                  href="https://www.canva.com"
                  className="text-[#04bdcc]"
                >
                  Canva
                </a>{' '}
                để tạo hình ảnh, thiệp mời, poster, và nhiều nội dung sáng tạo khác mà không cần kỹ năng
                thiết kế chuyên sâu. 🌈💻
              </p>
              <p className="font-body text-lg font-semibold">
                Hãy tham gia{' '}
                <a
                  href="https://www.canva.com"
                  className="text-[#04bdcc]"
                >
                  Canva
                </a>{' '}
                ngay hôm nay để khám phá không gian sáng tạo và biến ý tưởng của bạn thành hiện thực!
              </p>
            </div>
          )}

          {(product?.category as ICategory).slug === 'microsoft-office' && (
            <div className="mb-12 w-full px-21/2">
              <p className="font-body text-lg font-semibold">
                Chào mừng bạn đến với <span className="text-[#04bdcc]">Microsoft Office 365 ✨🚀</span> -
                Nền tảng sáng tạo và năng suất hàng đầu thế giới!
              </p>
              <p className="font-body text-lg font-semibold">
                Khám phá một thế giới làm việc hoàn toàn mới với{' '}
                <span className="text-[#04bdcc]">Office 365</span>, nơi mọi công việc trở nên dễ dàng và
                hiệu quả hơn bao giờ hết
              </p>
              <p className="font-body text-lg font-semibold">
                Với <span className="text-[#04bdcc]">Office 365</span> 🎉📈, bạn không chỉ đơn thuần là
                làm việc mà còn sáng tạo theo cách của riêng bạn. Trải nghiệm các công cụ văn phòng đỉnh
                cao 🛠️, linh hoạt trên mọi thiết bị 📱💻, giúp bạn làm việc mọi lúc, mọi nơi ⏰🌍
              </p>
              <p className="font-body text-lg font-semibold">
                Hãy bắt đầu hành trình để nâng tầm năng suất và sáng tạo ngay hôm nay, và khám phá những
                tính năng độc đáo chỉ có tại <span className="text-[#04bdcc]">Office 365</span>. 🌟💡🖋️
              </p>
            </div>
          )}

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <h3 className="text-[28px] text-dark">Mô tả sản phẩm</h3>

            {handleLines(product?.description || '')}

            <p>
              <span>Lưu ý: </span>
              <span className="font-semibold">
                Không được phép thay đổi thông tin tài khoản, nếu không tài khoản của bạn sẽ bị thu hồi.
              </span>
            </p>
          </div>

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <h3 className="text-[28px] text-dark">Cách thức mua hàng</h3>
            <ul>
              <li className="mb-4">
                <span className="font-semibold">Cách 1: </span>
                <div>- Mua hàng thông qua Momo</div>
              </li>
              <li className="mb-4">
                <span className="font-semibold">Cách 2: </span>
                <div>- Mua hàng thông qua Ngân hàng</div>
              </li>
              <li className="mb-4">
                <span className="font-semibold">Cách 3: </span>
                <div>
                  -{' '}
                  <Link
                    href="/recharge"
                    className="text-secondary underline"
                  >
                    Nạp tiền vào tài khoản
                  </Link>{' '}
                  sau đó mua hàng.
                </div>
              </li>
            </ul>
          </div>

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <h3 className="text-[28px] text-dark">Bảo hành & Đền bù</h3>
            <p>
              <span className="font-semibold">Thời gian bảo hành: </span>
              <span>
                bằng thời gian sử dụng của tài khoản (Ví dụ: mua Canva 1 năm thì hạn bảo hành sẽ là 1
                năm)
              </span>
            </p>
            <p className="font-semibold">Hình thức bảo hành:</p>
            <ul className="list-decimal pl-10">
              <li>
                Nếu không thể đăng nhập:
                <ul className="list-disc pl-6">
                  <li>Tài khoản sẽ được sửa chữa trong 2h.</li>
                  <li>Được cấp tài khoản thay để dùng tạm thời trong thời gian sửa lỗi.</li>
                  <li>
                    Nếu thời gian sửa lỗi vượt 2h bạn sẽ được cấp tài khoản mới và được tặng voucher giảm
                    10% cho lần mua tiếp theo.
                  </li>
                </ul>
              </li>
              <li>
                Được cấp lại tài khoản mới:
                <ul className="list-disc pl-6">
                  <li>Lỗi không thể sửa được.</li>
                  <li>
                    Tài khoản hết hạn trước 80% thời gian sử dụng (Ví dụ: mua Netflix 30 ngày nhưng lại
                    hết hạn trước ngày 24)
                  </li>
                </ul>
              </li>
            </ul>
            <p className="font-semibold">Chính sách đền bù:</p>
            <ul className="list-disc pl-10">
              <li>Nếu dùng dưới 80% thời gian: cấp mới tài khoản</li>
              <li>Thời gian sữa lỗi quá 2h: cấp mới tài khoản + voucher giảm 10%</li>
            </ul>
            <p className="font-semibold">Miễn trừ trách nhiệm:</p>
            <ul className="list-disc pl-10">
              <li>Chúng tôi không có chính sách miễn trừ trách nhiệm.</li>
              <li>
                Chúng tôi luôn cố gắng hết sức đảm bảo quyền lợi của khách hàng dưới bất kì hình thức
                nào.
              </li>
            </ul>
            <p>
              - Liên hệ người bán tại{' '}
              <a
                href="https://m.me/anphashopacc"
                className="text-sky-5000 text-pink-500 underline"
                target="_blank"
                rel="noreferrer"
              >
                Messenger
              </a>{' '}
            </p>
          </div>

          <div className="mb-12 inline-block w-full px-21/2 md:w-1/2">
            <h3 className="text-[28px] text-dark">Các câu hỏi thường gặp:</h3>
            <ul className="list-decimal pl-10">
              <li>
                <p className="font-semibold">Có thể đổi mã pin profile được không?</p>
                <p>
                  Không! Bạn không được phép thay đổi mã pin và cả tên profile, nếu không tài khoản của
                  bạn sẽ bị thu hồi
                </p>
                <p>*Nhưng bạn có thể tùy ý thay đổi ảnh profile nào mà bạn thích.</p>
              </li>
              <li>
                <p className="font-semibold">Bị quá tải thiết bị trong quá trình sử dụng thì làm sao?</p>
                <p>
                  Hãy chờ trong khoảng 1 - 2 tiếng sau đó quay lại hoặc liên hệ người bán thông qua{' '}
                  <a
                    href="https://m.me/anphashopacc"
                    className="text-sky-5000 text-pink-500 underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Messenger
                  </a>{' '}
                  để được xử lí trong thời gian sớm nhất
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* MARK: Choose Me */}
        <div className="mb-10">
          <h3 className="w-full text-[28px] tracking-wide text-dark">Tại sao chọn tôi</h3>
          <ChooseMe className="mx-[-16px]" />
        </div>
      </section>

      <Divider size={9} />

      {/* MARK: Reviews */}
      {product && (
        <section className="mx-auto max-w-1200 rounded-medium bg-white p-21 shadow-medium">
          <h3 className="mb-3 text-center text-[24px] font-semibold text-dark md:text-left">Đánh giá</h3>

          <ReviewContainer product={product} />
        </section>
      )}
    </div>
  )
}

export default ProductPage

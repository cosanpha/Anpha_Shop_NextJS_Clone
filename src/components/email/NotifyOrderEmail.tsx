import { order as orderSample } from '@/constansts/emailDataSamples'
import { formatPrice } from '@/utils/number'
import { Body, Column, Container, Img, Row, Section, Tailwind } from '@react-email/components'
import { theme } from '../../../tailwind.config'

export function NotifyOrderEmail({ order = orderSample }: { order?: any }) {
  return (
    <Tailwind
      config={{
        theme,
      }}
    >
      <Body className="font-sans text-dark">
        <Container className="bg-white p-4">
          <Section className="mx-auto inline-block">
            <Row className="mb-3 w-full">
              <Column>
                <a href="https://anpha.shop">
                  <Img
                    className="aspect-square rounded-full"
                    src={`${'https://anpha.shop'}/images/logo.jpg`}
                    width={35}
                    height={35}
                  />
                </a>
              </Column>
              <Column>
                <a
                  href="https://anpha.shop"
                  className="text-2xl font-bold tracking-[0.3px] text-dark no-underline"
                >
                  .AnphaShop
                </a>
              </Column>
            </Row>
          </Section>

          <Section
            className="overflow-hidden rounded-lg"
            style={{
              border: '1px solid rgb(0, 0, 0, 0.1)',
            }}
          >
            <div>
              <Img
                src="https://anpha.shop/banners/brand.jpg"
                className="w-full object-cover"
              />
            </div>

            <Row className="p-4">
              <Column className="font">
                <h1 className="text-center text-2xl font-bold">Hi👋 </h1>
                <h2 className="text-center text-xl font-semibold">
                  Bạn có đơn hàng từ Anpha Shop kìa.
                  <br />
                  Mau giao hàng thôi nào!
                </h2>

                <div className="mt-8 text-sm">
                  <p>
                    <b>Mã đơn hàng: </b>
                    <span className="font-semibold tracking-wider text-secondary">{order.code}</span>
                  </p>
                  <p>
                    <b>Ngày đặt hàng: </b>
                    {new Intl.DateTimeFormat('vi', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                      timeZone: 'Asia/Ho_Chi_Minh',
                    })
                      .format(new Date(order.createdAt))
                      .replace('lúc', '')}
                  </p>
                  <p>
                    <b>Trạng thái: </b>
                    <span className="text-yellow-500">Chờ xử lí</span>
                  </p>
                  <p>
                    <b>Tổng tiền: </b>
                    <b>{formatPrice(order.total)}</b>
                  </p>
                  <p>
                    <b>Email: </b>
                    <span className="text-[#0a82ed]">{order.email}</span>
                  </p>
                </div>

                {/* Product */}
                <div className="mt-8">
                  <b className="text-[24px]">Sản phẩm: </b>

                  <ul className="list-none p-0">
                    {order.items.map((item: any) => (
                      <li
                        className="mb-2"
                        key={item._id}
                      >
                        <a
                          href={`https://anpha.shop/${item.product.slug}`}
                          className="block h-full tracking-wider text-dark no-underline"
                        >
                          <Section>
                            <Row>
                              <Column className="w-[130px]">
                                <Img
                                  src={item.product.images[0]}
                                  width={120}
                                  className="inline aspect-video rounded-lg object-cover"
                                />
                              </Column>
                              <Column>
                                <p className="font-semibold text-slate-600">
                                  {item.product.title}
                                  <span className="ml-1.5 rounded-full bg-secondary px-1.5 py-px text-center text-xs font-semibold text-white">
                                    {item.quantity}
                                  </span>
                                </p>
                              </Column>
                            </Row>
                          </Section>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Column>
            </Row>

            {order.userId && (
              <div className="mb-8 p-3 text-center">
                <a
                  href={`https://anpha.shop/admin/order/all`}
                  className="inline cursor-pointer rounded-lg border-0 bg-primary px-7 py-3 font-semibold text-white no-underline"
                >
                  Giao hàng ngay
                </a>
              </div>
            )}
          </Section>

          <div className="flex justify-center pt-[45px]">
            <Img
              className="max-w-full"
              width={620}
              src={`${'https://anpha.shop'}/banners/footer.jpg`}
            />
          </div>

          <p className="text-center text-xs text-slate-600">
            © 2023 | Anpha Shop - Developed by Nguyen Anh Khoa, All rights reserved.
          </p>

          <div className="text-center">
            <a
              href="https://www.messenger.com/t/170660996137305"
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-block"
            >
              <Img
                src={`${'https://anpha.shop'}/images/messenger.jpg`}
                width={35}
                height={35}
                alt="messenger"
              />
            </a>
          </div>
        </Container>
      </Body>
    </Tailwind>
  )
}

export default NotifyOrderEmail

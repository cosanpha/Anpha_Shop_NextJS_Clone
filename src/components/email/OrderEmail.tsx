import { order as orderSample } from '@/constansts/emailDataSamples'
import { formatPrice } from '@/utils/number'
import { Body, Column, Container, Img, Row, Section, Tailwind, Text } from '@react-email/components'
import { theme } from '../../../tailwind.config'

export function OrderEmail({ order = orderSample }: { order?: any }) {
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
                  Cảm ơn bạn đã mua hàng, chúc bạn một ngày tốt lành!
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
                    <span className="text-[#50C878]">Đã giao</span>
                  </p>
                  <p>
                    <b>Phương thức thanh toán: </b>
                    <span className="text-purple-600">
                      {order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                    </span>
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

                {/* Message From Admin */}
                {order.message && typeof order.message === 'string' && order.message.trim() && (
                  <div
                    className="rounded-lg px-21 py-21/2"
                    style={{
                      border: '1px solid rgb(0, 0, 0, 0.1)',
                    }}
                  >
                    <p className="m-0 mb-3 text-center text-sm font-semibold tracking-wider text-slate-400 underline">
                      Lời nhắn từ quản trị viên
                    </p>
                    <p className="m-0 text-sm">{order.message}</p>
                  </div>
                )}

                {/* Product */}
                <p className="mt-8 text-center">
                  <b className="text-[24px]">Sản phẩm</b>
                </p>

                {order.items.map((item: any) => (
                  <div
                    style={{
                      border: '1px solid rgb(0, 0, 0, 0.1)',
                    }}
                    className="mb-4 rounded-lg border p-21/2"
                    key={item._id}
                  >
                    <Text className="m-0 font-semibold text-slate-500">{item.product.title}</Text>

                    {order.accounts
                      .find((acc: any) => acc.productId === item.product._id)
                      .accounts.map((account: any) => (
                        <Text
                          key={account._id}
                          className="m-0 max-w-[600px] overflow-x-auto whitespace-pre border-b py-4"
                        >
                          {account.info}
                        </Text>
                      ))}
                  </div>
                ))}
              </Column>
            </Row>

            {order.userId && (
              <div className="mb-8 p-3 text-center">
                <a
                  href={`https://anpha.shop/user/order/${order.code}`}
                  className="inline cursor-pointer rounded-lg border-0 bg-primary px-7 py-3 font-semibold text-white no-underline"
                >
                  Xem chi tiết
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

export default OrderEmail

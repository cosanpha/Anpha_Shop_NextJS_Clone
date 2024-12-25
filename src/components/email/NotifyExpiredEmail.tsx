import { expiredData } from '@/constansts/emailDataSamples'
import { Body, Column, Container, Img, Row, Section, Tailwind, Text } from '@react-email/components'
import { theme } from '../../../tailwind.config'

export function NotifyExpiredEmail({ data = expiredData }: { data?: any }) {
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
                    alt="logo"
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
                <h1 className="text-center text-2xl font-bold">
                  Tài khoản của bạn sẽ hết hạn sau{' '}
                  <span className="text-rose-500">{data.remainingTime}</span> nữa 🥲{' '}
                </h1>

                <div className="mt-8 text-sm">
                  <p>
                    <b>Ngày đặt hàng: </b>
                    {new Intl.DateTimeFormat('vi', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                      timeZone: 'Asia/Ho_Chi_Minh',
                    })
                      .format(new Date(data.createdAt))
                      .replace('lúc', '')}
                  </p>
                  <p>
                    <b>Trạng thái: </b>
                    <span className="text-slate-400">Hết hạn sau {data.remainingTime} nữa.</span>
                  </p>
                  <p>
                    <b>Email: </b>
                    <span className="text-[#0a82ed]">{data.usingUser}</span>
                  </p>
                </div>

                {/* Product */}
                <p className="mt-8 text-center">
                  <b className="text-[24px]">Sản phẩm</b>
                </p>

                <div
                  style={{
                    border: '1px solid rgb(0, 0, 0, 0.1)',
                  }}
                  className="mb-4 rounded-lg border p-21/2"
                >
                  <Text className="m-0 font-semibold text-slate-500">{data.type.title}</Text>

                  <p className="m-0 max-w-[600px] overflow-x-auto whitespace-pre border-b py-4">
                    {data.info}
                  </p>
                </div>
              </Column>
            </Row>

            <p className="px-21 text-center text-sm italic text-slate-500">
              *Vui lòng gia hạn để tiếp tục sử dụng dịch vụ. Xin chân thành cảm ơn!
            </p>

            <div className="mb-10 p-3 text-center">
              <a
                href={`https://anpha.shop/${data.type.slug}`}
                className="inline cursor-pointer rounded-lg border-0 bg-secondary px-7 py-3 font-semibold text-white no-underline"
              >
                Gia hạn ngay
              </a>
            </div>
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

export default NotifyExpiredEmail

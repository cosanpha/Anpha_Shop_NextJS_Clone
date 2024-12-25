import { Body, Column, Container, Img, Row, Section, Tailwind, Text } from '@react-email/components'
import { theme } from '../../../tailwind.config'
import { formatPrice } from '@/utils/number'
import { updateInfoData } from '@/constansts/emailDataSamples'

export function UpdateInfoEmail({ data = updateInfoData }: { data?: any }) {
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
                <h1 className="text-center text-2xl font-bold">Hi👋</h1>
                <h2 className="text-center text-xl font-semibold">
                  Cập nhật lại thông tin tài khoản vì lí do bảo mật
                </h2>

                <div className="mt-8 text-sm">
                  <p>
                    <b>Mã đơn hàng: </b>
                    <span className="font-semibold tracking-wider text-secondary">{data.code}</span>
                  </p>
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
                    <span className="text-[#50C878]">Đã giao</span>
                  </p>
                  <p>
                    <b>Tổng tiền: </b>
                    <b>{formatPrice(data.total)}</b>
                  </p>
                  <p>
                    <b>Email: </b>
                    <span className="text-[#0a82ed]">{data.email}</span>
                  </p>
                </div>

                {/* Message From Admin */}
                {data.message && typeof data.message === 'string' && data.message.trim() && (
                  <div
                    className="rounded-lg px-21 py-21/2"
                    style={{
                      border: '1px solid rgb(0, 0, 0, 0.1)',
                    }}
                  >
                    <p className="m-0 mb-3 text-center text-sm font-semibold tracking-wider text-slate-400 underline">
                      Lời nhắn từ quản trị viên
                    </p>
                    <p className="m-0 text-sm">{data.message}</p>
                  </div>
                )}

                {/* Product */}
                <p className="mt-8 text-center">
                  <b className="text-xl">
                    Sản phẩm: <span className="italic text-slate-500">{data.product.title}</span>
                  </b>
                </p>

                <div
                  style={{
                    border: '1px solid rgb(0, 0, 0, 0.1)',
                  }}
                  className="mb-4 rounded-lg border bg-sky-50 p-21/2"
                >
                  {/* New Info */}
                  <p className="m-0 mb-4 text-sm font-semibold text-secondary underline">
                    Thông tin mới:
                  </p>

                  <p className="m-0 max-w-[600px] overflow-x-auto whitespace-pre border-b">
                    {data.newInfo.info}
                  </p>
                </div>

                <div
                  style={{
                    border: '1px solid rgb(0, 0, 0, 0.1)',
                  }}
                  className="mb-4 rounded-lg border bg-slate-100 p-21/2 text-slate-500"
                >
                  {/* Old Info */}
                  <p className="m-0 mb-4 text-sm font-semibold underline">Thông tin cũ:</p>

                  <p className="m-0 max-w-[600px] overflow-x-auto whitespace-pre border-b">
                    {data.oldInfo.info}
                  </p>
                </div>

                <p className="text-center text-sm text-slate-600">
                  Xin lỗi bạn vì sự bất tiện này 😢, xin vui lòng đăng nhập lại và tiếp tục sử dịch vụ.
                  Xin chân thành cảm ơn 😊
                </p>
              </Column>
            </Row>
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

export default UpdateInfoEmail

import { Body, Column, Container, Img, Row, Section, Tailwind } from '@react-email/components'
import { theme } from '../../../tailwind.config'

function VerifyPhoneEmail({
  name = 'Nguyễn Pi Pi',
  link = 'https://anpha.shop?token=1234567890',
}: {
  name?: string
  link?: string
}) {
  return (
    <Tailwind
      config={{
        theme,
      }}
    >
      <Body className="font-sans text-dark">
        <Container className="bg-white p-4 pb-6">
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

          <div
            className="border-t"
            style={{
              borderTop: '1px solid rgb(0, 0, 0, 0.1)',
            }}
          />

          <Section className="px-5">
            <p>Hi {name},</p>
            <p>
              Bạn đã gửi yêu cầu xác minh số điện thoại tại{' '}
              <span className="font-semibold">&quot;Anpha Shop&quot;</span> lúc{' '}
              {new Intl.DateTimeFormat('vi', {
                dateStyle: 'full',
                timeStyle: 'medium',
                timeZone: 'Asia/Ho_Chi_Minh',
              })
                .format(new Date())
                .replace('lúc', '')}
              .
            </p>

            <p>Nếu đây không phải là bạn, vui lòng bỏ qua email này.</p>

            <p>
              Ngược lại, nếu đây là bạn, hãy ấn nút bên dưới để{' '}
              <a
                href={link}
                className="text-blue-500"
              >
                xác minh số điện thoại của bạn
              </a>{' '}
              ngay.
            </p>

            {/* Button */}
            <div className="p-3 text-center">
              <a
                href={link}
                className="inline cursor-pointer rounded-lg border-0 bg-secondary px-7 py-3 font-semibold text-white no-underline"
              >
                Xác minh số điện thoại
              </a>
            </div>

            <p>
              Để giữ có tài khoản của bạn được an toàn, vui lòng không chia sẻ email này với bất kỳ ai.
            </p>
            <p>
              Nếu có bất kỳ thắc mắc nào? Vui lòng liên hệ Anpha Shop để được hỗ trợ một cách nhiệt tình
              và nhanh chống:{' '}
              <a
                href="https://www.messenger.com/t/170660996137305"
                className="text-blue-500"
              >
                Liên hệ
              </a>
            </p>
            <p>
              Chân thành cảm ơn,
              <br />
              Anpha Shop
            </p>
          </Section>

          {/* Footer */}
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

export default VerifyPhoneEmail

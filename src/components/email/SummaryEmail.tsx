import { formatPrice } from '@/utils/number'
import { Body, Column, Container, Img, Row, Section, Tailwind, Text } from '@react-email/components'
import { theme } from '../../../tailwind.config'
import { summary as summarySample } from '@/constansts/emailDataSamples'

export function SummaryEmail({ summary = summarySample }: { summary?: any }) {
  const { collaborator: user, vouchers, income } = summary
  const curMonth = new Date().getMonth() + 1

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
                <h1 className="text-center text-2xl font-bold">
                  Hi{' '}
                  {user.firstname && user.lastname
                    ? user.firstname + ' ' + user.lastname
                    : user.username}
                  👋{' '}
                </h1>

                <h2 className="mt-0 text-center text-3xl font-semibold text-slate-400">
                  Báo cáo thu nhập tháng {curMonth}
                </h2>

                <div className="mt-8 text-sm">
                  <p>
                    <b>Cộng tác viên: </b>
                    <span>
                      {(user.firstname && user.lastname
                        ? user.firstname + ' ' + user.lastname
                        : user.username) || user.email}
                    </span>
                  </p>
                  <p>
                    <b>Hoa hồng: </b>
                    <span className="font-semibodl text-rose-500">{user.commission.value}</span>
                  </p>
                  <p>
                    <b>Số lượng voucher trong tháng: </b>
                    <span>{vouchers.length}</span>
                  </p>
                  <p>
                    <b>Thu nhập trong tháng {curMonth}: </b>
                    <b className="text-green-500">{formatPrice(income)}</b>
                  </p>
                </div>

                {/* Vouchers */}
                <p className="mt-8 text-center">
                  <b className="text-[24px]">Vouchers</b>
                </p>

                <div
                  className="rounded-lg"
                  style={{ border, boxSizing: 'border-box' }}
                >
                  <div
                    className="w-full p-3 text-center"
                    style={{ borderBottom: border, boxSizing: 'border-box' }}
                  >
                    <div className="inline-block w-1/2 font-semibold">Voucher</div>
                    <div className="inline-block w-1/2 font-semibold">
                      <span>Tích lũy</span>
                    </div>
                  </div>
                  {vouchers.map((voucher: any, index: number) => (
                    <div
                      className="w-full p-3 text-center"
                      style={{
                        borderBottom: index != vouchers.length - 1 ? border : 0,
                        boxSizing: 'border-box',
                      }}
                      key={voucher._id}
                    >
                      <div className="inline-block w-1/2">
                        <span className="text-secondary">{voucher.code}</span>
                      </div>
                      <div className="inline-block w-1/2">
                        <span className="text-green-500">{formatPrice(voucher.accumulated)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-center text-sm text-slate-500">
                  Xin chân thành cảm ơn bạn đã đồng hành cùng Anpha Shop trong thời gian qua. Chúc bạn
                  một ngày tốt lành 😊
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

export default SummaryEmail

const border = '1px solid rgb(0, 0, 0, 0.1)'

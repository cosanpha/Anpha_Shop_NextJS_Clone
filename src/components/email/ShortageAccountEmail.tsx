import { Body, Column, Container, Img, Row, Section, Tailwind } from '@react-email/components'
import { theme } from '../../../tailwind.config'

export function ShortageAccountEmail({
  message = 'Thiếu sản phẩm gì gì đó rồi á',
}: {
  message?: string
}) {
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
              border: '2px solid #f44336',
            }}
          >
            <div>
              <Img
                src="https://anpha.shop/banners/brand.jpg"
                className="w-full object-cover"
              />
            </div>

            <Row className="px-8 py-4">
              <Column className="font">
                <h1 className="text-center text-2xl font-bold">Oh Nooooo....😱 </h1>
                <h2
                  className="rounded-lg bg-yellow-100 px-21 py-21/2 text-center text-xl font-semibold text-rose-500"
                  style={{
                    border: '2px solid #f44336',
                  }}
                >
                  {message}
                </h2>
              </Column>
            </Row>

            <div className="mb-10 p-3 text-center">
              <a
                href={`https://anpha.shop/admin/product/add`}
                className="inline cursor-pointer rounded-lg border-0 bg-secondary px-7 py-3 font-semibold text-white no-underline"
              >
                Thêm sản phẩm ngay
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

export default ShortageAccountEmail

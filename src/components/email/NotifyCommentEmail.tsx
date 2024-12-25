import { commentData } from '@/constansts/emailDataSamples'
import { Body, Column, Container, Img, Row, Section, Tailwind } from '@react-email/components'
import { theme } from '../../../tailwind.config'

export function NotifyCommentEmail({ data = commentData }: { data?: any }) {
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
                <h1 className="text-center text-2xl font-bold">Hi {data.receiver}👋 </h1>
                <h2 className="text-center text-xl font-semibold">
                  Có người vừa phản hồi bình luận của bạn, hãy phản hồi lại ngay nào 😊!
                </h2>

                <div className="mt-8 text-sm">
                  <p>
                    <b>Người bình luận: </b>
                    <span className="font-semibold tracking-wider text-secondary">
                      {data.senderName}
                    </span>{' '}
                    <span className="text-slate-500">({data.senderEmail})</span>
                  </p>
                  <p>
                    <b>Người nhận: </b>
                    <span className="font-semibold tracking-wider text-secondary">
                      {data.receiver}
                    </span>{' '}
                    <span className="text-slate-500">({data.receiverEmail})</span>
                  </p>
                  <p>
                    <b>Thời gian: </b>
                    {new Intl.DateTimeFormat('vi', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                      timeZone: 'Asia/Ho_Chi_Minh',
                    })
                      .format(new Date(data.time))
                      .replace('lúc', '')}
                  </p>
                  <p>
                    <b>Nội dung: </b>
                    <span className="text-slate-500">{data.content}</span>
                  </p>
                </div>
              </Column>
            </Row>

            <div className="mb-10 p-3 text-center">
              <a
                href={data.slug}
                className="inline cursor-pointer rounded-lg px-7 py-3 font-semibold text-slate-500 no-underline"
                style={{
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                }}
              >
                Phản hồi ngay
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

export default NotifyCommentEmail

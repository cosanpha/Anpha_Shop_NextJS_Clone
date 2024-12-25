import NotifyCommentEmail from '@/components/email/NotifyCommentEmail'
import NotifyExpiredEmail from '@/components/email/NotifyExpiredEmail'
import NotifyOrderEmail from '@/components/email/NotifyOrderEmail'
import OrderEmail from '@/components/email/OrderEmail'
import ResetPasswordEmail from '@/components/email/ResetPasswordEmail'
import ShortageAccountEmail from '@/components/email/ShortageAccountEmail'
import SummaryEmail from '@/components/email/SummaryEmail'
import UpdateInfoEmail from '@/components/email/UpdateInfoEmail'
import VerifyEmailEmail from '@/components/email/VerifyEmailEmail'
import VerifyPhoneEmail from '@/components/email/VerifyPhoneEmail'

function EmailTemplatePage({ params: { type } }: { params: { type: string } }) {
  const renderComponent = () => {
    switch (type) {
      case 'order':
        return <OrderEmail />
      case 'update-info':
        return <UpdateInfoEmail />
      case 'reset-password':
        return <ResetPasswordEmail />
      case 'verify-email':
        return <VerifyEmailEmail />
      case 'notify-order':
        return <NotifyOrderEmail />
      case 'summary':
        return <SummaryEmail />
      case 'shortage-account':
        return <ShortageAccountEmail />
      case 'notify-expired':
        return <NotifyExpiredEmail />
      case 'notify-comment':
        return <NotifyCommentEmail />
      case 'verify-phone':
        return <VerifyPhoneEmail />
      default:
        return null
    }
  }

  return renderComponent()
}

export default EmailTemplatePage

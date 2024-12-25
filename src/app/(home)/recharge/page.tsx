'use client'

import Divider from '@/components/Divider'
import { admins } from '@/constansts'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback } from 'react'
import toast from 'react-hot-toast'
import { FaCopy } from 'react-icons/fa6'
import { IoIosHelpCircle } from 'react-icons/io'

function RechargePage() {
  // hooks
  const { data: session } = useSession()
  const curUser: any = session?.user

  // values
  const admin: any = admins[(process.env.NEXT_PUBLIC_ADMIN! as keyof typeof admins) || 'KHOA']

  // handle copy
  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Đã sao chép: ' + text)
  }, [])

  const content = 'NAP ' + curUser?.email.split('@')[0]

  return (
    <div className="mt-20 rounded-medium bg-white p-21 shadow-medium">
      <h1 className="mb-2 text-center text-4xl font-semibold">Nạp tiền vào tài khoản</h1>
      <p className="text-center font-[500]">
        Để mua tài khoản, hãy nạp tiền vào tài khoản qua 2 hình thức sau nhá!
      </p>

      <Divider size={12} />

      <div className="grid grid-cols-1 gap-7 pb-16 font-semibold lg:grid-cols-2">
        {/* MARK: Momo */}
        <div className="col-span-1">
          <h2 className="mb-3 text-center text-2xl text-[#a1396c]">Chuyển khoản Momo</h2>

          <ul className="mb-5 list-decimal pl-6 font-semibold">
            <li>Vào ứng dụng momo của bạn trên điện thoại</li>
            <li>Chọn chức năng quét mã QR</li>
            <li>
              <br />
              <p>
                - Bấm vào link sau:{' '}
                <a
                  className="text-[#a1396c] underline"
                  href={admin.momo.link}
                >
                  Link nạp bằng Momo
                </a>
              </p>
              <p>(hoặc)</p>
              <p>- Quét mã QR bên dưới</p>
            </li>
            <li>Nhập số tiền bạn muốn nạp</li>
            <li>
              Nhập nội dung chuyển tiền:{' '}
              <span
                className="cursor-pointer text-orange-600"
                onClick={() => handleCopy(content)}
              >
                {content}
              </span>
            </li>
            <li>
              Hoàn tất quá trình nạp tiền (tên người nhận:{' '}
              <span
                className="cursor-pointer text-green-500"
                onClick={() => handleCopy(admin.momo.receiver)}
              >
                {admin.momo.receiver}
              </span>
              )
            </li>
          </ul>

          <p>Sau từ 1 - 5 phút tài khoản của bạn sẽ được cộng tiền.</p>
          <p>
            *Nếu không thấy được cộng tiền thì liên hệ đến admin để được giải quyết nhá: *Nếu không thấy
            được cộng tiền thì liên hệ đến admin để được giải quyết nhá:{' '}
            <Link
              className="text-pink-700"
              href={admin.messenger}
              target="_blank"
            >
              {admin.messenger}
            </Link>
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative overflow-hidden rounded-lg shadow-medium transition duration-300 hover:-translate-y-2">
              <Image
                src={admin.momo.image}
                height={700}
                width={350}
                alt="momo-qr"
              />
              <Image
                className="absolute left-1/2 top-[56%] w-[58%] -translate-x-1/2 -translate-y-[50%]"
                src={`https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=2|99|${admin.momo.account}|||0|0|0|${content}|transfer_p2p`}
                height={700}
                width={350}
                alt="momo-qr"
              />
              <Image
                className="absolute left-1/2 top-[56%] w-[12%] -translate-x-1/2 -translate-y-[50%] rounded-md bg-[#333] p-1"
                src="/images/logo.jpg"
                height={42}
                width={42}
                alt="momo-qr"
              />
            </div>
          </div>

          <p className="mb-2 mt-8">
            *Nếu không quét được thì bạn có thể nhập thông tin chuyển khoản tại đây:
          </p>

          <div className="mb-1 rounded-md border border-slate-400 px-4 py-2">
            <div>
              Số tài khoản Momo:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-[#a1396c]"
                onClick={() => handleCopy(admin.momo.account)}
              >
                <span className="px-2 py-0.5">{admin.momo.account}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
            <div className="mt-0.5">
              Nội dung chuyển khoản:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-orange-600"
                onClick={() => handleCopy(content)}
              >
                <span className="px-2 py-0.5">{content}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
          </div>
          <p className="mb-1 flex items-center gap-1 text-slate-500">
            <IoIosHelpCircle size={20} /> Ấn để sao chép
          </p>

          <p>
            *Nếu không thấy được cộng tiền thì liên hệ đến admin để được giải quyết nhá:{' '}
            <Link
              className="text-pink-700"
              href={admin.messenger}
              target="_blank"
            >
              {admin.messenger}
            </Link>
          </p>
        </div>

        {/* MARK: Banking */}
        <div className="col-span-1">
          <h2 className="mb-3 text-center text-2xl text-[#399162]">Chuyển khoản ngân hàng</h2>

          <ul className="mb-5 list-decimal pl-6 font-semibold">
            <li>Vào ứng dụng ngân hàng của bạn trên điện thoại</li>
            <li>Chọn chức năng quét mã QR</li>
            <li>
              <br />
              <p>
                - Bấm vào link sau:{' '}
                <a
                  className="text-[#399162] underline"
                  href={`https://dl.vietqr.io/pay?app=vcb&ba=1040587211@vcb&tn=${content}`}
                >
                  Link nạp bằng Vietcombank
                </a>
              </p>
              <p>(hoặc)</p>
              <p>- Quét mã QR bên dưới</p>
            </li>
            <li>Nhập số tiền bạn muốn nạp</li>
            <li>
              Nhập nội dung chuyển tiền:{' '}
              <span
                className="cursor-pointer text-orange-600"
                onClick={() => handleCopy(content)}
              >
                {content}
              </span>
            </li>
            <li>
              Hoàn tất quá trình nạp tiền (tên người nhận:{' '}
              <span
                className="cursor-pointer text-green-500"
                onClick={() => handleCopy(admin.banking.receiver)}
              >
                {admin.banking.receiver}
              </span>
            </li>
          </ul>

          <p>Sau từ 1 - 5 phút tài khoản của bạn sẽ được cộng tiền.</p>
          <p>
            *Nếu không thấy được cộng tiền thì liên hệ đến admin để được giải quyết nhá:{' '}
            <Link
              className="text-pink-700"
              href={admin.messenger}
              target="_blank"
            >
              {admin.messenger}
            </Link>
          </p>

          <div className="mt-6 flex justify-center">
            <div className="relative overflow-hidden rounded-lg shadow-medium transition duration-300 hover:-translate-y-2">
              <Image
                src={admin.banking.image}
                height={700}
                width={350}
                alt="banking-qr"
              />
              <Image
                className="absolute left-1/2 top-[41%] w-[47%] -translate-x-1/2 -translate-y-[50%]"
                src={`https://img.vietqr.io/image/970436-1040587211-eeua38J.jpg?addInfo=${encodeURI(
                  content
                )}&accountName=${admin.banking.receiver}`}
                height={700}
                width={350}
                alt="banking-qr"
              />
            </div>
          </div>

          <p className="mb-2 mt-8">
            *Nếu không quét được thì bạn có thể nhập thông tin chuyển khoản tại đây:
          </p>

          <div className="mb-1 rounded-md border border-slate-400 px-4 py-2">
            <div>
              Ngân hàng:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-[#399162]"
                onClick={() => handleCopy(admin.banking.name)}
              >
                <span className="px-2 py-0.5">{admin.banking.name}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
            <div className="mt-0.5">
              Số tài khoản:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-secondary"
                onClick={() => handleCopy(admin.banking.account)}
              >
                <span className="px-2 py-0.5">{admin.banking.account}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
            <div className="mt-0.5">
              Nội dung chuyển khoản:{' '}
              <div
                className="inline-flex cursor-pointer overflow-hidden rounded-md border border-dark text-orange-600"
                onClick={() => handleCopy(content)}
              >
                <span className="px-2 py-0.5">{content}</span>
                <div className="flex items-center justify-center bg-dark-100 px-1.5 py-0.5 text-light">
                  <FaCopy size={14} />
                </div>
              </div>
            </div>
          </div>
          <p className="mb-1 flex items-center gap-1 text-slate-500">
            <IoIosHelpCircle size={20} /> Ấn để sao chép
          </p>

          <p>
            *Nếu không thấy được cộng tiền thì liên hệ đến admin để được giải quyết nhá:{' '}
            <Link
              className="text-pink-700"
              href={admin.messenger}
              target="_blank"
            >
              {admin.messenger}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RechargePage

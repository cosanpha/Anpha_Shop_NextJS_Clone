'use client'

import LoadingButton from '@/components/LoadingButton'
import { order, summary, updateInfoData } from '@/constansts/emailDataSamples'
import { useCallback, useState } from 'react'

const types = [
  {
    type: 'order',
    sample: { order },
  },
  {
    type: 'update-info',
    sample: { data: updateInfoData },
  },
  {
    type: 'reset-password',
    sample: { name: 'Ohara', link: 'https://anpha.shop' },
  },
  {
    type: 'verify-email',
    sample: { name: 'Naruto', link: 'https://anpha.shop' },
  },
  {
    type: 'notify-order',
    sample: { order },
  },
  {
    type: 'summary',
    sample: { summary },
  },
  {
    type: 'shortage-account',
    sample: { message: 'Thiếu tài khoản Netflix 100 năm' },
  },
]

function EmailPage() {
  // states
  const [loading, setLoading] = useState<boolean>(false)
  const [selectedSample, setSelectedSample] = useState<any>(null)

  const handleSentMail = useCallback(async (type: string) => {
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/test/email?type=${type}`)
      const data = await res.json()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="mx-auto max-w-1200">
      <div className="grid cursor-pointer grid-cols-7 gap-21">
        {types.map(type => (
          <div
            className="shaodow-lg flex flex-col items-center rounded-lg bg-sky-50 p-3"
            key={type.type}
            onClick={() => setSelectedSample(type.sample)}
          >
            <h1 className="mb-2 text-center font-semibold text-dark">{type.type}</h1>

            <LoadingButton
              className="trans-200 w-20 rounded-lg bg-secondary px-4 py-2 font-semibold text-white hover:bg-primary"
              onClick={() => handleSentMail(type.type)}
              text="Send"
              isLoading={loading}
            />
          </div>
        ))}
      </div>

      <div className="mt-21 min-h-[300px] overflow-scroll whitespace-pre rounded-lg bg-sky-50 p-21 shadow-lg">
        <pre>{JSON.stringify(selectedSample, null, 2)}</pre>
      </div>
    </div>
  )
}

export default EmailPage

import { chooseMeList } from '@/constansts'
import Image from 'next/image'
import { memo } from 'react'

interface ChooseMeProps {
  className?: string
}

function ChooseMe({ className = '' }: ChooseMeProps) {
  return (
    <div className={`mx-auto max-w-1200 ${className}`}>
      <div className="-mx-21 grid grid-cols-1 justify-between px-21/2 sm:grid-cols-2 sm:px-0 md:grid-cols-4">
        {chooseMeList.map(item => (
          <div
            className="p-21/2 transition-all duration-300 hover:-translate-y-2 sm:p-21"
            key={item.image}
          >
            <div className="flex flex-col items-center overflow-hidden rounded-small bg-white shadow-medium">
              <div className="aspect-square p-3">
                <Image
                  src={item.image}
                  width={250}
                  height={250}
                  alt={item.title}
                />
              </div>

              <h3 className="px-21 pb-21 text-center font-body text-[22px] font-semibold text-darker">
                {item.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default memo(ChooseMe)

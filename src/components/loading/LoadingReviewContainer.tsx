import Divider from '../Divider'
import LoadingReview from './LoadingReview'

function LoadingReviewContainer() {
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex w-full flex-col items-center justify-center gap-2 md:max-w-[200px]">
          <div className="loading h-7 w-[50px] rounded-lg" />
          <div className="loading h-3 w-[100px] rounded-lg" />
          <div className="loading h-4 w-[80px] rounded-lg" />
        </div>
        <ul className="group flex flex-1 flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              className="trans-200 flex cursor-pointer items-center gap-2"
              key={index}
            >
              <div className="loading h-4 w-4 flex-shrink-0 rounded-full" />
              <div className="loading h-4 w-4 flex-shrink-0 rounded-full" />

              <div className="loading h-3 w-full rounded-full" />

              <div className="loading h-4 w-4 flex-shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
        <div className="flex w-full flex-col items-center justify-center gap-2 md:max-w-[200px]">
          <div className="loading h-4 w-[200px] rounded-lg" />
          <div className="loading h-3 w-[100px] rounded-lg" />
          <div className="loading h-9 w-[100px] rounded-lg" />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingReview key={index} />
        ))}
      </div>

      <Divider size={5} />
    </div>
  )
}

export default LoadingReviewContainer

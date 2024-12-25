function LoadingReview() {
  return (
    <>
      <div className="trans-200 relative flex gap-3 rounded-lg px-4 py-2">
        <div className="loading h-10 w-10 rounded-full" />

        <div className="flex flex-1 items-start justify-between gap-2">
          <div className="flex w-full flex-col gap-1.5">
            <div className="flex flex-col gap-x-2 gap-y-1 md:flex-row md:items-center">
              <div className="loading h-3 w-[100px] rounded-lg" />

              <div className="loading h-4 w-[150px] rounded-lg" />
            </div>

            <div className="loading h-3 w-[100px] rounded-lg" />
            <div className="loading h-3 w-[250px] rounded-lg" />
          </div>
        </div>
      </div>
    </>
  )
}

export default LoadingReview

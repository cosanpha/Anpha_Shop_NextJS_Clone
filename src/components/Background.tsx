import { memo } from 'react'
import ParticlesContainer from './ParticlesContainer'

function Background({ noBeta }: { noBeta?: boolean }) {
  return (
    <>
      <div className="fixed left-0 top-0 -z-10 h-screen w-screen bg-[#333]" />
      <div className="background-app fixed left-0 top-0 -z-10 h-screen w-screen opacity-80" />

      {!noBeta && (
        <div className="fixed left-0 top-0 -z-10 flex h-screen w-screen items-center justify-center font-semibold">
          <p className="bg-gradient-to-b from-[#01dbe5] to-[#01dbe510] bg-clip-text text-center text-[80px] text-transparent drop-shadow-lg">
            Anpha Shop
          </p>
          {/* <ParticlesContainer /> */}
        </div>
      )}
    </>
  )
}

export default memo(Background)

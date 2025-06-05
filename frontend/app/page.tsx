import { GameLayout } from '@/components/game-layout'
import { DEFAULT_CONFIG } from '@/constants/game'

export default function GamePage() {
  return (
    <div className="relative h-screen w-screen">
      <div className="h-full w-full overflow-hidden">
        <GameLayout config={DEFAULT_CONFIG} />
      </div>
    </div>
  )
}

import { memo } from 'react'
import useAnimatedNumber from '../hooks/useAnimatedNumber'

// Every tick of the spin animation calls setDisplay inside useAnimatedNumber.
// If that hook is called directly inside DashboardInner, each tick re-renders
// the whole dashboard - graph, tabs, memo checks, everything - ~60x/sec per
// stat, x7 stats. Isolating it here means a tick only re-renders this <span>.
const AnimatedStatValue = memo(function AnimatedStatValue({
  value,
}: {
  value: number
}) {
  const display = useAnimatedNumber(value)
  return <>{display}</>
})

export default AnimatedStatValue

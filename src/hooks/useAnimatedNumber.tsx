import { useCallback, useEffect, useRef, useState } from 'react'

function randomDigit() {
  return Math.floor(Math.random() * 10)
}

function spinValue(final: string, settleIndex: number): string {
  let result = ''
  for (let i = 0; i < final.length; i++) {
    if (i < settleIndex) {
      result += final[i]
    } else {
      result += randomDigit()
    }
  }
  return result
}

function useAnimatedNumber(target: number, duration = 900) {
  const [display, setDisplay] = useState(String(target))
  const rafRef = useRef<number | undefined>(undefined)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const targetRef = useRef(target)

  const animate = useCallback(() => {
    const final = String(targetRef.current)
    const len = final.length || 1
    const start = performance.now()

    const tick = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(elapsed / duration, 1)

      if (progress < 0.65) {
        setDisplay(spinValue(final, 0))
        rafRef.current = requestAnimationFrame(tick)
      } else {
        const settleProgress = (progress - 0.65) / 0.35
        const settleIndex = Math.floor(settleProgress * len)
        setDisplay(spinValue(final, settleIndex))
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setDisplay(final)
        }
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }, [duration])

  useEffect(() => {
    targetRef.current = target
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    timeoutRef.current = setTimeout(() => {
      animate()
    }, 30)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, animate])

  return display
}

export default useAnimatedNumber

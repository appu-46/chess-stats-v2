import { useLayoutEffect, useRef, useState } from 'react'

// Whether a scroll area has more below, for fading its bottom edge (the
// leaderboard, the switch-player favourites). Pass the element `ref` and
// `onScroll`; `deps` are what change its rows, such as a filter. It's also
// re-checked when the area resizes (the window, or the phone layout where
// it doesn't scroll at all).
function useBottomFade<T extends HTMLElement>(deps: ReadonlyArray<unknown>) {
  const ref = useRef<T>(null)
  const [fadeBottom, setFadeBottom] = useState(false)

  function onScroll() {
    const element = ref.current
    if (!element) return
    setFadeBottom(
      element.scrollTop + element.clientHeight < element.scrollHeight - 1,
    )
  }

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    onScroll()
    const observer = new ResizeObserver(onScroll)
    observer.observe(element)
    return () => observer.disconnect()
  }, deps)

  return { ref, fadeBottom, onScroll }
}

export default useBottomFade

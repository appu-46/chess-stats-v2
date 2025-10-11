import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { FloatingIndicator, UnstyledButton } from '@mantine/core'
// import classes from './Demo.module.css'

import classes from '../css/FloatingTab.module.css'
import { useTabContext } from '../contexts/TabContext'

const data = ['Profile', 'Stats']

function FloatingTab() {
  const { activeTab, setActiveTab } = useTabContext()
  const queryClient = useQueryClient()
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null)
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({})
  const params = useParams({ strict: false })
  const username = 'username' in params ? params.username : null
  const navigate = useNavigate()

  const setControlRef = (index: number) => (node: HTMLButtonElement) => {
    controlsRefs[index] = node
    setControlsRefs(controlsRefs)
  }

  const handleTabClick = (index: number) => {
    setActiveTab(index)

    // Otherwise, handle navigation automatically (Profile/Stats pages)
    if (!username) return

    if (index === 0) {
      navigate({ to: '/profile/$username', params: { username } })
      queryClient.invalidateQueries({ queryKey: ['profile', username] })
    } else {
      navigate({ to: '/stats/$username', params: { username } })
      queryClient.invalidateQueries({ queryKey: ['stats', username] })
    }
  }

  const controls = data.map((item, index) => (
    <UnstyledButton
      key={item}
      className={classes.control}
      ref={setControlRef(index)}
      onClick={() => handleTabClick(index)}
      mod={{ active: activeTab === index }}
    >
      <span className={classes.controlLabel}>{item}</span>
    </UnstyledButton>
  ))

  return (
    <div className={classes.root} ref={setRootRef}>
      {controls}

      <FloatingIndicator
        target={controlsRefs[activeTab]}
        parent={rootRef}
        className={classes.indicator}
      />
    </div>
  )
}

export default FloatingTab

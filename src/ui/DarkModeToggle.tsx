import { Switch, useMantineColorScheme } from '@mantine/core'
import { IconMoonStars, IconSun } from '@tabler/icons-react'
import styled from 'styled-components'

const StyledDarkModeToggle = styled.div`
  margin-top: 5rem;
`

function DarkModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  function handleClick() {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light')
  }

  return (
    <StyledDarkModeToggle>
      <Switch
        size="md"
        color="dark.4"
        onChange={() => handleClick()}
        checked={colorScheme === 'dark'}
        styles={{
          track: {
            transition: 'background-color 0.3s ease',
          },
          thumb: {
            transition: 'transform 0.3s ease, background-color 0.3s ease',
          },
        }}
        onLabel={
          <IconSun
            size={20}
            stroke={1.5}
            color="var(--mantine-color-yellow-4)"
          />
        }
        offLabel={
          <IconMoonStars
            size={20}
            stroke={1.5}
            color="var(--mantine-color-blue-6)"
          />
        }
      />
    </StyledDarkModeToggle>
  )
}

export default DarkModeToggle

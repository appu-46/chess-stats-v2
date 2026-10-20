import { Switch, useMantineColorScheme } from '@mantine/core'
import { IconMoonStars, IconSun } from '@tabler/icons-react'

// The site's original sun/moon switch.
function DarkModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme()

  function handleClick() {
    setColorScheme(colorScheme === 'light' ? 'dark' : 'light')
  }

  return (
    <Switch
      size="md"
      color="#105037"
      aria-label="Dark mode"
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
        <IconSun size={20} stroke={1.5} color="var(--mantine-color-yellow-4)" />
      }
      offLabel={
        <IconMoonStars
          size={20}
          stroke={1.5}
          color="var(--mantine-color-blue-6)"
        />
      }
    />
  )
}

export default DarkModeToggle

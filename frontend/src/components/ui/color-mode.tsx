"use client"

import { IconButton, Skeleton, Box } from "@chakra-ui/react"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  return {
    colorMode: resolvedTheme as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps extends Omit<React.ComponentProps<typeof IconButton>, "aria-label"> {}

export const ColorModeButton = React.forwardRef<HTMLButtonElement, ColorModeButtonProps>(
  function ColorModeButton(props: ColorModeButtonProps, ref: React.Ref<HTMLButtonElement>) {
    const { toggleColorMode } = useColorMode()
    const [mounted, setMounted] = React.useState(false)
    
    // Only show the button after component mounts (client-side)
    React.useEffect(() => {
      setMounted(true)
    }, [])
    
    if (!mounted) {
      return <Skeleton w="8" h="8" />
    }
    
    return (
      <IconButton
        onClick={toggleColorMode}
        variant="ghost"
        aria-label="Toggle color mode"
        size="sm"
        ref={ref}
        icon={<ColorModeIcon />}
        w="5"
        h="5"
        {...props}
      />
    )
  }
)

export const LightMode = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Box>>(
  function LightMode(props, ref) {
    return (
      <Box
        color="gray.800"
        display="contents"
        className="chakra-theme light"
        ref={ref}
        {...props}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof Box>>(
  function DarkMode(props, ref) {
    return (
      <Box
        color="gray.200"
        display="contents"
        className="chakra-theme dark"
        ref={ref}
        {...props}
      />
    )
  },
)
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

// Powder blue scale anchored at brand.200 = #B8CCE0 (logo background color).
// Dark chocolate brown (#2C1810) is used for headings (logo text / hat outline).
const brand = {
  50:  '#F3F7FB',
  100: '#E3EDF6',
  200: '#B8CCE0',
  300: '#8DAFC9',
  400: '#6392B2',
  500: '#3A739B',
  600: '#2D5A7A',
  700: '#214259',
  800: '#142938',
  900: '#091217',
}

export const theme = extendTheme({
  config,
  direction: 'rtl',
  colors: {
    brand,
  },
  fonts: {
    body: "'Heebo', sans-serif",
    heading: "'Heebo', sans-serif",
  },
  styles: {
    global: {
      body: {
        bg: 'brand.50',
      },
    },
  },
  components: {
    Heading: {
      baseStyle: {
        color: '#2C1810',
      },
    },
  },
})

import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  useColorMode
} from "@chakra-ui/react"
import { Logo } from "./Logo"
import Routers from './routers'

function ForceLightMode(props: { children: JSX.Element }) {
  const { colorMode, toggleColorMode } = useColorMode();

  React.useEffect(() => {
    if (colorMode === "light") return;
    toggleColorMode();
  }, [colorMode]);

  return props.children;
}

export const App = () => (
  <ChakraProvider theme={theme}>
    <Box fontSize="xl">
      <Grid>
        <Routers />
      </Grid>
    </Box>
  </ChakraProvider>
)

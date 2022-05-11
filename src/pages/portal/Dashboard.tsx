import { Box, Grid, GridItem, Heading } from '@chakra-ui/react'
import useWindowDimensions from '../../components/useWindowDimensions'

const Dashboards = () => {
    const { width }: any = useWindowDimensions();

    return (
        <Box w='100%' p={4} color='white'>
            <Grid h='100%'
                templateRows='repeat(5, 1fr)'
                templateColumns='repeat(5, 1fr)'
                gap={4}
            >
                <GridItem rowSpan={width <= 900 ? 1 : 2} colSpan={width <= 900 ? 5 : 1} bg='red' >
                    <Heading m={3}>
                        Welcome User
                    </Heading>
                </GridItem>
                <GridItem colSpan={width <= 900 ? 5 : 2} bg='papayawhip'>
                    Notif 1
                </GridItem>
                <GridItem colSpan={width <= 900 ? 5 : 2} bg='papayawhip'>
                    Notif 2
                </GridItem>
                <GridItem colSpan={width <= 900 ? 5 : 4} bg='tomato'>
                    App list
                </GridItem>
            </Grid>
        </Box>
    )
}

export default Dashboards

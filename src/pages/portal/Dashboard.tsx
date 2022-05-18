import {
    Box,
    GridItem,
    Grid
} from '@chakra-ui/react';
import useWindowDimensions from '../../components/useWindowDimensions'
import CardAccount from '../../components/CardAccount';

const Dashboards = () => {
    const { width }: any = useWindowDimensions();

    return (
        <Box w='100%' p={4}>
            <Grid h='100%'
                templateRows='repeat(5, 1fr)'
                templateColumns='repeat(5, 1fr)'
                gap={4}
                textAlign={'center'}
            >
                <GridItem rowSpan={width <= 900 ? 1 : 2} colSpan={width <= 900 ? 5 : 1} >
                    <CardAccount />
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

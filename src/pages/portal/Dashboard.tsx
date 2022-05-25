import {
    Box,
    GridItem,
    Grid,
    Heading,
    Divider
} from '@chakra-ui/react';
import useWindowDimensions from '../../components/useWindowDimensions'
import CardAccount from '../../components/CardAccount';
import AppListCard from '../../components/AppListCard';

const Dashboards = () => {
    const { width }: any = useWindowDimensions();

    return (
        <Box w='100%' p={5} h={'90vh'}>
            <Grid h='100%'
                templateRows='repeat(5, 1fr)'
                templateColumns='repeat(5, 1fr)'
                gap={4}
                textAlign={'center'}
            >
                <GridItem rowSpan={width <= 900 ? 1 : 2} colSpan={width <= 900 ? 5 : 1} >
                    <CardAccount />
                </GridItem>
                <GridItem colSpan={width <= 900 ? 5 : 2} bg='papayawhip' p={4}>
                    <Heading size={'md'}>Announcements</Heading>
                    <div>

                    </div>
                </GridItem>
                <GridItem colSpan={width <= 900 ? 5 : 2} bg='papayawhip' p={4}>
                    <Heading size={'md'}>Messages</Heading>
                </GridItem>
                <GridItem
                    colSpan={width <= 900 ? 3 : 4}
                    bg='tomato'
                    p={4}
                    h={'70vh'}
                >
                    <Heading size={'md'}>App</Heading>
                    <Grid style={{ overflow: 'auto' }}>
                        <Divider/>
                        <Grid
                            // templateRows={`repeat(${width <= 900 ? 1 : 3}, 1fr)`}
                            templateColumns={`repeat(${width <= 900 ? 1 : 3}, 1fr)`}
                            gap={1}
                            textAlign={'center'}
                        >
                            <GridItem>
                                <AppListCard />
                            </GridItem>

                            <GridItem>
                                <AppListCard />
                            </GridItem>
                            <GridItem>
                                <AppListCard />
                            </GridItem>
                            <GridItem>
                                <AppListCard />
                            </GridItem>
                            <GridItem>
                                <AppListCard />
                            </GridItem>
                        </Grid>

                        <Grid
                            // templateRows={`repeat(${width <= 900 ? 1 : 3}, 1fr)`}
                            templateColumns={`repeat(${width <= 900 ? 1 : 3}, 1fr)`}
                            gap={2}
                            textAlign={'center'}
                        >
                            <GridItem>
                                <AppListCard />
                            </GridItem>

                            <GridItem>
                                <AppListCard />
                            </GridItem>
                            <GridItem>
                                <AppListCard />
                            </GridItem>
                            <GridItem>
                                <AppListCard />
                            </GridItem>
                            <GridItem>
                                <AppListCard />
                            </GridItem>
                        </Grid>
                    </Grid>
                </GridItem>
            </Grid>
        </Box >
    )
}

export default Dashboards

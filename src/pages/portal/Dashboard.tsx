import {
    Box,
    GridItem,
    Grid,
    Heading,
    Divider,
    Text,
    Spacer
} from '@chakra-ui/react';
import useWindowDimensions from '../../components/useWindowDimensions'
import CardAccount from '../../components/CardAccount';
import AppListCard from '../../components/AppListCard';
import { AiOutlineSetting } from 'react-icons/ai'

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
                <GridItem colSpan={width <= 900 ? 5 : 2} p={4}>
                    <Heading size={'md'}>Announcements</Heading>
                    <div>

                    </div>
                </GridItem>
                <GridItem colSpan={width <= 900 ? 5 : 2} p={4}>
                    <Heading size={'md'}>Messages</Heading>
                </GridItem>
                <GridItem
                    colSpan={width <= 900 ? 3 : 4}
                    p={4}
                    h={'65vh'}
                >
                    <Heading size={'xl'}>App</Heading>
                    <br />
                    <Grid p={2} style={{ overflow: 'auto', height: '100%', borderRadius: 20}} bg={"gray.200"}>
                        <GridItem p={4} textAlign={'left'}>
                            <Heading color={'black'} size={"md"}>Setup</Heading>
                            <Grid
                                // templateRows={`repeat(${width <= 900 ? 1 : 3}, 1fr)`}
                                templateColumns={`repeat(${width <= 900 ? 1 : 3}, 1fr)`}
                                gap={1}
                                textAlign={'center'}
                            >
                                <GridItem>
                                    <AppListCard appTitle='Settings' appDesc='Settings app' appIcon={<AiOutlineSetting style={{ height: 50, width: 50 }} />} appURL={'/settings'} />
                                </GridItem>
                                <GridItem>
                                    <AppListCard appTitle='Settings' appDesc='Settings app' appIcon={<AiOutlineSetting style={{ height: 50, width: 50 }} />} appURL={'/settings'} />
                                </GridItem>
                                <GridItem>
                                    <AppListCard appTitle='Settings' appDesc='Settings app' appIcon={<AiOutlineSetting style={{ height: 50, width: 50 }} />} appURL={'/settings'} />
                                </GridItem>
                                <GridItem>
                                    <AppListCard appTitle='Settings' appDesc='Settings app' appIcon={<AiOutlineSetting style={{ height: 50, width: 50 }} />} appURL={'/settings'} />
                                </GridItem>
                            </Grid>
                        </GridItem>
                    </Grid>
                </GridItem>
            </Grid>
        </Box >
    )
}

export default Dashboards

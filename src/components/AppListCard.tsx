import { CheckIcon, AddIcon } from "@chakra-ui/icons";
import { Center, Box, useColorModeValue, Stack, List, ListItem, ListIcon, Button, Text, Heading } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export interface appType {
    appTitle: string, 
    appDesc: string, 
    appIcon: any, 
    appURL: string
}

const AppListCard = ({appTitle, appDesc, appIcon, appURL}: appType) => {
    const navigate = useNavigate()

    return (
        <Center py={6}>
            <Box
                maxW={'330px'}
                w={'full'}
                bg={useColorModeValue('white', 'gray.800')}
                boxShadow={'2xl'}
                rounded={'md'}
                overflow={'hidden'}>
                <Stack
                    textAlign={'center'}
                    p={6}
                    color={useColorModeValue('gray.800', 'white')}
                    align={'center'}>
                    <Stack direction={'row'} align={'center'} justify={'center'}>
                        {appIcon}
                    </Stack>
                </Stack>

                <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={5}>
                    <Heading fontSize={'3xl'}>{appTitle}</Heading>
                    <Text>{appDesc}</Text>
                    <Button
                        mt={10}
                        w={'full'}
                        bg={'green.400'}
                        color={'white'}
                        rounded={'xl'}
                        boxShadow={'0 5px 20px 0px rgb(72 187 120 / 43%)'}
                        _hover={{
                            bg: 'green.500',
                        }}
                        _focus={{
                            bg: 'green.500',
                        }}
                        onClick={() => navigate(appURL)}>
                        Open
                    </Button>
                </Box>
            </Box>
        </Center>
    );
}

export default AppListCard
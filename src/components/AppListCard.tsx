import { CheckIcon, AddIcon } from "@chakra-ui/icons";
import { Center, Box, useColorModeValue, Stack, List, ListItem, ListIcon, Button, Text } from "@chakra-ui/react";

const AppListCard = () => {
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
                        <AddIcon w={10} h={10} />
                    </Stack>
                </Stack>

                <Box bg={useColorModeValue('gray.50', 'gray.900')} px={6} py={10}>
                    <Text fontSize={'3xl'}>Ini Testing Menu</Text>
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
                        }}>
                        Go to Apps
                    </Button>
                </Box>
            </Box>
        </Center>
    );
}

export default AppListCard
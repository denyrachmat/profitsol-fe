import { Flex, Heading, Stack } from "@chakra-ui/react"

const Settings = () => {
    return (
        <Stack p={10}>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Heading fontSize={'2xl'}>Settings</Heading>
            </Flex>
        </Stack>
    )
}

export default Settings
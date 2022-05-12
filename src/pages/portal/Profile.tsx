import React from "react"
import {
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Link,
    Stack,
    Flex
} from '@chakra-ui/react';

const Profile = () => {
    return (
        <>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Heading fontSize={'2xl'}>Profile</Heading>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <FormControl id="firstname">
                        <FormLabel>First Name</FormLabel>
                        <Input type="text" />
                    </FormControl>
                </Stack>

                <Stack spacing={4} w={'full'} paddingLeft={2}>
                    <FormControl id="lastname">
                        <FormLabel>Last Name</FormLabel>
                        <Input type="text" />
                    </FormControl>
                </Stack>
            </Flex>

            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <FormControl id="firstname">
                        <FormLabel>First Name</FormLabel>
                        <Input type="text" />
                    </FormControl>
                </Stack>

                <Stack spacing={4} w={'full'} paddingLeft={2}>
                    <FormControl id="lastname">
                        <FormLabel>Last Name</FormLabel>
                        <Input type="text" />
                    </FormControl>
                </Stack>
            </Flex>
        </>
    )
}

export default Profile
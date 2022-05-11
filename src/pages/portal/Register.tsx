import {
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Link,
    Stack,
} from '@chakra-ui/react';

const Register = () => {
    return <>
        <Heading fontSize={'2xl'}>Register account</Heading>
        <FormControl id="username">
            <FormLabel>Username</FormLabel>
            <Input type="text" />
        </FormControl>
        <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input type="email" />
        </FormControl>
        <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input type="password" />
        </FormControl>
        <FormControl id="password_confirmation">
            <FormLabel>Password Confirmation</FormLabel>
            <Input type="password" />
        </FormControl>
        <Stack spacing={6}>
            <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}>
                <Link color={'blue.500'}>Already has an account ?</Link>
            </Stack>
            <Button colorScheme={'blue'} variant={'solid'}>
                Register
            </Button>
        </Stack>
    </>
}

export default Register
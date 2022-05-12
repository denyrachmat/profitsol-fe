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

import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate()
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
                <Link color={'blue.500'} onClick={() => navigate('/login') }>Already has an account ?</Link>
            </Stack>
            <Button colorScheme={'blue'} variant={'solid'}>
                Register
            </Button>
        </Stack>
    </>
}

export default Register
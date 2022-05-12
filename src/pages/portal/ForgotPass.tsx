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

const ForgotPass = () => {
    const navigate = useNavigate()
    return <>
        <Heading fontSize={'2xl'}>Forgot Password</Heading>
        <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input type="email" />
        </FormControl>
        <Stack spacing={6}>
            <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}>
                <Link color={'blue.500'} onClick={() => navigate('/login')}>Want to sign in ?</Link>
            </Stack>
            <Button colorScheme={'blue'} variant={'solid'}>
                Send Password Reset
            </Button>
        </Stack>
    </>
}

export default ForgotPass
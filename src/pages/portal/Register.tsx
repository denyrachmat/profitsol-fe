import {
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Link,
    Stack,
    useToast,
} from '@chakra-ui/react';
import React from 'react';

import { useNavigate } from 'react-router-dom';
import { apiConn } from '../../components/apiHelpers';

export interface FormTypes {
    username: string,
    email: string,
    password: string,
    passwordConfirmation: string,
}
const Register = () => {

    const toast = useToast()

    const [username, setUsername] = React.useState<any>(null)
    const [email, setEmail] = React.useState<any>(null)
    const [password, setPassword] = React.useState<any>(null)
    const [passwordConfirmation, setPasswordConfirmation] = React.useState<any>(null)

    const onSubmitReg = async () => {
        const dataSend = {
            username,
            email,
            password,
            confirm_password: passwordConfirmation
        } as any

        const send = await apiConn(
            'post',
            'register',
            'api',
            dataSend
        )

        if (send) {
            console.log(send)
            refreshForms()
        }
    }

    const refreshForms = () => {
        setUsername('')
        setEmail('')
        setPassword('')
        setPasswordConfirmation('')
    }

    const navigate = useNavigate()
    return <>
        <Heading fontSize={'2xl'}>Register account</Heading>
        <FormControl id="username">
            <FormLabel>Username</FormLabel>
            <Input type="text" value={username} onChange={(val: { target: { value: React.SetStateAction<string>; }; }) => setUsername(val.target.value)} />
        </FormControl>
        <FormControl id="email">
            <FormLabel>Email address</FormLabel>
            <Input type="email" value={email} onChange={(val: { target: { value: React.SetStateAction<string>; }; }) => setEmail(val.target.value)} />
        </FormControl>
        <FormControl id="password">
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(val: { target: { value: React.SetStateAction<string>; }; }) => setPassword(val.target.value)} />
        </FormControl>
        <FormControl id="password_confirmation">
            <FormLabel>Password Confirmation</FormLabel>
            <Input type="password" value={passwordConfirmation} onChange={(val: { target: { value: React.SetStateAction<string>; }; }) => setPasswordConfirmation(val.target.value)} />
        </FormControl>
        <Stack spacing={6}>
            <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}>
                <Link color={'blue.500'} onClick={() => navigate('/login')}>Already has an account ?</Link>
            </Stack>
            <Button colorScheme={'blue'} variant={'solid'} onClick={() => onSubmitReg()}>
                Register
            </Button>
        </Stack>
    </>
}

export default Register
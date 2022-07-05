import React from 'react';
import {
    Button,
    Checkbox,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Link,
    Stack,
    InputGroup,
    InputRightElement,
    FormErrorMessage
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux"

import { SetLoginRequest } from '../../stores/actions/creators/portal/AuthCreators';

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [passShow, setPassShow] = React.useState(false)
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')

    const Auth = useSelector((state: { AuthPortal: any}) => state.AuthPortal)

    interface ValueInput {
        target: {
            value: string
        }
    }

    const submitLogin = () => {
        dispatch(SetLoginRequest(username, password))
    }

    return <>
        <Heading fontSize={'2xl'}>Sign in to your account</Heading>
        <FormControl id="email" isInvalid={Object.keys(Auth.authData).length > 0 && Auth.authData.status === false && Auth.authData.message.username}>
            <FormLabel>Username / Email address</FormLabel>
            <Input 
                type="email"
                isInvalid={Object.keys(Auth.authData).length > 0 && Auth.authData.status === false && Auth.authData.message.username}
                placeholder='Username / Email'
                value={username}
                onChange={(val: ValueInput) => setUsername(val.target.value)} 
            />
            {
                Object.keys(Auth.authData).length > 0 && Auth.authData.status === false && Auth.authData.message.username
                ? Auth.authData.message.username.map((val: string, idx: any) =>
                    <FormErrorMessage key={idx}>{ val }</FormErrorMessage>
                )
                : null
            }
        </FormControl>
        <FormControl id="password" isInvalid={Object.keys(Auth.authData).length > 0 && Auth.authData.status === false && Auth.authData.message.password}>
            <FormLabel>Password</FormLabel>
            <InputGroup size='md'>
                <Input
                    pr='4.5rem'
                    isInvalid={Object.keys(Auth.authData).length > 0 && Auth.authData.status === false && Auth.authData.message.password}
                    type={passShow ? 'text' : 'password'}
                    placeholder='Enter password'
                    value={password} onChange={(val: ValueInput) => setPassword(val.target.value)}
                />
                <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onMouseUp={() => setPassShow(false)} onMouseDown={() => setPassShow(true)}>
                        {passShow ? 'Hide' : 'Show'}
                    </Button>
                </InputRightElement>
            </InputGroup>
            {
                Object.keys(Auth.authData).length > 0 && Auth.authData.status === false && Auth.authData.message.password
                ? Auth.authData.message.password.map((val: string, idx: any) =>
                    <FormErrorMessage key={idx}>{ val }</FormErrorMessage>
                )
                : null
            }
        </FormControl>
        <Stack spacing={6}>
            <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}>
                <Checkbox>Remember me</Checkbox>
                <Link _disabled={Auth.isLoading} color={'blue.500'} onClick={() => navigate('/forgotpass')}>Forgot password?</Link>
            </Stack>
            <Button isLoading={Auth.isLoading} colorScheme={'blue'} variant={'solid'} onClick={() => submitLogin()}>
                Sign in
            </Button>
            <Button isLoading={Auth.isLoading} colorScheme={'blue'} variant={'outline'} onClick={() => navigate('/register')}>
                Register Account
            </Button>
        </Stack>
    </>
}

export default Login
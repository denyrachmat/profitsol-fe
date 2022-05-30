import React from 'react'
import {
  Flex,
  Stack,
  Image,
} from '@chakra-ui/react';
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';

import { store } from '../../stores';

export type iRootState = ReturnType<typeof store>

const AuthLayouts = () => {
  const toast = useToast()
  const navigate = useNavigate()
  const { isLoggedIn } = useSelector((state: iRootState) => state.AuthPortal)

  React.useEffect(() => {
    console.log('sudah login')
    if (isLoggedIn) {
      toast({
        title: 'Login success.',
        description: "Welcome to STX App",
        status: 'success',
        duration: 9000,
        isClosable: true,
      })
      navigate('/')
    }
  }, [isLoggedIn])

  return (
    <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={4} w={'full'} maxW={'md'}>
          <Outlet />
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Image
          alt={'Login Image'}
          objectFit={'cover'}
          src={
            'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80'
          }
        />
      </Flex>
    </Stack>
  );
}

export default AuthLayouts
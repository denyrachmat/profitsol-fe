import React from "react"
import {
    Button,
    Avatar,
    FormControl,
    FormLabel,
    Heading,
    Input,
    WrapItem,
    Stack,
    Flex,
    RadioGroup,
    Radio,
    Divider,
    InputRightElement,
    InputGroup
} from '@chakra-ui/react';

import { useDispatch } from "react-redux";

import MapView from "../../components/MapView";
import Dialogs from "../../components/Dialogs";

import * as DialogCreators from '../../stores/actions/creators/portal/DialogCreators'

const Profile = () => {
    const ref = React.useRef();

    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [IDType, setIDType] = React.useState('')
    const [IDNum, setIDNum] = React.useState('')
    const [IDLocG, setIDLocG] = React.useState('')
    const [currLocG, setCurrLocG] = React.useState('')

    const [autoCompleteWidget, setAutoCompleteWidget] = React.useState<
        google.maps.places.Autocomplete | undefined
    >(undefined);

    const dispatch = useDispatch()

    const ShowMaps = () => {
        const center = { lat: -34.397, lng: 150.644 };
        const zoom = 4;

        dispatch(DialogCreators.setDialogs(
            'PROFILE_SHOW_MAPS',
            true,
            'Choose Location Point',
            <MapView center={center} zoom={zoom}/>,
            true
        ))
    }

    React.useEffect(() => {
        console.log('Location ID on changed')
    }, [IDLocG])

    return (
        <>
            <Dialogs />
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Heading fontSize={'2xl'}>Profile</Heading>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <WrapItem>
                    <Avatar size='2xl' name='John Doe' src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ" />{' '}
                </WrapItem>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <FormControl id="firstname">
                        <FormLabel>First Name</FormLabel>
                        <Input type="text" onChange={(val: { target: { value: string } }) => setFirstName(val.target.value)} />
                    </FormControl>
                </Stack>

                <Stack spacing={4} w={'full'} paddingLeft={2}>
                    <FormControl id="lastname">
                        <FormLabel>Last Name</FormLabel>
                        <Input type="text" onChange={(val: { target: { value: string } }) => setLastName(val.target.value)} />
                    </FormControl>
                </Stack>
            </Flex>

            <Divider />

            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <FormControl id="id">
                        <FormLabel>Choose your ID</FormLabel>
                        <RadioGroup defaultValue='nationality' onChange={(val: string) => setIDType(val)}>
                            <Stack spacing={5} direction='row'>
                                <Radio colorScheme='red' value='nationality'>
                                    Nationality ID
                                </Radio>
                                <Radio colorScheme='green' value='driving'>
                                    Driving ID
                                </Radio>
                            </Stack>
                        </RadioGroup>
                    </FormControl>
                </Stack>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <FormControl id="id">
                        <FormLabel>Your ID Number</FormLabel>
                        <Input type="text" onChange={(val: { target: { value: string } }) => setIDNum(val.target.value)} />
                    </FormControl>
                </Stack>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingLeft={2}>
                    <FormControl id="locationID">
                        <FormLabel>Your ID location</FormLabel>
                        <InputGroup size='md'>
                            <Input type="text" onChange={(val: { target: { value: string } }) => setIDLocG(val.target.value)} />
                            <InputRightElement width='4.5rem'>
                                <Button h='1.75rem' size='sm' onClick={() => ShowMaps()}>
                                    Maps
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                </Stack>

                <Stack spacing={4} w={'full'} paddingLeft={2}>
                    <FormControl id="locationID">
                        <FormLabel>Your current location</FormLabel>
                        <Input type="text" onChange={(val: { target: { value: string } }) => setCurrLocG(val.target.value)} />
                    </FormControl>
                </Stack>
            </Flex>
        </>
    )
}

export default Profile
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
    InputGroup,
    Select,
    useToast,
    IconButton,
    useDisclosure,
    ScaleFade,
    Link,
    Popover,
    PopoverTrigger,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
    Portal,
    InputLeftAddon,
    Textarea
} from '@chakra-ui/react';

import { useDispatch, useSelector } from "react-redux";

import MapView from "../../components/MapView";
import Dialogs from "../../components/Dialogs";

import * as DialogCreators from '../../stores/actions/creators/portal/DialogCreators'
import * as DialogTypes from '../../stores/actions/types/portal/DialogTypes'

import * as ProfileCreators from '../../stores/actions/creators/portal/ProfileCreators'

import { EmailIcon, SearchIcon, DeleteIcon } from "@chakra-ui/icons";
import { FaSearchLocation, FaCopy, FaBook, FaUsers, FaCamera } from 'react-icons/fa'
import { MdAddAPhoto } from "react-icons/md";
import CustDatePicker from "../../components/CustDatePicker";
import _ from "lodash";

export interface FamTypes {
    fam_f_name: string,
    fam_l_name: string,
    fam_rel: string,
    fam_birthday: Date,
    fam_phone: string
}

export interface fieldTypes {
    [field: string]: keyof FamTypes
}

const Profile = () => {
    const ref = React.useRef();
    const toast = useToast()

    const { isOpen, onToggle } = useDisclosure()

    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [birthplace, setBirthplace] = React.useState('')
    const [birthday, setBirthday] = React.useState(new Date)
    const [phoneNum, setPhoneNum] = React.useState('')
    const [IDType, setIDType] = React.useState('')
    const [IDNum, setIDNum] = React.useState('')
    const [currLocG, setCurrLocG] = React.useState({}) as any

    const [country, setCountry] = React.useState('')
    const [province, setProvince] = React.useState('')
    const [cities, setCities] = React.useState('')
    const [district, setDistrict] = React.useState('')
    const [subdistrict, setSubdistrict] = React.useState('')
    const [detLoc, setDetLoc] = React.useState('')

    const [countryCurrent, setCountryCurrent] = React.useState('')
    const [provinceCurrent, setProvinceCurrent] = React.useState('')
    const [citiesCurrent, setCitiesCurrent] = React.useState('')
    const [districtCurrent, setDistrictCurrent] = React.useState('')
    const [subdistrictCurrent, setSubdistrictCurrent] = React.useState('')
    const [detLocCurrent, setDetLocCurrent] = React.useState('')

    const [Educations, setEducations] = React.useState([]) as any

    const [families, setFamilies] = React.useState([]) as any

    const { dialogID, dialogPressedBtn, dialogResult, dialogLists } = useSelector((state: { Dialogs: DialogTypes.setDialogs }) => state.Dialogs)

    const dispatch = useDispatch()

    const ShowMaps = (id: string) => {
        const center = { lat: -34.397, lng: 150.644 };
        const zoom = 4;

        dispatch(DialogCreators.setDialogs(
            id,
            true,
            'Choose Location Point',
            <MapView center={center} zoom={zoom} choosedData={setCurrLocG} />,
            true,
            'cancel',
            currLocG
        ))
    }

    // Dialogs
    React.useEffect(() => {
        console.log([dialogID, dialogPressedBtn])
        if (dialogID === 'PROFILE_SHOW_MAPS' && dialogPressedBtn === 'ok') {
            if (currLocG) {
                setCountry(currLocG.country)
                setProvince(currLocG.province)
                setCities(currLocG.cities)
                setDistrict(currLocG.district)
                setSubdistrict(currLocG.subdistrict)
            }
        } else if (dialogID === 'PROFILE_SHOW_MAPS_CURRENT' && dialogPressedBtn === 'ok') {
            if (currLocG) {
                setCountryCurrent(currLocG.country)
                setProvinceCurrent(currLocG.province)
                setCitiesCurrent(currLocG.cities)
                setDistrictCurrent(currLocG.district)
                setSubdistrictCurrent(currLocG.subdistrict)
            }
        } else if (dialogID === 'IS_COPY_LOC' && dialogPressedBtn === 'ok') {
            setCountryCurrent(country)
            setProvinceCurrent(province)
            setCitiesCurrent(cities)
            setDistrictCurrent(district)
            setSubdistrictCurrent(subdistrict)
        }
    }, [JSON.stringify(dialogLists)])

    const pushStored = React.useCallback(_.debounce((
        firstName,
        lastName,
        birthplace,
        birthday,
        IDType,
        IDNum,
        country,
        province,
        cities,
        district,
        subdistrict,
        countryCurrent,
        provinceCurrent,
        citiesCurrent,
        districtCurrent,
        subdistrictCurrent,
        Educations,
        families,
        phoneNum,
        detLoc,
        detLocCurrent
    ) => {
        dispatch(ProfileCreators.pushProfile(
            firstName,
            lastName,
            birthplace,
            birthday,
            IDType,
            IDNum,
            country,
            province,
            cities,
            district,
            subdistrict,
            countryCurrent,
            provinceCurrent,
            citiesCurrent,
            districtCurrent,
            subdistrictCurrent,
            Educations,
            families,
            phoneNum,
            detLoc,
            detLocCurrent
        ))
    }, 5000), [])

    React.useEffect(() => {
        pushStored(
            firstName,
            lastName,
            birthplace,
            birthday,
            IDType,
            IDNum,
            country,
            province,
            cities,
            district,
            subdistrict,
            countryCurrent,
            provinceCurrent,
            citiesCurrent,
            districtCurrent,
            subdistrictCurrent,
            JSON.stringify(Educations),
            JSON.stringify(families),
            phoneNum,
            detLoc,
            detLocCurrent
        )
    }, [
        firstName,
        lastName,
        birthplace,
        birthday,
        IDType,
        IDNum,
        country,
        province,
        cities,
        district,
        subdistrict,
        countryCurrent,
        provinceCurrent,
        citiesCurrent,
        districtCurrent,
        subdistrictCurrent,
        JSON.stringify(Educations),
        JSON.stringify(families),
        phoneNum,
        detLoc,
        detLocCurrent
    ])

    const dataStored = _.debounce(() => {
        console.log('siap di store !!')
    }, 5000)

    const onClickAva = () => {
        console.log('ava Clicked')
    }

    const copyLocation = () => {
        dispatch(DialogCreators.setDialogs(
            'IS_COPY_LOC',
            true,
            'Copy Location',
            'Are you sure want to copy ID Location to current location ?',
            true,
            'cancel'
        ))
    }

    // Education 
    const onAddEducations = () => {
        if (Educations.length < 5) {
            setEducations([
                ...Educations,
                {
                    sch_type: '',
                    sch_name: '',
                    sch_major: '',
                    sch_minor: '',
                    sch_grade: 0,
                    sch_grade_years: 0
                }
            ])
        } else {
            toast({
                title: 'Failed.',
                description: "Cannot add more educations",
                status: 'error',
                duration: 5000,
                isClosable: true,
            })
        }
    }

    const onDeleteEdu = (idx: number) => {
        const remData = Educations.filter((val: any, idxD: number) => idxD !== idx)

        setEducations(remData)
    }

    const onChangeDatEdu = (val: any, field: string, idx: number) => {
        const valuenya = val.target.value

        const modData = Educations

        modData[idx][field] = valuenya

        setEducations([...modData])
    }

    // Families
    const onAddFamilies = () => {
        setFamilies([
            ...families,
            {
                fam_f_name: '',
                fam_l_name: '',
                fam_rel: '',
                fam_birthday: new Date,
                fam_phone: ''
            }
        ])
    }

    const onDeleteFam = (idx: number) => {
        const remData = families.filter((val: any, idxD: number) => idxD !== idx)

        setFamilies(remData)
    }

    const onChangeDatFam = (val: any, field: any, idx: number) => {
        const valuenya = val.target.value

        const modData = families

        modData[idx][field] = valuenya

        setFamilies([...modData])
    }

    return (
        <Stack p={10}>
            <Dialogs />
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Heading fontSize={'2xl'}>Profile</Heading>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <WrapItem>
                    <ScaleFade initialScale={0.9} in={!isOpen}>
                        <Avatar onMouseOver={onToggle} size='2xl' name='John Doe' src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&ixid=eyJhcHBfaWQiOjE3Nzg0fQ" />
                    </ScaleFade>
                    {
                        isOpen
                            ? <Link onClick={() => onClickAva()} onMouseLeave={onToggle} style={{ position: 'absolute' }} >
                                <Avatar size='2xl' icon={<MdAddAPhoto />} style={{ backgroundColor: 'rgba(0, 204, 255, 0.3)' }} />
                            </Link>
                            : null
                    }
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
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <FormControl id="birthplace">
                        <FormLabel>Birth Places</FormLabel>
                        <Input type="text" onChange={(val: { target: { value: string } }) => setBirthplace(val.target.value)} />
                    </FormControl>
                </Stack>

                <Stack spacing={4} w={'full'} paddingLeft={2}>
                    <FormControl id="birthday">
                        <FormLabel>Birth Day</FormLabel>
                        <CustDatePicker value={birthday} onChange={setBirthday} />
                    </FormControl>
                </Stack>
            </Flex>

            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <FormLabel>Phone Number</FormLabel>
                    <InputGroup>
                        <InputLeftAddon children='+62' />
                        <Input type='tel' placeholder='phone number' onChange={(val: { target: { value: string } }) => setPhoneNum(val.target.value)} value={phoneNum} />
                    </InputGroup>
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
                    <FormLabel><Heading fontSize={'xl'}>ID Address</Heading></FormLabel>
                    <Divider />
                    <FormControl id="locationID">
                        <Button colorScheme='teal' leftIcon={<FaSearchLocation />} onClick={() => ShowMaps('PROFILE_SHOW_MAPS')}>
                            Find on maps
                        </Button>
                    </FormControl>

                    <FormControl id="country">
                        <FormLabel>Country</FormLabel>
                        <Input type="text" value={country} onChange={(val: { target: { value: string } }) => setCountry(val.target.value)} />
                    </FormControl>

                    <FormControl id="state">
                        <FormLabel>State / Province</FormLabel>
                        <Input type="text" value={province} onChange={(val: { target: { value: string } }) => setProvince(val.target.value)} />
                    </FormControl>

                    <FormControl id="city">
                        <FormLabel>City</FormLabel>
                        <Input type="text" value={cities} onChange={(val: { target: { value: string } }) => setCities(val.target.value)} />
                    </FormControl>

                    <FormControl id="district">
                        <FormLabel>District</FormLabel>
                        <Input type="text" value={district} onChange={(val: { target: { value: string } }) => setDistrict(val.target.value)} />
                    </FormControl>

                    <FormControl id="subdistrict">
                        <FormLabel>Sub-District</FormLabel>
                        <Input type="text" value={subdistrict} onChange={(val: { target: { value: string } }) => setSubdistrict(val.target.value)} />
                    </FormControl>

                    <FormControl id="det_location">
                        <FormLabel>Detail Location</FormLabel>
                        <Textarea placeholder='Detail Location, like RT or RW' value={detLoc} onChange={(val: { target: { value: string } }) => setDetLoc(val.target.value)} />
                    </FormControl>
                </Stack>

                <Stack spacing={4} w={'full'} paddingLeft={2}>
                    <FormLabel><Heading fontSize={'xl'}>Current Address</Heading></FormLabel>
                    <Divider />
                    <FormControl id="locationID">
                        <Stack direction='row' spacing={4} align='center'>
                            <Button colorScheme='orange' leftIcon={<FaCopy />} onClick={() => copyLocation()}>
                                Same with ID Location ?
                            </Button>

                            <div>Or</div>

                            <Button colorScheme='teal' leftIcon={<FaSearchLocation />} onClick={() => ShowMaps('PROFILE_SHOW_MAPS_CURRENT')}>
                                Find on maps
                            </Button>
                        </Stack>
                    </FormControl>

                    <FormControl id="country_current">
                        <FormLabel>Country</FormLabel>
                        <Input type="text" value={countryCurrent} onChange={(val: { target: { value: string } }) => setCountryCurrent(val.target.value)} />
                    </FormControl>

                    <FormControl id="state_current">
                        <FormLabel>State / Province</FormLabel>
                        <Input type="text" value={provinceCurrent} onChange={(val: { target: { value: string } }) => setProvinceCurrent(val.target.value)} />
                    </FormControl>

                    <FormControl id="city_current">
                        <FormLabel>City</FormLabel>
                        <Input type="text" value={citiesCurrent} onChange={(val: { target: { value: string } }) => setCitiesCurrent(val.target.value)} />
                    </FormControl>

                    <FormControl id="district_current">
                        <FormLabel>District</FormLabel>
                        <Input type="text" value={districtCurrent} onChange={(val: { target: { value: string } }) => setDistrictCurrent(val.target.value)} />
                    </FormControl>

                    <FormControl id="subdistrict_current">
                        <FormLabel>Sub-District</FormLabel>
                        <Input type="text" value={subdistrictCurrent} onChange={(val: { target: { value: string } }) => setSubdistrictCurrent(val.target.value)} />
                    </FormControl>

                    <FormControl id="det_location_current">
                        <FormLabel>Detail Location</FormLabel>
                        <Textarea placeholder='Detail Location, like RT or RW' value={detLocCurrent} onChange={(val: { target: { value: string } }) => setDetLocCurrent(val.target.value)} />
                    </FormControl>
                </Stack>


            </Flex>

            <Divider />

            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <Heading fontSize={'xl'}>Educations</Heading>
                </Stack>

                <Stack spacing={4} paddingRight={2} style={{ textAlign: 'right' }}>
                    <Button colorScheme='cyan' leftIcon={<FaBook />} onClick={() => onAddEducations()}>
                        Add educations
                    </Button>
                </Stack>
            </Flex>

            {
                Educations.map((val: any, idx: number) =>
                    <div key={idx}>
                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} style={{ bottom: 0 }}>
                                <IconButton
                                    colorScheme='red'
                                    aria-label='Search database'
                                    icon={<DeleteIcon />}
                                    w={'100%'}
                                    onClick={() => onDeleteEdu(idx)}
                                />
                            </Stack>
                        </Flex>
                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"sch_type_" + idx}>
                                    <FormLabel>Study Type</FormLabel>
                                    <Select defaultValue={''} onChange={(val: any) => onChangeDatEdu(val, 'sch_type', idx)} value={val.sch_type}>
                                        <option value='' disabled>Choose One</option>
                                        <option value='1' disabled={Educations.filter((val: { sch_type: string; }) => val.sch_type === '1').length > 0}>High Schools</option>
                                        <option value='2' disabled={Educations.filter((val: { sch_type: string; }) => val.sch_type === '2').length > 0}>Associate Degrees</option>
                                        <option value='3' disabled={Educations.filter((val: { sch_type: string; }) => val.sch_type === '3').length > 0}>Bachelor Degrees</option>
                                        <option value='4' disabled={Educations.filter((val: { sch_type: string; }) => val.sch_type === '4').length > 0}>Master Degrees</option>
                                        <option value='5' disabled={Educations.filter((val: { sch_type: string; }) => val.sch_type === '5').length > 0}>Doctoral Degrees</option>
                                    </Select>
                                </FormControl>
                            </Stack>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"sch_name" + idx}>
                                    <FormLabel>School / University Name</FormLabel>
                                    <Input type="text" onInput={(val: any) => onChangeDatEdu(val, 'sch_name', idx)} value={val.sch_name} />
                                </FormControl>
                            </Stack>
                        </Flex>

                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"sch_major" + idx}>
                                    <FormLabel>Major</FormLabel>
                                    <Input type="text" onChange={(val: any) => onChangeDatEdu(val, 'sch_major', idx)} value={val.sch_major} />
                                </FormControl>
                            </Stack>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"sch_minor" + idx}>
                                    <FormLabel>Minor</FormLabel>
                                    <Input type="text" onChange={(val: any) => onChangeDatEdu(val, 'sch_minor', idx)} value={val.sch_minor} />
                                </FormControl>
                            </Stack>
                        </Flex>

                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"sch_grade" + idx}>
                                    <FormLabel>Grade</FormLabel>
                                    <Input type="text" onChange={(val: any) => onChangeDatEdu(val, 'sch_grade', idx)} value={val.sch_grade} />
                                </FormControl>
                            </Stack>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"sch_grade_years" + idx}>
                                    <FormLabel>Graduated Years</FormLabel>
                                    <Input type="number" onChange={(val: any) => onChangeDatEdu(val, 'sch_grade_years', idx)} value={val.sch_grade_years} />
                                </FormControl>
                            </Stack>
                        </Flex>
                    </div>
                )
            }

            <Divider />

            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Stack spacing={4} w={'full'} paddingRight={2}>
                    <Heading fontSize={'xl'}>Families</Heading>
                </Stack>

                <Stack spacing={4} paddingRight={2} style={{ textAlign: 'right' }}>
                    <Button colorScheme='blue' leftIcon={<FaUsers />} onClick={() => onAddFamilies()}>
                        Add families
                    </Button>
                </Stack>
            </Flex>

            {
                families.map((_val: any, idx: number) =>
                    <div key={idx}>
                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} style={{ bottom: 0 }}>
                                <IconButton
                                    colorScheme='red'
                                    aria-label='Search database'
                                    icon={<DeleteIcon />}
                                    w={'100%'}
                                    onClick={() => onDeleteFam(idx)}
                                />
                            </Stack>
                        </Flex>

                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"fam_rel" + idx}>
                                    <FormLabel>Family Type</FormLabel>
                                    <Select defaultValue={''} onChange={(val: any) => onChangeDatFam(val, 'fam_rel', idx)} value={_val.fam_rel}>
                                        <option value='' disabled>Choose One</option>
                                        <option value='parents'>Parents</option>
                                        <option value='spouse'>Spouse</option>
                                        <option value='child'>Children</option>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Flex>

                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"fam_f_name" + idx}>
                                    <FormLabel>First Name</FormLabel>
                                    <Input type="text" onInput={(val: any) => onChangeDatFam(val, 'fam_f_name', idx)} value={_val.fam_f_name} />
                                </FormControl>
                            </Stack>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"fam_l_name" + idx}>
                                    <FormLabel>Last Name</FormLabel>
                                    <Input type="text" onInput={(val: any) => onChangeDatFam(val, 'fam_l_name', idx)} value={_val.fam_l_name} />
                                </FormControl>
                            </Stack>
                        </Flex>

                        <Flex p={2} flex={1} justify={'center'} m={5}>
                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"fam_birthday" + idx}>
                                    <FormLabel>Birthday</FormLabel>
                                    <CustDatePicker value={_val.fam_birthday} onChange={(valD: any) => onChangeDatFam({ target: { value: valD } }, 'fam_birthday', idx)} />
                                </FormControl>
                            </Stack>

                            <Stack spacing={4} w={'full'} paddingRight={2}>
                                <FormControl id={"fam_phone" + idx}>
                                    <FormLabel>Phone Number</FormLabel>
                                    <InputGroup>
                                        <InputLeftAddon children='+62' />
                                        <Input type='tel' placeholder='phone number' onInput={(val: any) => onChangeDatFam(val, 'fam_phone', idx)} value={_val.fam_phone} />
                                    </InputGroup>
                                </FormControl>
                            </Stack>
                        </Flex>
                    </div>
                )
            }
        </Stack>
    )
}

export default Profile
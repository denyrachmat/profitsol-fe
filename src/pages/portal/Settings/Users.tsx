import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

import { Stack, Flex, Heading, Button, IconButton, useToast } from '@chakra-ui/react';

import { apiConn } from '../../../components/apiHelpers';

import CustDataTable from '../../../components/dataTable'
import { AddIcon, CheckIcon, CloseIcon, DeleteIcon, EditIcon, LockIcon } from '@chakra-ui/icons';
import moment from 'moment';
import * as DialogCreators from '../../../stores/actions/creators/portal/DialogCreators'
import * as DialogTypes from '../../../stores/actions/types/portal/DialogTypes'
import { useDispatch, useSelector } from 'react-redux';
import DrawerDialog from '../../../components/DrawerDialog';

import FormUpdateUser from './FormUpdateUser';
const Users = () => {
    const dispatch = useDispatch()
    const toast = useToast()

    const [rowData, setRowData] = useState([]);
    const [formUser, setFormUser] = useState(null) as any

    const [openForm, setOpenForm] = useState(false)
    const [bodyForm, setBodyForm] = useState(null) as any

    const columns: any = [
        {
            name: "username",
            label: "Username",
            options: {
                filter: true,
                sort: true,
            }
        },
        {
            name: "email",
            label: "Email",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "pud_first_name",
            label: "First Name",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "pud_last_name",
            label: "Last Name",
            options: {
                filter: true,
                sort: false,
            }
        },
        {
            name: "email_verified_at",
            label: "Email Verified",
            options: {
                filter: true,
                sort: false,
            },
            field: (val: any, nameRes: any) => nameRes ? <CheckIcon color={'teal'}/> : <CloseIcon color={'red'}/>
        },
        {
            name: "actions",
            label: "Action",
            options: {
                filter: true,
                sort: false,
            },
            align: 'center',
            field: (val: any) => <Stack spacing={4} direction='row' align='center'>
                <IconButton
                    colorScheme='red'
                    aria-label='Delete Data'
                    icon={<DeleteIcon />}
                    size='sm'
                    onClick={() => onDeleteRows(val)}
                />
                <IconButton
                    colorScheme='teal'
                    aria-label='Edit Data'
                    icon={<EditIcon />}
                    size='sm'
                    onClick={() => onUpdateRows(val)}
                />
                <IconButton
                    colorScheme='orange'
                    aria-label='Update Password'
                    icon={<LockIcon />}
                    size='sm'
                    onClick={() => onUpdateRows(val)}
                />
            </Stack>
        },
    ]

    const { dialogID, dialogPressedBtn, dialogIsOpen } = useSelector((state: { Dialogs: DialogTypes.setDialogs }) => state.Dialogs)

    const onGridReady = useCallback((params) => {
        apiConn(
            'get',
            'portal/users',
            'api',
            null,
            true
        ).then(
            (val: any) => {
                setRowData(val.data)
            }
        )
    }, []);

    const onDeleteRows = (val: any) => {
        console.log(val)
    }

    const onUpdateRows = (val: any = null) => {
        if (val || val === 0) {
            console.log('ada datanya')
            const datanya = rowData[val] as any
            setOpenForm(true)
            setBodyForm(<FormUpdateUser 
                username={datanya.username}
                first_name={datanya.pud_first_name}
                last_name={datanya.pud_last_name}
                email={datanya.email}
                is_verified={datanya.email_verified_at ? true : false}
                changedData={resultUpdateRows}
            />)
        } else {
            console.log('tidak ada datanya')
            setOpenForm(true)
            setBodyForm(<FormUpdateUser 
                username={''}
                first_name={''}
                last_name={''}
                email={''}
                is_verified={false}
                changedData={resultUpdateRows}
            />)
        }
    }

    const resultUpdateRows = (val: any) => {
        setFormUser(val)
    }

    // Effect
    React.useEffect(() => {
        onGridReady([])
    }, [])
    
    React.useEffect(() => {
        if (dialogID === 'SET_USER_UPDATE' && dialogPressedBtn === 'ok') {
            dispatch(DialogCreators.setDialogs(
                'YES_NO_UPDATE',
                true,
                'Update data user',
                'Are you sure want to update this user ?',
                true,
                'cancel'
            ))
        } else if (dialogID === 'YES_NO_UPDATE' && dialogPressedBtn === 'ok') {
            if (formUser) {
                const data: any = {
                    username: formUser.username,
                    email: formUser.emails,
                    password: formUser.password,
                    password_confirmation: formUser.passwordConfirmation,
                    email_verified_at: formUser.isVerified ? moment().format('YYYY-MM-DD h:mm:ss') : null, 
                    pud_first_name: formUser.firstName,
                    pud_last_name: formUser.lastName
                }
                apiConn(
                    formUser.isUpdate
                    ? 'put'
                    : 'post',
                    formUser.isUpdate
                    ? `portal/users/${formUser.username}`
                    : `register`,
                    'api',
                    data,
                    true
                ).then(
                    (val: any) => {
                        toast({
                            title: 'Success',
                            description: val.data.message,
                            status: 'success',
                            duration: 9000,
                            isClosable: true,
                        })

                        setOpenForm(false)

                        onGridReady([])
                    }
                )
            }
        }
    }, [dialogIsOpen])

    const onDrawerAct = (val: any) => {
        // console.log(val)
        if (val === true) {
            dispatch(DialogCreators.setDialogs(
                'YES_NO_UPDATE',
                true,
                'Update data user',
                'Are you sure want to update this user ?',
                true,
                'cancel'
            ))
        }
    }

    return (
        <Stack p={5}>
            <DrawerDialog openDrawer={openForm} toogleDrawer={(val: any) => setOpenForm(val)} header={'Update Users'} bodyDrawer={bodyForm} resultDrawer={onDrawerAct}/>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Heading fontSize={'2xl'}>Settings</Heading>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <div>
                    <CustDataTable
                        title={"Employee List"}
                        data={rowData}
                        columns={columns}
                        selectable
                        choosedData={(data: any) => console.log(data)}
                        header={
                            <Stack spacing={4} direction='row'>
                                <Button size='md' onClick={() => onUpdateRows() } leftIcon={<AddIcon />} colorScheme='teal' variant='solid'>
                                    Add
                                </Button>
                            </Stack>
                        }
                        filtered
                    />
                </div>
            </Flex>
        </Stack>
    );
}

export default Users

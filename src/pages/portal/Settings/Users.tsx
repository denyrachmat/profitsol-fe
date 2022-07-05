import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

import { Stack, Flex, Heading, Button, IconButton } from '@chakra-ui/react';

import { apiConn } from '../../../components/apiHelpers';

import CustDataTable from '../../../components/dataTable'
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';

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
        name: "email_verified_at",
        label: "Email Verified",
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
        name: "actions",
        label: "Action",
        options: {
            filter: true,
            sort: false,
        },
        field: (val: any) => <Stack spacing={4} direction='row' align='center'>
            <IconButton
                colorScheme='red'
                aria-label='Delete Data'
                icon={<DeleteIcon/>}
                size='sm'
                onClick={() => onDeleteRows(val)}
            />
            <IconButton
                colorScheme='teal'
                aria-label='Edit Data'
                icon={<EditIcon/>}
                size='sm'
                onClick={() => onUpdateRows(val)}
            />
        </Stack>
    }
]

const onDeleteRows = (val:any) => {
    console.log(val)
}

const onUpdateRows = (val:any) => {
    console.log(val)
}

const Users = () => {
    const [rowData, setRowData] = useState([]);

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

    React.useEffect(() => {
        onGridReady([])
    }, [])

    return (
        <Stack p={5}>
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
                    />
                </div>
            </Flex>
        </Stack>
    );
}

export default Users

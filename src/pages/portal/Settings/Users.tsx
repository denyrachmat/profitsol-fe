import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'; // Optional theme CSS
import { Stack, Flex, Heading, Button, IconButton } from '@chakra-ui/react';

import { apiConn } from '../../../components/apiHelpers';
import { MdDelete, MdEdit } from 'react-icons/md';

var checkboxSelection = function (params: any) {
    // we put checkbox on the name if we are not doing grouping
    return params.columnApi.getRowGroupColumns().length === 0;
};

var headerCheckboxSelection = function (params: any) {
    // we put checkbox on the name if we are not doing grouping
    return params.columnApi.getRowGroupColumns().length === 0;
};

const BtnCellRenderer = (props: any, data: any) => {
    return (
        <Stack direction='row' spacing={4}>
            {
                data.length > 0
                    ? data.map((val: any) =>
                        val.name 
                        ? <Button leftIcon={val.icon} colorScheme={val.color} variant='solid'>
                            {val.name}
                        </Button>
                        : <IconButton icon={val.icon} colorScheme={val.color} aria-label={''} />
                    )
                    : null
            }
        </Stack>
    )
}

const deleteClickAction = (str: any) => {
    console.log(str)
}

const Users = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState([]);
    const [columnDefs, setColumnDefs] = useState([
        { field: 'username' },
        { field: 'email' },
        { field: 'email_verified_at', headerName: 'Verified At' },
        { field: 'det.pud_first_name', headerName: 'First Name' },
        { field: 'det.pud_last_name', headerName: 'Last Name' },
        {
            field: 'id',
            headerName: 'Action',
            cellRenderer: (props: any) => BtnCellRenderer(props, [
                {
                    icon: <MdDelete />,
                    color: 'red',
                    name: ''
                },{
                    icon: <MdEdit />,
                    color: 'cyan',
                    name: ''
                }
            ]),
            cellRendererParams: {
                clicked: (field: any) => {
                    alert(`${field} was clicked`);
                },
            },
        }
    ]);
    const autoGroupColumnDef = useMemo(() => {
        return {
            headerName: 'Group',
            minWidth: 170,
            field: 'athlete',
            valueGetter: (params: any) => {
                if (params.node.group) {
                    return params.node.key;
                } else {
                    return params.data[params.colDef.field];
                }
            },
            headerCheckboxSelection: true,
            cellRenderer: 'agGroupCellRenderer',
            cellRendererParams: {
                checkbox: true,
            },
        };
    }, []);
    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            enableRowGroup: true,
            enablePivot: true,
            enableValue: true,
            sortable: true,
            resizable: true,
            filter: true,
            flex: 1,
            minWidth: 100,
        };
    }, []);

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

    return (
        <Stack p={5}>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <Heading fontSize={'2xl'}>Settings</Heading>
            </Flex>
            <Flex p={2} flex={1} justify={'center'} m={5}>
                <div>

                    {/* Example using Grid's API */}
                    {/* <button onClick={buttonListener}>Push Me</button> */}

                    {/* On div wrapping Grid a) specify theme CSS Class Class and b) sets Grid size */}
                    <div className="ag-theme-alpine" style={{ width: '100vh', height: '70vh' }}>
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            autoGroupColumnDef={autoGroupColumnDef}
                            defaultColDef={defaultColDef}
                            suppressRowClickSelection={true}
                            groupSelectsChildren={true}
                            rowSelection={'multiple'}
                            rowGroupPanelShow={'always'}
                            pivotPanelShow={'always'}
                            enableRangeSelection={true}
                            pagination={true}
                            onGridReady={onGridReady}
                        ></AgGridReact>
                    </div>
                </div>
            </Flex>
        </Stack>
    );
}

export default Users
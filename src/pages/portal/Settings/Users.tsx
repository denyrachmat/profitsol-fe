import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { render } from 'react-dom';
import { AgGridReact } from 'ag-grid-react'; // the AG Grid React Component

import 'ag-grid-community/dist/styles/ag-grid.css'; // Core grid CSS, always needed
import 'ag-grid-community/dist/styles/ag-theme-alpine.css'; // Optional theme CSS
import { Stack, Flex, Heading } from '@chakra-ui/react';

import { apiConn } from '../../../components/apiHelpers';

var checkboxSelection = function (params: any) {
    // we put checkbox on the name if we are not doing grouping
    return params.columnApi.getRowGroupColumns().length === 0;
};

var headerCheckboxSelection = function (params: any) {
    // we put checkbox on the name if we are not doing grouping
    return params.columnApi.getRowGroupColumns().length === 0;
};

const Users = () => {
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
    const [rowData, setRowData] = useState();
    const [columnDefs, setColumnDefs] = useState([
        {
            field: 'athlete',
            minWidth: 170,
            checkboxSelection: checkboxSelection,
            headerCheckboxSelection: headerCheckboxSelection,
        },
        { field: 'age' },
        { field: 'country' },
        { field: 'year' },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
        { field: 'total' },
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
            editable: true,
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
        // fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        //     .then((resp) => resp.json())
        //     .then((data) => setRowData(data));

        apiConn(
            'get',
            'portal/users',
            'api',
            null,
            true
        ).then(
            (val: any) => val
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
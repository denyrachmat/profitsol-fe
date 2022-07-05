import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "@chakra-ui/icons"
import { Button, Checkbox, IconButton, Table, TableCaption, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"

import { GrFormPrevious } from 'react-icons/gr'

export interface propsType {
    title: string,
    columns: Object[],
    data: Object[],
    keysData?: string,
    pagination?: {
        page: number,
        perPage: number,
        totalRows: number
    },
    selectable?: boolean
}

export interface dataSplitType {
    [x: string]: any
    data: Object[]
}
const CustDataTable = ({ 
    title, 
    keysData, 
    columns, 
    data, 
    pagination = {
        page: 1,
        perPage: 5,
        totalRows: 0
    },
    selectable}: propsType) => {
    const [listPagination, setListPagination] = React.useState([]) as any
    const [perPage, setPerPage] = React.useState(5)
    const [page, setPage] = React.useState(1)
    const [totalRows, setTotalRows] = React.useState(0)
    const [keys, setKeys] = React.useState(0)

    const [checked, setChecked] = React.useState([]) as any

    let idxFor = 0

    React.useEffect(() => {
        setPerPage(pagination.perPage)
        setPage(pagination.page)
        setTotalRows(data.length)
    }, [])

    React.useEffect(() => {
        paginationActivate()
    }, [page, JSON.stringify(data)])

    const paginationActivate = () => {        
        const dataChunk = chunkingArray(data)
        const dataHasil = []
        for (let index = 0 + (page - 1); index < 7 + (page - 1); index++) {
            if(dataChunk[index]){
                dataHasil.push(index + 1)
            }
        }
        setListPagination(dataHasil)
    }

    const chunkingArray = (data:any) => {
        return data.reduce((result: any[][], item: any, idx: number) => {
            const chunkIndex = Math.floor(idx / perPage)

            if (!result[chunkIndex]) {
                result[chunkIndex] = [] // start a new chunk
            }

            result[chunkIndex].push(item)

            return result
        }, [])
    }

    const changePage = (page: number) => {
        setPage(page)
    }

    const onCheckedBox = (val: any, idx: number) => {
        if (val) {
            setChecked([...checked, idx]) 
        } else {
            const datanya = checked.filter((valDet: any) => valDet !== idx)
            setChecked(datanya)
        }
        // 
        console.log(checked, 'checked data')
    }

    return <TableContainer>
        <Table variant='striped' colorScheme='teal' key={keys}>
            <TableCaption>{title}</TableCaption>
            <Thead>
                <Tr>
                    {
                        selectable
                        ? <Th><Checkbox /></Th>
                        : null
                    }
                    {
                        columns.map((val: any, idx: any) =>
                            <Th key={idx}><h2>{val.label}</h2></Th>
                        )
                    }
                </Tr>
            </Thead>
            <Tbody>
                {
                    data.length > 0
                    ? data.map((val: any, idx: any) =>
                        <Tr key={idx}>
                            {
                                selectable
                                ? <Td><Checkbox value={keysData ? val[keysData] : idx} onChange={(e) => onCheckedBox(e.target.checked, keysData ? val[keysData] : idx)}/></Td>
                                : null
                            }
                            {
                                columns.map((valCols: any, idxCols: any) =>
                                    valCols.field
                                    ? <Td key={idx + idxCols}>{ valCols.field(keysData ? val[keysData] : idx) }</Td>
                                    : <Td key={idx + idxCols} isNumeric={typeof val[valCols.name] == 'number'}>{val[valCols.name]}</Td>
                                )
                            }
                        </Tr>
                    )
                    : <Tr>
                        {
                            columns.map((valCols: any, idxCols: any) =>
                                <Td key={idxCols}>No data</Td>
                            )
                        }
                    </Tr>
                }
            </Tbody>
        </Table>
        <div style={{ textAlign: 'center' }}>
            <IconButton
                colorScheme='teal'
                aria-label='Search database'
                icon={<ChevronLeftIcon/>}
                size='sm'
            />
            {
                listPagination.map((val: any, idx: any) => 
                    <Button key={idx} variant={page === val ? 'outline' : 'solid'} colorScheme='teal' size='sm' onClick={() => changePage(val)}>
                        {
                            idx === 0 
                            ? (
                                page
                            )
                            : val
                        }
                    </Button>
                )
            }
            <IconButton
                colorScheme='teal'
                aria-label='Search database'
                icon={<ChevronRightIcon/>}
                size='sm'
            />
        </div>
    </TableContainer>
}

export default CustDataTable
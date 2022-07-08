import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from "@chakra-ui/icons"
import { Button, Checkbox, Grid, GridItem, Heading, IconButton, Input, InputGroup, InputRightElement, Table, TableCaption, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/react"
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
    selectable?: boolean,
    choosedData?: any,
    header?: any,
    filtered?: any
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
    selectable,
    choosedData,
    header,
    filtered }: propsType) => {
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

    React.useEffect(() => {
        choosedData(checked)
    }, [JSON.stringify(checked)])

    const paginationActivate = () => {
        const dataChunk = chunkingArray(data)
        const dataHasil = []
        for (let index = 0 + (page - 1); index < 7 + (page - 1); index++) {
            if (dataChunk[index]) {
                dataHasil.push({
                    page: index + 1,
                    data: dataChunk[index]
                })
            }
        }
        setListPagination(dataHasil)
    }

    const chunkingArray = (data: any) => {
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
    }

    const onCheckedAll = (isChecked: boolean) => {
        if (isChecked) {
            const dataCheck = [] as any
            getNowDataShow()[0].data.map((val: any, idx: any) => {
                dataCheck.push(keysData ? val[keysData] : idx)
            })

            setChecked(dataCheck)
        } else {
            const dataCheck = [] as any
            getNowDataShow()[0].data.map((val: any, idx: any) => {
                dataCheck.push(keysData ? val[keysData] : idx)
            })

            setChecked(checked.filter((fil: any) => !dataCheck.includes(fil)))
        }
    }

    const getNowDataShow = () => {
        return listPagination.filter((lp: any) => lp.page === page)
    }

    return <TableContainer>
        <Grid templateColumns='repeat(5, 1fr)' gap={4} py={3}>
            <GridItem colSpan={2} h='10'>
                <Heading>{title}</Heading>
            </GridItem>
            <GridItem colStart={4} colEnd={6} textAlign={'right'}>
                {
                    filtered
                        ? <InputGroup size='md'>
                            <Input
                                pr='4.5rem'
                                type='text'
                                placeholder='Search'
                            />
                            <InputRightElement width='4.5rem'>
                                <SearchIcon />
                            </InputRightElement>
                        </InputGroup>
                        : null
                }
            </GridItem>
        </Grid>
        <Grid templateColumns='repeat(5, 1fr)' gap={4} py={3}>
            <GridItem>
                {header}
            </GridItem>
        </Grid>
        <Table variant='striped' colorScheme='teal' key={keys}>
            <Thead>
                <Tr>
                    {
                        selectable
                            ? <Th><Checkbox
                                isChecked={checked.length > 0 && checked.length === data.length}
                                isIndeterminate={checked.length > 0 && checked.length !== data.length}
                                onChange={(e) => onCheckedAll(e.target.checked)}
                            /></Th>
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
                    listPagination.length > 0
                        ? getNowDataShow()[0].data.map((val: any, idx: any) =>
                            <Tr key={idx}>
                                {
                                    selectable
                                        ? <Td><Checkbox isChecked={checked.filter((fil: any) => (keysData ? val[keysData] : idx) === fil).length > 0} onChange={(e) => onCheckedBox(e.target.checked, keysData ? val[keysData] : idx)} /></Td>
                                        : null
                                }
                                {
                                    columns.map((valCols: any, idxCols: any) =>
                                        valCols.field
                                            ? <Td
                                                style={
                                                    valCols.align
                                                    ? { textAlign: valCols.align }
                                                    : { textAlign: 'left' }
                                                } 
                                                key={idx + idxCols}>
                                                    {valCols.field(keysData ? val[keysData] : idx, val[valCols.name])}
                                                </Td>
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
                icon={<ChevronLeftIcon />}
                size='sm'
            />
            {
                listPagination.map((val: any, idx: any) =>
                    <Button key={idx} disabled={page === val.page} variant={page === val.page ? 'outline' : 'solid'} colorScheme='teal' size='sm' onClick={() => changePage(val)}>
                        {
                            idx === 0
                                ? (
                                    page
                                )
                                : val.page
                        }
                    </Button>
                )
            }
            <IconButton
                colorScheme='teal'
                aria-label='Search database'
                icon={<ChevronRightIcon />}
                size='sm'
            />
        </div>
    </TableContainer>
}

export default CustDataTable
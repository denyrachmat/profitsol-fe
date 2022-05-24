import { PhoneIcon, SearchIcon } from "@chakra-ui/icons"
import { Input, InputGroup, InputLeftElement, List, ListIcon, ListItem, Stack } from "@chakra-ui/react"
import { MdCheckCircle, MdLocationOn } from "react-icons/md"

import _ from 'lodash'

import { apiConn } from "./apiHelpers"
import React from "react"

interface PropsTypes {
    url: string,
    methods: string,
    dataGetRoot: any,
    dataValue: string,
    dataLabel: string,
    dataSent?: any,
    choosedData?: any 
}
const SearchBox = ({url, methods, dataGetRoot, dataValue, dataLabel, dataSent, choosedData}: PropsTypes) => {
    const [options, setOptions] = React.useState([]) as any
    const [textBoxVal, setTextBoxVal]  = React.useState('')

    const onChangeInput = (val: {target: {value : string}}) => {
        const valuenya = val.target.value

        setTextBoxVal(valuenya)

        if (valuenya) {
            getDataDeb(valuenya)
        } else {
            setOptions([])
        }
    }

    const getDataDeb = _.debounce(async (valuenya) => {
                let oriURL = url
                if (methods === 'get') {
                    oriURL = oriURL.replace(/{q}/g, valuenya)
                }
        
                const getData = await apiConn(
                    methods,
                    oriURL,
                    'ext',
                    dataSent ?? null
                )
        
                if(getData) {
                    if (dataGetRoot) {
                        const hasilData = dataGetRoot.split('.').reduce((o: { [x: string]: any },i: string | number) => o[i], getData)
                        if(hasilData && hasilData.length > 0) {
                            let dataList: { label: { [x: string]: any }; value: { [x: string]: any } }[] = []
                            hasilData.map((val: { [x: string]: any }) => {
                                dataList.push({
                                    label: dataLabel.split('.').reduce((o: { [x: string]: any },i: string | number) => o[i], val),
                                    value: dataValue.split('.').reduce((o: { [x: string]: any },i: string | number) => o[i], val)
                                })
                            })
        
                            setOptions(dataList)
                        }
                    }
                }
    }, 500)

    const onChooseOptions = (data: Object[], label: any) => {
        choosedData(data)
        setTextBoxVal(label)
        setOptions([])
    }

    return <Stack spacing={3} style={{width: '100%'}}>
        <InputGroup>
            <InputLeftElement
                pointerEvents='none'
                children={<SearchIcon color='gray.300' />}
            />
            <Input placeholder='Search Something' size='md' onChange={onChangeInput} value={textBoxVal}/>
        </InputGroup>
        <InputGroup style={{position: 'absolute', paddingTop: 35}}>
            <List spacing={3} style={{zIndex: 5, backgroundColor: "white"}}>
                {
                    options.map((valOpt: { value: any; label: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal | null | undefined | string }) => 
                        <ListItem onClick={() => onChooseOptions(valOpt.value, valOpt.label)}>
                            <ListIcon as={MdLocationOn} color='green.500' />
                            {valOpt.label}
                        </ListItem>
                    )
                }
            </List>
        </InputGroup>
    </Stack>
}

export default SearchBox
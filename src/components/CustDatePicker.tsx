import { Button, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger, Portal } from "@chakra-ui/react"
import React from "react";
import DatePicker from "react-datepicker";
import Calendar from 'react-calendar';
import moment from 'moment'

import "react-datepicker/dist/react-datepicker.css";
import 'react-calendar/dist/Calendar.css';

export interface PropsTypes {
    value: Date | null,
    onChange: any
}

const CustDatePicker = ({ value, onChange }: PropsTypes) => {
    const [startDate, setStartDate] = React.useState(new Date());
    return <>
        <Popover>
            <PopoverTrigger>
                <Input readOnly type="text" value={moment(value).format("D MMMM YYYY")} onChange={(val: { target: { value: string } }) => onChange(val.target.value)} />
            </PopoverTrigger>
            <Portal>
                <PopoverContent>
                    <PopoverArrow />
                    <PopoverHeader>Choose Date</PopoverHeader>
                    <PopoverCloseButton />
                    <PopoverBody>
                        <Calendar onChange={onChange} value={value} />
                    </PopoverBody>
                </PopoverContent>
            </Portal>
        </Popover>
    </>
}

export default CustDatePicker
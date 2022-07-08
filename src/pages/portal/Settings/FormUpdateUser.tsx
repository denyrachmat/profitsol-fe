import { FormControl, FormLabel, Input, Stack, Flex, Checkbox } from "@chakra-ui/react"
import React from "react"

export interface propTypes {
    first_name: string,
    last_name: string,
    email: string,
    is_verified: Boolean,
    changedData?: any
}

const FormUpdateUser = ({first_name, last_name, email, is_verified, changedData}: propTypes) => {
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [emails, setEmails] = React.useState('')
    const [isVerified, setIsVerified] = React.useState(false) as any

    React.useEffect(() => {
        setFirstName(first_name)
        setLastName(last_name)
        setEmails(email)
        setIsVerified(is_verified)
    }, [])

    React.useEffect(() => {
        changedData({
            firstName,
            lastName,
            emails,
            isVerified
        })
    }, [
        firstName,
        lastName,
        emails,
        isVerified
    ])

    return <Stack >
        <Flex flex={1} justify={'center'} m={5}>
            <Stack w={'full'} paddingRight={2}>
                <FormControl id="firstname">
                    <FormLabel>First Name</FormLabel>
                    <Input type="text"  value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                </FormControl>
            </Stack>

            <Stack w={'full'} paddingLeft={2}>
                <FormControl id="lastname">
                    <FormLabel>Last Name</FormLabel>
                    <Input type="text"  value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                </FormControl>
            </Stack>
        </Flex>
        <Flex flex={1} justify={'center'} m={5} p={2}>
            <Stack w={'full'} paddingLeft={2} paddingRight={2}>
                <FormControl id="firstname">
                    <FormLabel>Email</FormLabel>
                    <Input type="text"  value={emails} onChange={(e) => setEmails(e.target.value)}/>
                </FormControl>
            </Stack>
        </Flex>
        <Flex flex={1} justify={'center'} m={5} p={2}>
            <Stack w={'full'} paddingLeft={2} paddingRight={2}>
                <FormControl id="firstname">
                    <Checkbox colorScheme='green' defaultChecked isChecked={isVerified} onChange={(e) => setIsVerified(e.target.checked)}>
                        Is Verified ?
                    </Checkbox>
                </FormControl>
            </Stack>
        </Flex>

    </Stack>
}

export default FormUpdateUser
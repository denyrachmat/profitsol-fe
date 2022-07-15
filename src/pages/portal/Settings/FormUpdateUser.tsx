import { FormControl, FormLabel, Input, Stack, Flex, Checkbox } from "@chakra-ui/react"
import React from "react"

export interface propTypes {
    username: string,
    first_name: string,
    last_name: string,
    email: string,
    is_verified: Boolean,
    changedData?: any
}

const FormUpdateUser = ({ username, first_name, last_name, email, is_verified, changedData }: propTypes) => {
    const [isUpdate, setIsUpdate] = React.useState(false) as any
    const [usernameTemp, setUsernameTemp] = React.useState('')
    const [firstName, setFirstName] = React.useState('')
    const [lastName, setLastName] = React.useState('')
    const [password, setPassword] = React.useState('') as any
    const [passwordConfirmation, setPasswordConfirmation] = React.useState('') as any
    const [emails, setEmails] = React.useState('')
    const [isVerified, setIsVerified] = React.useState(false) as any
    const [isDefPass, setDefPass] = React.useState(false) as any

    React.useEffect(() => {
        // setUsername(username)
        setFirstName(first_name)
        setLastName(last_name)
        setEmails(email)
        setIsVerified(is_verified)

        setIsUpdate(username ? true : false)
    }, [])

    React.useEffect(() => {
        const dataUser = { username: usernameTemp }
        const usernameTot = isUpdate
            ? username
            : dataUser.username
        changedData({
            username: usernameTot,
            password,
            passwordConfirmation,
            firstName,
            lastName,
            emails,
            isVerified,
            isUpdate
        })
    }, [
        firstName,
        lastName,
        emails,
        isVerified
    ])

    React.useEffect(() => {
        if (isDefPass) {
            setPassword(process.env.REACT_APP_PORTAL_DEF_PASS)
            setPasswordConfirmation(process.env.REACT_APP_PORTAL_DEF_PASS)
        } else {
            setPassword('')
            setPasswordConfirmation('')
        }
    }, [isDefPass])

    return <Stack p={10}>
        {
            isUpdate
                ? null
                : <Flex flex={1} justify={'center'}>
                    <Stack w={'full'} paddingRight={2}>
                        <FormControl id="firstname">
                            <FormLabel>Username</FormLabel>
                            <Input type="text" value={usernameTemp} onChange={(e) => setUsernameTemp(e.target.value)} />
                        </FormControl>
                    </Stack>
                </Flex>
        }
        <Flex flex={1} justify={'center'}>
            <Stack w={'full'} paddingRight={2}>
                <FormControl id="firstname">
                    <FormLabel>First Name</FormLabel>
                    <Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </FormControl>
            </Stack>

            <Stack w={'full'} paddingLeft={2}>
                <FormControl id="lastname">
                    <FormLabel>Last Name</FormLabel>
                    <Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </FormControl>
            </Stack>
        </Flex>
        {
            isUpdate
                ? null
                : <Flex flex={1} justify={'center'}>
                    <Stack w={'full'} paddingRight={2}>
                        <FormControl id="firstname">
                            <FormLabel>Password</FormLabel>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </FormControl>
                    </Stack>

                    <Stack w={'full'} paddingLeft={2}>
                        <FormControl id="lastname">
                            <FormLabel>Password Confirmation</FormLabel>
                            <Input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
                        </FormControl>
                    </Stack>
                </Flex>
        }
        <Flex flex={1} justify={'center'}>
            <Stack w={'full'}>
                <FormControl id="firstname">
                    <FormLabel>Email</FormLabel>
                    <Input type="text" value={emails} onChange={(e) => setEmails(e.target.value)} />
                </FormControl>
            </Stack>
        </Flex>
        {
            isUpdate
                ? <Flex flex={1} justify={'center'}>
                    <Stack w={'full'}>
                        <FormControl id="firstname">
                            <Checkbox colorScheme='green' defaultChecked isChecked={isVerified} onChange={(e) => setIsVerified(e.target.checked)}>
                                Is Verified ?
                            </Checkbox>
                        </FormControl>
                    </Stack>
                </Flex>
                : <Flex flex={1} justify={'center'}>
                    <Stack w={'full'}>
                        <FormControl id="firstname">
                            <Checkbox colorScheme='green' defaultChecked isChecked={isDefPass} onChange={(e) => setDefPass(e.target.checked)}>
                                Using default password ?
                            </Checkbox>
                        </FormControl>
                    </Stack>
                </Flex>
        }
    </Stack>
}

export default FormUpdateUser
import { Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, Stack, Box, FormLabel, Input, InputGroup, InputLeftAddon, InputRightAddon, Select, Textarea, DrawerFooter, Button, useDisclosure } from "@chakra-ui/react"
import React from "react"

export interface propTypes {
    openDrawer: boolean,
    header: string,
    bodyDrawer: any,
    resultDrawer?: any,
    toogleDrawer?: any
    // drawerState?: boolean
}

const DrawerDialog = ({openDrawer, header, bodyDrawer, resultDrawer, toogleDrawer}: propTypes) => {
    const firstField = React.useRef() as any
    const { isOpen, onOpen, onClose } = useDisclosure()

    React.useEffect(() => {
        if (openDrawer) {
            onOpen()
        } else {
            onClose()
        }
    }, [openDrawer])

    const onOke = (flag: Boolean) => {
        resultDrawer(flag)
        onClose()
    }

    React.useEffect(() => {
        toogleDrawer(isOpen)
        console.log(isOpen)
    }, [isOpen])

    return <>
        <Drawer
            isOpen={isOpen}
            placement='right'
            initialFocusRef={firstField}
            onClose={onClose}
            size={'lg'}
        >
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth='1px'>
                    {header}
                </DrawerHeader>

                <DrawerBody>
                    {bodyDrawer}
                </DrawerBody>

                <DrawerFooter borderTopWidth='1px'>
                    <Button variant='outline' mr={3} onClick={() => onOke(false)}>
                        Cancel
                    </Button>
                    <Button colorScheme='blue' onClick={() => onOke(true)}>Submit</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    </>
}

export default DrawerDialog
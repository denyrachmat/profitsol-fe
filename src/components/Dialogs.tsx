import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import React from "react"

import { useDispatch, useSelector } from "react-redux"
import { store } from '../stores';

import * as DialogTypes from '../stores/actions/types/portal/DialogTypes'
import * as DialogCreators from '../stores/actions/creators/portal/DialogCreators'

export type iRootState = ReturnType<typeof store>

const Dialogs = () => {
    const { dialogLists } = useSelector((state: iRootState) => state.Dialogs)
    const dispatch = useDispatch()

    const onCloseDialog = (id: string) => {
        dispatch(DialogCreators.setDialogs(
            id,
            false
        ))
    }

    return dialogLists && dialogLists.length > 0
        ? <>
            {
                dialogLists.map((val: DialogTypes.getCurrentDialog, idx: number) => {
                    return (
                        <Modal closeOnOverlayClick={false} key={idx} isOpen={val.dialogIsOpen} onClose={() => onCloseDialog(val.dialogID)}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>Create your account</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody pb={6}>
                                    {val.dialogContent}
                                </ModalBody>

                                <ModalFooter>
                                    <Button colorScheme='blue' mr={3}>
                                        Ok
                                    </Button>
                                    {
                                        val.dialogCancelBtn
                                        ? <Button onClick={() => onCloseDialog(val.dialogID)}>Cancel</Button>
                                        : null
                                    }                                    
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    )
                })
            }
        </>
        : <></>
}

export default Dialogs
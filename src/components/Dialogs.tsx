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

    const onCancelDialog = (id: string) => {
        dispatch(DialogCreators.setButtonFeedBack(
            id,
            'cancel'
        ))

        onCloseDialog(id)
    }

    const onClickOk = (id: string) => {
        dispatch(DialogCreators.setButtonFeedBack(
            id,
            'ok'
        ))

        onCloseDialog(id)
    }

    React.useEffect(() => {},[])
    
    return dialogLists && dialogLists.length > 0
        ? <div>
            {
                dialogLists.map((val: DialogTypes.getCurrentDialog, idx: number) => (
                        <Modal size={'5xl'} closeOnOverlayClick={false} key={idx} isOpen={val.dialogIsOpen} onClose={() => onCloseDialog(val.dialogID)}>
                            <ModalOverlay />
                            <ModalContent>
                                <ModalHeader>{val.dialogTitle}</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody pb={6}>
                                    {val.dialogContent}
                                </ModalBody>

                                <ModalFooter>
                                    <Button colorScheme='blue' mr={3} onClick={() => onClickOk(val.dialogID)}>
                                        Ok
                                    </Button>
                                    {
                                        val.dialogCancelBtn
                                        ? <Button onClick={() => onCancelDialog(val.dialogID)}>Cancel</Button>
                                        : null
                                    }                                    
                                </ModalFooter>
                            </ModalContent>
                        </Modal>
                    )
                )
            }
        </div>
        : <div></div>
}

export default Dialogs
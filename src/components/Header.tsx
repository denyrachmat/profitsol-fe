import React from "react";
import { Link, Box, Flex, Text, Button, Stack, Menu, MenuButton, MenuList } from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";
import Logo from "./Logo";
import CustomBadge from "./CustomBadge";
import { ColorModeSwitcher } from "../ColorModeSwitcher"
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

import Dialogs from "./Dialogs";

import * as AuthCreator from '../stores/actions/creators/portal/AuthCreators'
import * as DialogCreators from '../stores/actions/creators/portal/DialogCreators'
import * as DialogTypes from '../stores/actions/types/portal/DialogTypes'

const NavBar = (props: any) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <NavBarContainer {...props}>
            <Logo
                w="100px"
                color={["primary.500", "primary.500"]}
            />
            <MenuToggle toggle={toggle} isOpen={isOpen} />
            <MenuLinks isOpen={isOpen} />
        </NavBarContainer>
    );
};

const MenuToggle = ({ toggle, isOpen }: any) => {
    return (
        <Box display={{ base: "block", md: "none" }} onClick={toggle}>
            {isOpen ? <CloseIcon /> : <HamburgerIcon />}
        </Box>
    );
};

const MenuItem = ({ children, isLast, to = "/", ...rest }: any) => {
    return (
        <Link href={to}>
            <Text display="block" {...rest}>
                {children}
            </Text>
        </Link>
    );
};

const MenuLinks = ({ isOpen }: any) => {
    const { dialogID, dialogPressedBtn, dialogIsOpen } = useSelector((state: { Dialogs: DialogTypes.setDialogs }) => state.Dialogs)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const changeLocation = (to: string) => {
        navigate(to)
    }

    const onLogoutClick = () => {
        dispatch(DialogCreators.setDialogs(
            'IS_LOGOUT',
            true,
            'Logout',
            'Are you sure want to logged out ?',
            true,
            'cancel'
        ))
    }

    // Dialogs
    // Check if firest run or not
    const isFirstRun = React.useRef(true);
    React.useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (dialogID === 'IS_LOGOUT' && dialogPressedBtn === 'ok') {
            dispatch(AuthCreator.SetLogout())
            changeLocation('/login')
        }
    }, [dialogIsOpen])

    return (
        <Box
            display={{ base: isOpen ? "block" : "none", md: "block" }}
            flexBasis={{ base: "100%", md: "auto" }}
        >
            <Dialogs />
            <Stack
                spacing={8}
                align="center"
                justify={["center", "space-between", "flex-end", "flex-end"]}
                direction={["column", "row", "row", "row"]}
                pt={[4, 4, 0, 0]}
            >
                <MenuItem to="#" onClick={() => changeLocation('/')}>Home</MenuItem>
                <MenuItem to="#">
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size={'lg'} variant="ghost">
                            Account
                        </MenuButton>
                        <MenuList p={4}>
                            <MenuItem to="#" onClick={() => changeLocation('/profile')}>Profile</MenuItem>
                            <MenuItem to="#" onClick={() => onLogoutClick()}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </MenuItem>
                <ColorModeSwitcher justifySelf="flex-end" />
            </Stack>
        </Box>
    );
};

const NavBarContainer = ({ children, ...props }: any) => {
    return (
        <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            w="100%"
            p={5}
            bg={["primary.500", "primary.500", "transparent", "transparent"]}
            color={["primary.700", "primary.700"]}
            style={{ position: 'fixed', top: 0 }}
            {...props}
        >
            {children}
        </Flex>
    );
};

export default NavBar;
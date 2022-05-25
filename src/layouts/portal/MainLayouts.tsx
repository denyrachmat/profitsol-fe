import React from "react"
import Header from '../../components/Header'
import { Outlet } from 'react-router-dom'
import { store } from '../../stores';
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export type iRootState = ReturnType<typeof store>

const MainLayouts = () => {
    const navigate = useNavigate()
    const { isLoggedIn } = useSelector((state: iRootState) => state.AuthPortal)

    React.useEffect(() => {
        if (!isLoggedIn) {
            console.log('belum login')
            navigate('/login')
        }
    }, [isLoggedIn])

    return (
        <div>
            <Header />
            <div style={{marginTop: '10vh'}}>
            <Outlet></Outlet>
            </div>
        </div>
    )
}

export default MainLayouts
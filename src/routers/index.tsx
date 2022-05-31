import { BrowserRouter, Routes, Route, useLocation, Router } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import mapboxgl from 'mapbox-gl';

import { store, persistor } from '../stores';

// Layouts
import MainLayouts from '../layouts/portal/MainLayouts'
import AuthLayouts from "../layouts/portal/AuthLayouts";

// Pages
import Dashboards from "../pages/portal/Dashboard";
import Profile from "../pages/portal/Profile";
import Login from "../pages/portal/Login";
import Register from "../pages/portal/Register";
import ForgotPass from "../pages/portal/ForgotPass";

import Settings from "../pages/portal/Settings";
import Users from "../pages/portal/Settings/Users";

const API_KEY:string = process.env.REACT_APP_GAPI_KEY ?? ''
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVueTIyIiwiYSI6ImNqaHU2aDZ2MzA3MjEza3BpbDA5cWQyNDEifQ.SNmUHNN6YhvH5ATUQSTeJQ'

function RouterList() {
    const location = useLocation();
    return (
        <Routes location={location}>
            <Route element={<AuthLayouts />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgotpass" element={<ForgotPass />} />
            </Route>
            <Route element={<MainLayouts />}>
                <Route path="/" element={<Dashboards />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/users" element={<Users />} />
            </Route>
        </Routes>
    )
}

const Routers = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <Wrapper apiKey={API_KEY} libraries={["places"]}>
                        <RouterList />
                    </Wrapper>
                </BrowserRouter>
            </PersistGate>
        </Provider>
    )
}

export default Routers
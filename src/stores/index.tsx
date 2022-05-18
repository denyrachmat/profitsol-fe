import { combineReducers, createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'
import localforage from 'localforage'

import { configureStore } from "@reduxjs/toolkit";

// Reducers
import { AuthReducers as PortalAuthReducers } from "./reducers/portal/AuthReducers";
import { ProfileReducers } from "./reducers/portal/ProfileReducers";
import { DialogReducers } from "./reducers/portal/DialogReducers";

const listReducers = combineReducers({
    AuthPortal: PortalAuthReducers,
    Profile: ProfileReducers,
    Dialogs: DialogReducers
})

const sagaMiddleware = createSagaMiddleware()

const persistConfig = {
    key: 'STXAPP',
    storage: localforage,
}

const persistedReducer = persistReducer(persistConfig, listReducers)
const enhancers = process.env.NODE_ENV === 'production'
    ? applyMiddleware(sagaMiddleware)
    : applyMiddleware(sagaMiddleware);

export const store: any = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware  => getDefaultMiddleware({
        serializableCheck: false,
    }),
    enhancers: [enhancers]
})

export const persistor = persistStore(store)

sagaMiddleware.run(rootSaga);
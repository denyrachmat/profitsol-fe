import { combineReducers, createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import { composeWithDevTools } from 'redux-devtools-extension'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'
import localforage from 'localforage'

const listReducers = combineReducers([])

const sagaMiddleware = createSagaMiddleware()

const persistConfig = {
    key: 'STXAPP',
    storage: localforage,
}

const persistedReducer = persistReducer(persistConfig, listReducers)

export const store:any = createStore(
    persistedReducer,
    composeWithDevTools(
        applyMiddleware(sagaMiddleware)
    )
)

export const persistor = persistStore(store)

sagaMiddleware.run(rootSaga);
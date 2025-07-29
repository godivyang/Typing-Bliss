import React, { useContext, useEffect, useState } from "react";
import { auth, signUp as mainSignUp, logIn as mainLogIn,
logOut as mainLogOut } from "./Firebase";

export const AuthContext = React.createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({children}) => {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    const signUp = (email, password) => {
        return mainSignUp(email, password);
        // return auth.CreateUserWithEmailAndPassword(email, password);
    }

    const logIn = (email, password) => {
        return mainLogIn(email, password);
    }

    const logOut = () => {
        return mainLogOut();
    }

    // const getData = (docPath) => {
    //     return mainGetData(currentUser, docPath);
    // }

    // const updateData = (data) => {
    //     return mainUpdateData(currentUser, data);
    // }

    // const getDashboardData = (app, filters) => {
    //     return mainGetDashboardData(currentUser, app, filters);
    // }

    // const setData = (path, data, docKey) => {
    //     return mainSetData(currentUser, path, data, docKey);
    // }

    // const getCollection = (path, filters, manualFilters) => {
    //     return mainGetCollection(currentUser, path, filters, manualFilters);
    // }

    // const deleteData = (path, docKey) => {
    //     return mainDeleteData(currentUser, path, docKey);
    // }

    // const getSystemData = (appName, docPath) => {
    //     return mainGetSystemData(currentUser, appName, docPath);
    // }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signUp, logIn, logOut
    }
    
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

// export default AuthContext;
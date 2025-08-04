// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithCustomToken } from "firebase/auth";
import { getFirestore, getDoc, updateDoc, doc, setDoc, collection, query, 
    getDocs, where, deleteDoc, getCountFromServer, getAggregateFromServer,
    sum, average, limit } from "firebase/firestore";
// import { AuthContext } from "./AuthContext";
// import { useEffect } from "react";
// import { AuthContext } from "./AuthContext";
// import { useContext, useEffect } from "react";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const auth = getAuth(app);
const db = getFirestore(app);

var userCredentials;
auth.onAuthStateChanged((user) => {
    userCredentials = user;
});
// useEffect(() => {
//     userCredentials = useAuth().currentUser;
// });

const signUp = async (email, password) => {
    // This function returns a credential which gives you the user's uid
    // which you could then use to create your document
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    userCredentials = credential.user;
}

const logIn = async (email, password) => {
    const loginEvent = await signInWithEmailAndPassword(auth, email, password);
    userCredentials = loginEvent.user;
    return afterLogin();
}

export const logInWithToken = async (token) => {
    const loginEvent = await signInWithCustomToken(auth, token);
    userCredentials = loginEvent.user;
    return afterLogin();
}

const afterLogin = async () => {
    const uid = userCredentials.uid;
    var ref = doc(db, "_private", uid);
    const docSnap = await getDoc(ref);
    if (!docSnap.exists()) {
        
    }
    return userCredentials;
}

const logOut = () => {
    return signOut(auth);
}

const isLoggedIn = () => {
    // console.log("checking if user is logged in");
    if(!userCredentials) return false;
    else {
        // console.log(userCredentials);
        return true;
    }
}

const _checkIfExists = async (docRef, docPath) => {
    var docSnapshot;
    docSnapshot = await getDoc(docRef);
    if(!docSnapshot.exists()) {
        return [false];
    } else if(docPath) {
        const data = await docSnapshot.get(docPath);
        if(!data) return [false];
        else return [true, data];
    }
    return [true, docSnapshot];
};

const _readQuery = async (docRef, docPath) => {
    const dataExist = await _checkIfExists(docRef, docPath);
    if(dataExist[0]) {
        return [true, dataExist[1]];
    } else {
        return [false];
    }
};

const _writeQuery = async (docRef, data) => {
    await updateDoc(docRef, data).then(()=>{
        return [true, "Success"];
    }).catch((reason)=>{
        return [false, reason];
    });
};

const getData = async (docPath) => {
    const db = getFirestore(app);
    // userCredentials = GetUserCredentials();
    // if(!userCredentials) userCredentials = useAuth().currentUser;
    var docRef = doc(db, "_private", userCredentials.uid);
    
    return await _readQuery(docRef, docPath).catch((reason) => {
                console.error(reason);
                return [false, reason];
            });
}

const updateData = async (data) => {
    const db = getFirestore(app);
    // userCredentials = GetUserCredentials();
    var docRef = doc(db, "_private", userCredentials.uid);
    
    return await _writeQuery(docRef, data).catch((reason) => {
                console.error(reason);
                return [false, reason];
            });
}

const getDashboardData = async (app, filters) => {
    var dashboardData = {};
    if(app === "typing_bliss") {
        var resultsRef = collection(db, "_private", 
        userCredentials.uid, "typing_bliss-results");

        // var q = query(resultsRef, limit(5));
        let q = query(resultsRef);
        if(filters) filters.forEach((filter) => {
            q = query(q, where(filter[0], filter[1], filter[2]));
        });
        const snapshot = await getCountFromServer(q);
        dashboardData["testsTaken"] = snapshot.data().count;
        const aggregate = await getAggregateFromServer(q, {
            wordsTyped: sum("wordsCount"),
            averageWPM: average("wpm"),
            averageAccuracy: average("accuracy"),
            timeSpent: sum("duration")
        });
        dashboardData["wordsTyped"] = aggregate.data().wordsTyped;
        dashboardData["averageWPM"] = aggregate.data().averageWPM ? 
        aggregate.data().averageWPM.toFixed(2) : 0;
        dashboardData["averageAccuracy"] = aggregate.data().averageAccuracy ? 
        aggregate.data().averageAccuracy.toFixed(2) : 0;
        dashboardData["timeSpent"] = aggregate.data().timeSpent;
        
        const keysAccuracy = await getData("typing_bliss.keys");
        dashboardData.keysChart = [["Alphabet", "Typos", "Correct"]];
        dashboardData.typoTracker = [["Alphabet", "Typos"]];
        if(keysAccuracy[1]){
        "abcdefghijklmnopqrstuvwxyz".split("").forEach((alph) => {
            const total = keysAccuracy[1][alph][0];
            const typoPercent = (keysAccuracy[1][alph][1] / total) * 100;
            const correctPercent = ((keysAccuracy[1][alph][0] - 
                keysAccuracy[1][alph][1]) / total) * 100;
            dashboardData.keysChart.push([ alph, typoPercent, correctPercent ]);
            dashboardData.typoTracker.push([alph, keysAccuracy[1][alph][1]]);
        });
        }
        const calendarData = {};
        dashboardData.calendarChart = [[
            { type: "date", id: "Date" },
            { type: "number", id: "Duration" }
          ]];
        dashboardData.accuracyVsWPM = [["Accuracy", "WPM"]];
        dashboardData.accuracyProgress = [["Time", "Accuracy"]];
        dashboardData.wpmProgress = [["Time", "WPM"]];
        
        await getDocs(q).then((data) => {
            data.forEach((d) => {
                const row = d.data();
                const date = new Date(row.date).toDateString();
                if(calendarData[date]) {
                    calendarData[date] += row.duration;
                } else {
                    calendarData[date] = row.duration;
                }
                dashboardData.accuracyVsWPM.push([row.accuracy, row.wpm]);
                dashboardData.accuracyProgress.push([new Date(row.date), row.accuracy]);
                dashboardData.wpmProgress.push([new Date(row.date), row.wpm]);
            });
        });
        const backendData = {calendarData, };
        updateData({"typing_bliss.dashboardData": backendData});
        Object.keys(calendarData).forEach((date) => {
            dashboardData.calendarChart.push(
                [new Date(date), calendarData[date]]);
        });

        
        // Object.keys(dashboardData).forEach(key => {
        //     backendData[key] = JSON.stringify(dashboardData[key])
        // });
        
    }
    return dashboardData;
}

const updateDashboardData = (app, type, data) => {
    if(app === "typing_bliss") {
        if(type === "result") {
            let dashboardData;
            getData("typing_bliss/dashboardData").then((d) => {
                if(d[0]) {
                    dashboardData = d[1];
                    const accuracyProgress = JSON.parse(dashboardData.accuracyProgress);
                    accuracyProgress.push([new Date(data.date), data.accuracy]);
                    const accuracyVsWPM = JSON.parse(dashboardData.accuracyVsWPM);
                    accuracyVsWPM.push([data.accuracy, data.wpm]);
                    const averageAccuracy = JSON.parse(dashboardData.averageAccuracy);
                    // averageAccuracy = ;
                    const averageWPM = JSON.parse(dashboardData.averageWPM);
                    // averageWPM = ;
                    const calendarData = JSON.parse(dashboardData.calendarData);
                    if(calendarData[new Date(data.date).toDateString()]) {
                        calendarData[new Date(data.date).toDateString()] += data.duration;
                    } else {
                        calendarData[new Date(data.date).toDateString()] = data.duration;
                    }
                } else {
                    dashboardData = {};
                }
            });
            if(!dashboardData) dashboardData = {};
        }
    }
};


const setData = async (path, data, docKey) => {
    // userCredentials = GetUserCredentials();
    var collectionRef = collection(db, "_private", userCredentials.uid, path);
    setDoc(doc(collectionRef, docKey), data);
}

const getCollection = async (path, filters, manualFilters) => {
    // userCredentials = GetUserCredentials();
    var collectionRef = collection(db, "_private", userCredentials.uid, path);
    var q = query(collectionRef);
    if(filters) filters.forEach((filter) => {
        q = query(q, where(filter[0], filter[1], filter[2]));
    });
    var filteredData = [];
    await getDocs(q).then((data) => {
        data.forEach((d) => {
            const row = d.data();
            var flag = true;
            var orFlag = false;
            var orWasUsed = false;
            if(manualFilters && manualFilters.length > 0) {
                manualFilters.forEach((filter) => {
                    if(filter[1] === "in") {
                        if(Array.isArray(row[filter[0]])) {
                            row[filter[0]].forEach((f) => {
                                if(!filter[2].includes(f)) flag = false;
                            });
                        }
                        else if(!filter[2].includes(row[filter[0]])) flag = false;
                    }
                    else if(filter[1] === "orIn") {
                        orWasUsed = true;
                        if(Array.isArray(row[filter[0]])) {
                            row[filter[0]].forEach((f) => {
                                if(filter[2].includes(f)) orFlag = true;
                            });
                        }
                        else if(filter[2].includes(row[filter[0]])) orFlag = true;
                    }
                });
                if(!orWasUsed) orFlag = true;
                if(flag && orFlag) filteredData.push(row);
            }
            else filteredData.push(row);
        });
    });
    return filteredData;
}

const deleteData = async (path, docKey) => {
    var collectionRef = collection(db, "_private", userCredentials.uid, path);
    deleteDoc(doc(collectionRef, docKey));
}

const getSystemData = async (appName, docPath) => {
    const db = getFirestore(app);
    var docRef = doc(db, "_constants", appName);
    
    return await _readQuery(docRef, docPath).catch((reason) => {
                console.error(reason);
                return [false, reason];
            });
}

export { 
    logIn,
    signUp,
    logOut,
    isLoggedIn,
    getData,
    updateData,
    deleteData,
    getDashboardData,
    updateDashboardData,
    setData,
    getCollection,
    getSystemData
};
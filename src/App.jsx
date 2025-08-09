import './App.css';
import { useState, useEffect } from 'react';
import BusyIndicator from './component/BusyIndicator';
import TypingBliss from './view/TypingBliss';
import { logIn, logInWithToken } from './api/Firebase';
import { checkIfLogin } from './api/TypingBliss';

const App = () => {
  const [busyDialogVisible, setBusyDialogVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    setBusyDialogVisible(true);
    let loginTriesFlag = localStorage.getItem("TypingBliss-Login-Tries");
    if (!loginTriesFlag) {
        localStorage.setItem("TypingBliss-Login-Tries", "fresh");
    } else if (loginTriesFlag === "tried") {
        localStorage.setItem("TypingBliss-Login-Tries", "final");
    } else if (loginTriesFlag === "fresh") {

    } else {
        localStorage.removeItem("TypingBliss-Login-Tries");
        alert("SSO LOGIN FAILED!");
        setBusyDialogVisible(false);
        return;
    }
    checkIfLogin(code).then((data) => {
        localStorage.removeItem("TypingBliss-Login-Tries");
        setUserName(data.userName);
        if (code) window.location.href = process.env.REACT_APP_TYPING_BLISS_URL;
        else {
            logInWithToken(data.token).then(() => setLoggedIn(true));
        }
    }).catch((e) => {
        if (localStorage.getItem("TypingBliss-Login-Tries") === "fresh") {
            window.location.href = process.env.REACT_APP_ULTIMATE_UTILITY_URL + "?redirect=TYPING_BLISS";
            localStorage.setItem("TypingBliss-Login-Tries", "tried");
        } else {
            localStorage.removeItem("TypingBliss-Login-Tries");
            alert("SSO LOGIN FAILED!");
        }
    }).then(() => {
        setBusyDialogVisible(false);
    });
  },[]);

  // logIn("divyangtewaridt@gmail.com", "aaaaaaaa").then(() => setLoggedIn(true));

  return loggedIn ?
    <div className="App container">
      <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.8/css/solid.css"></link>
      <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.8/css/line.css"></link>
      <link rel="preconnect" href="https://fonts.googleapis.com"></link>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"></link>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet"></link>
      {busyDialogVisible && <BusyIndicator/>}
        {/* <div className="rotating-coin">uU</div> */}
        {loggedIn && <TypingBliss showBusyIndicator={setBusyDialogVisible}/>}
    </div>
    :
    <div style={{margin: "2rem", background: "black", fontSize: "2rem", fontWeight: "700", borderRadius: "10px", padding: "2rem"}}>
      Please wait, we are working on autorizing you.
    </div>
};

export default App;

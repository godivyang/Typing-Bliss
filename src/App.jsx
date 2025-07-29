import './App.css';
import { useState } from 'react';
import BusyIndicator from './component/BusyIndicator';
import TypingBliss from './view/TypingBliss';
import { isLoggedIn, logIn } from './api/Firebase';

const App = () => {
  const [busyDialogVisible, setBusyDialogVisible] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  logIn("divyangtewaridt@gmail.com", "aaaaaaaa").then(() => setLoggedIn(true));

  return (
    <div className="App container">
      {busyDialogVisible && <BusyIndicator/>}
        {/* <div className="rotating-coin">uU</div> */}
        {loggedIn && <TypingBliss showBusyIndicator={setBusyDialogVisible}/>}
    </div>
  );
};

export default App;

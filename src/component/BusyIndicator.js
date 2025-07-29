import './BusyIndicator.css';
// import loadingLogo from '../lib/loading.png';

const BusyIndicator = ({show}) => {
  if(show === true) {
    const container = document.querySelector(".BusyIndicator-Container"),
          background = document.querySelector(".BusyIndicator-Background"),
          word = document.querySelectorAll(".BusyIndicator-Word");
    if(container && background && word) {
      container.style.width = "100vw";
      container.style.height = "100vh";
      container.style.background = "rgb(0,0,0,0.8)";
      background.style.width = "30vw";
      background.style.height = "20vh";
      background.style.fontSize = "2vw";
      word.forEach((w, i) => {
        w.style.fontSize = "2vw";
        w.style.animationDelay = (i * 1 / 16) + "s";
      });
    }
  } else if(show === false) {
    const container = document.querySelector(".BusyIndicator-Container"),
          background = document.querySelector(".BusyIndicator-Background"),
          word = document.querySelectorAll(".BusyIndicator-Word");
    if(container && background && word) {
      container.style.width = "0vw";
      container.style.height = "0vh";
      container.style.background = "transparent";
      background.style.width = "0vw";
      background.style.height = "0vh";
      background.style.fontSize = "0px";
      word.forEach((w) => {
        w.style.fontSize = "0vw";
      });
    }
  }
  return (
    <div className="BusyIndicator-Container">
        {/* <div className="App-busy-indicator-background">
        <img src={loadingLogo} alt="loading" className="busy-indicator-icon" draggable="false"/>
        <div>Loading please wait...</div>
        </div> */}
        <div className="BusyIndicator-Background">
          <div style={{display: "flex"}}>
          {
            "ultimate_utility".split("").map((ch, i) => {
              return (
                <div className="BusyIndicator-Word" key={`busyIndicator_${i}`}>
                  {ch}
                </div>
              )
            })
          }
          </div>
          Loading please wait...
        </div>
    </div>
  );
}

export default BusyIndicator;
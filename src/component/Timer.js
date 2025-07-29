import "./Timer.css";
import { useEffect, useState } from "react";

class TimerClass {
    constructor(time, frequency, isCountdown, recurringFun, finalFun) {
        this.originalTime = time;
        this.time = time;
        this.frequency = frequency;
        this.isCountdown = isCountdown;
        this.recurringFun = recurringFun;
        this.finalFun = finalFun;
        this.started = false;
        this.paused = true;
        this.getTimeInHMS();
        if(recurringFun) recurringFun(
            {
                displayTime: this.displayTime,
                timePassed: this.isCountdown ? this.originalTime :
                    this.originalTime - this.time
            });
    }
    pause = () => {
        this.paused = true;
        if(this.timer) {
            clearInterval(this.timer);
            return this.time;
        }
    }
    resume = () => {
        this.paused = false;
        this.start();
    }
    reset = (time) => {
        clearInterval(this.timer);
        this.paused = true;
        this.started = false;
        this.timer = null;
        if(time) this.originalTime = time;
        this.time = this.originalTime;
        
        this.getTimeInHMS();
        this.recurringFun({
            displayTime: this.displayTime,
            timePassed: this.isCountdown ? this.originalTime :
                this.originalTime - this.time
        });
    }
    getTimeInHMS = () => {
        this.currTime = this.time;
        if(!this.isCountdown) this.currTime = this.originalTime - this.time;
        this.hours = Math.floor(this.currTime / 3600000);
        this.currTime -= this.hours * 3600000;
        this.mins = Math.floor(this.currTime / 60000);
        this.currTime -= this.mins * 60000;
        if(this.mins < 10 && this.mins >= 0 && this.hours > 0) this.mins = "0" + this.mins;
        
        this.secs = Math.floor(this.currTime / 1000);
        this.currTime -= this.secs * 1000;
        if(this.secs < 10 && this.secs >= 0 && (this.mins > 0 || this.mins === "00")) 
            this.secs = "0" + this.secs;
        
        this.ms = Math.floor(this.currTime / 10);
        if(this.ms < 10 && this.ms > 0 && (this.secs > 0 || this.secs === "00")) 
            this.ms = "0" + this.ms;
        this.displayTime = {
            hours: this.hours, 
            minutes: this.mins, 
            seconds: this.secs,
            milliseconds: this.ms
        }
    }
    start = () => {
        if(!this.timer || this.paused) {
            this.paused = false;
            this.started = true;
            this.timer = setInterval(() => {
                this.getTimeInHMS();
                this.recurringFun(
                    {
                        displayTime: this.displayTime, 
                        timePassed: this.isCountdown ? this.originalTime :
                            this.originalTime - this.time
                    });
                if(this.time <= 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                    this.reset();
                    this.finalFun();
                    return;
                }
                this.time -= this.frequency;
            }, this.frequency);
        }
    }
}

// time is in ms
// paused expects an array like: [paused, setPaused]
// reset expects an array like: [reset, setReset]
const Timer = ({time, isCountdown = false, paused, reset, finalFunction = ()=>undefined,
updateTime, className}) => {
    const [_time, set_Time] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [isPaused, setIsPaused] = useState(true);
    const [timerObj, setTimerObj] = useState(null);
    // const [timerObj, setTimerObj] = useState(null);
    
    useEffect(() => {
        if(timerObj === null) {
            // const resTimer = new TimerClass(time,10,isCountdown,set_Time,finalFunction);
            const setTime = ({displayTime, timePassed}) => {
                set_Time(displayTime);
                updateTime(timePassed);
            }
            setTimerObj(new TimerClass(time,10,isCountdown,setTime,finalFunction));
            setExpanded(true);
            // if(reset[0]) {
                // timerObj.reset();
            //     resTimer.reset();
            //     reset[1](false);
            //     paused[1](true);
            // } else if(paused[0] !== isPaused) {
            //     setIsPaused(paused[0]);
            //     resTimer.start();
            // }
            // setTimerObj(resTimer);
        } else if(time && time !== timerObj.originalTime) {
            timerObj.reset(time);
            setExpanded(true);
        } else if(reset[0]) {
            timerObj.reset();
            setExpanded(true);
            reset[1](false);
            paused[1](true);
        } else if(paused[0] !== isPaused) {
            setIsPaused(paused[0]);
            timerObj.start();
        }
        if(timerObj && isCountdown !== timerObj.isCountdown) {
            timerObj.isCountdown = isCountdown;
        }
    }, [set_Time, finalFunction, time, isCountdown, timerObj, reset, isPaused, paused, updateTime]);

    useEffect(() => {
        if(time !== null && timerObj !== null) {
            // setExpanded(true);
            // if(time !== timerObj.originalTime) {
            //     timerObj.reset(time);
            // }
            if(paused[0] !== isPaused) {
                
                if(isPaused) {
                    // setIsPaused(false);
                    // paused[1](false);
                    if(timerObj.started) {
                        timerObj.resume();
                    } else {
                        timerObj.start();
                    }
                } else {
                    // setIsPaused(true);
                    // paused[1](true);
                    timerObj.pause();
                }
                setIsPaused(paused[0]);
            }
        }
    }, [time, setExpanded, paused, isPaused, timerObj]);

    const pauseOrResumeTimer = () => {
        if(paused[0] === isPaused) return;
        if(isPaused) {
            setIsPaused(false);
            paused[1](false);
            if(timerObj.started) {
                timerObj.resume();
            } else {
                timerObj.start();
            }
        } else {
            setIsPaused(true);
            paused[1](true);
            timerObj.pause();
        }
    }
    const expandTimer = () => {
        setExpanded(true);
    }
    const collapseTimer = () => {
        setExpanded(false);
    }
    const resetTimer = () => {
        // set_Time(time ? time : 30000);
        setIsPaused(true);
        reset[1](true);
        paused[1](true);
        timerObj.pause();
        timerObj.reset();
    }

    // useEffect(() => {
    // if(timerObj) {
    //     if(time !== null && time !== timerObj.originalTime) {
    //         timerObj.reset(time);
    //     }
    //     if(timerObj !== null && paused !== timerObj.paused) {
    //         pauseOrResumeTimer();
    //     }
    // }
    // }, [paused, finalFunction, time, timerObj, setPaused]);

    // if(_time === null && time !== null) {
    //     set_Time(time);
    //     timerObj.reset(time);
    //     expandTimer();
    // }

    return (
        <div className={`Timer-Container ${className}`}>
            {/* {expanded === false ? */}
            <div className={`Timer-Icon ${expanded ? "Collapse" : ""} ${isPaused ? "" : "Active"}`} 
            onClick={expandTimer}>
                <i className="uil uil-clock"></i>
            </div>
            {/* : */}
            {/* expanded === true ? */}
            <div className={`Timer-Expand ${expanded ? "" : "Collapse"}`}>
                <div className="Timer-Collapse" onClick={collapseTimer}>
                    <i className="uil uil-angle-right-b"></i>
                </div>
                <div className="Timer-Time" onClick={pauseOrResumeTimer}>
                    <div className="Timer-Time-HMS">
                        <>
                        {isPaused ? 
                        <i className="uil uil-play-circle"></i>
                        :
                        <i className="uil uil-pause-circle"></i>
                        }
                        </>
                        <>
                        {_time ? _time.hours ? _time.hours + ":" : 
                        undefined : undefined}
                        {_time ? _time.minutes ? _time.minutes + ":" : 
                        undefined : undefined}
                        {_time ? _time.seconds ? _time.seconds : 
                        "0" : undefined}
                        <div className="Timer-Time-MS">
                            {_time ? _time.milliseconds ? _time.milliseconds : 
                            "00" : undefined}
                        </div>
                        </>
                    </div>
                </div>
                <div className="Timer-Reset" onClick={resetTimer}>
                    <i className="uil uil-refresh"></i>
                </div>
            </div>
            {/* : */}
            {/* undefined */}
            {/* } */}
        </div>
    )
}

export default Timer;
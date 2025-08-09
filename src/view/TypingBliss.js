import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import './TypingBliss.css';
import html2canvas from 'html2canvas';
// import Toolbar from '../component/Toolbar';
import TypingGame from '../component/TypingGame';
import { getSystemData, getData, updateData, setData, isLoggedIn, updateDashboardData } from '../api/Firebase';
import TypingBlissResult from '../component/TypingBlissResult';
import Toolbar from '../component/NewToolbar';
import Button from '../component/NewButton';
import Timer from '../component/Timer';
// import { useAuth } from '../auth/AuthContext';
// import { flushSync } from 'react-dom';

var _allWords = [];

const difficulties = [ "Easy", "Medium", "Hard", "Sentences", "Insane" ];
const modes = ["Timed", "Words", "Zen", "Custom", "Game"];
const settings = [
    ["30", "60", "120", "300"],
    ["10", "25", "50", "100"]
];
const modesWhereWeSeeTimer = ["timed", "words", "custom"];
const modesWhereTimerIsCountdown = ["timed"];

const Word = (props) => {
    var myClassName = "word " + props.overallStatus;
    if(props.hidden !== undefined) {
        if(props.hidden) return;
    }

    return (
        <div className={myClassName}>
            {props.word.split("").map((alphabet, i) => {
                var className = "alphabet " + props.status[i];
                if(props.index === props.wordIndex && i === props.alphabetIndex) {
                    className += " active";
                }
                if(alphabet === " ") return (<span className={className} key={i}>&nbsp;</span>)
                else return (<span className={className} key={i}>{alphabet}</span>)
            })}
        </div>
    )
};

const ZenWords = (props) => {
    if(props.words === undefined || props.words.length === 0) return;
    var activeWord = props.words[props.wordIndex].word;
    var activeBoxWidth = props.charWidth * activeWord.length;
    var beforeBoxWidth = (props.wordsWidth / 2) - (activeBoxWidth / 2);
    var afterBoxWidth = (props.wordsWidth / 2) - (activeBoxWidth / 2);
    var index = props.wordIndex - 4 < 0 ? 0 : props.wordIndex - 4;
    var beforeIndices = [];
    var afterIndices = [];
    // while(index < props.words.length) {
    const endIndex = Math.max(8, props.wordIndex + 4)
    while(index <= endIndex && index < props.words.length) {
        if(index < props.wordIndex) beforeIndices.push(index);
        else if(index > props.wordIndex) afterIndices.push(index);
        index++;
    }
    if(beforeIndices.length > 4) beforeIndices.splice(0,2);
    return (
        <div style={{width: props.wordsWidth, display: 'inline-flex'}}>
            <div style={{width: beforeBoxWidth, display: 'inline-flex', justifyContent: 'end', size: 10}}>
            {
                beforeIndices.map((i) => {
                    return(
                    <div className={`word ${props.words[i].overallStatus}`} key={i}>
                    {props.words[i].word.split("").map((alphabet, j) => {
                        var className = "alphabet zen-before " + props.words[i].status[j];
                        return (<span className={className} key={j}>{alphabet===" "?<span>&nbsp;&nbsp;</span>:alphabet}</span>)
                    })}
                    </div>
                    )
                })
            }
            </div>
            <div style={{width: activeBoxWidth}}>
            {
                <div className={`word ${props.words[props.wordIndex].overallStatus}`}>
                {props.words[props.wordIndex].word.split("").map((alphabet, i) => {
                    var className = "alphabet " + props.words[props.wordIndex].status[i];
                    if(props.alphabetIndex === i) className += " active";
                    return (<span className={className} key={i}>{alphabet}</span>)
                })}
                </div>
            }
            </div>
            <div style={{width: afterBoxWidth, display: 'inline-flex'}}>
            {
                afterIndices.map((i) => {
                    return(
                    <div className={`word ${props.words[i].overallStatus}`} key={i}>
                    {props.words[i].word.split("").map((alphabet, j) => {
                        var className = "alphabet zen-after " + props.words[i].status[j];
                        return (<span className={className} key={j}>{alphabet===" "?<span>&nbsp;&nbsp;</span>:alphabet}</span>)
                    })}
                    </div>
                    )
                })
            }
            </div>
        </div>
    )
};

const _RandomWords = (count, resolve, difficulty, customWords) => {
    if(_allWords.length === 0) {
        getSystemData("typing_bliss", "words").then(
            (response) => {
                return response[1];
                // return response.json();
            }
        ).then(
            (data) => {
                _allWords = data;
                resolve(_makeListOfRandomWords(data, count, difficulty));
            }
        ).catch(
            reason => {
                console.log(reason)
            }
        );
    } else {
        resolve(_makeListOfRandomWords(_allWords, count, difficulty, customWords));
    }
}

const _makeListOfRandomWords = (allWords, count, difficulty, customWords) => {
    let i = 0;
    var SelectedWords = [];
    var isInsane = difficulty === "insane";
    var allowedWords = allWords[difficulty];
    if(customWords) allowedWords = customWords;
    else if(isInsane) {
        allowedWords = [];
        Object.keys(allWords).forEach((diff) => {
            allowedWords = allowedWords.concat(allWords[diff]);
        });
    }
    
    while (count > 0) {
        const randomIndex = customWords ? (customWords.length - count) : 
                            Math.floor(Math.random() * allowedWords.length);
        let words = allowedWords[randomIndex];

        if(difficulty === "sentences") {
            words = words.split(" ");
        } else {
            words = [words];
        }
        for(let k = 0; k < words.length; k++) {
            if(difficulty !== "sentences" && count <= 0) break; 
            const word = words[k];
            SelectedWords.push({
                word: isInsane && !customWords ? _makeInsaneWord(word) : word,
                index: i++,
                status: Array(word.length).fill("neutral"),
                overallStatus: "neutral"
            });
            SelectedWords.push({
                word: " ",
                index: i++,
                status: ["neutral"],
                overallStatus: "neutral"
            });
            
            count -= 1;
        }
    }
    if(SelectedWords.length === 2) {
        var temp = SelectedWords[0];
        SelectedWords[0] = SelectedWords[1];
        SelectedWords[1] = temp;
    } else {
        SelectedWords.pop();
    }
    return SelectedWords;
}

const _ReloadWords = (resolve, reject, difficulty, count, customWords) => {
    const promise = new Promise((resolve) => {
        _RandomWords(count, resolve, difficulty, customWords);
    });
    promise.then((words) => {
        resolve(words);
    });
}

const _makeInsaneWord = (word) => {
    var insaneWord = "";
    var alphabets = "abcdefghijklmnopqrstuvwxyz";
    word.split("").forEach((char) => {
        var randomizer = Math.floor(Math.random() * 5);
        if(randomizer === 0) {
            insaneWord += alphabets.charAt(Math.floor(Math.random() * alphabets.length));
        } else {
            insaneWord += char;
        }
    });
    return insaneWord;
};

const _setLineNumber = (words, currentLineNumber, wordsRef, charWidth) => {
    if(words.length > 2) {
        var lineWidth = wordsRef.current.getBoundingClientRect().width;
        var currentWidth = 0;
        var lineNumber = 0;
        words.forEach((word, i) => {
            if(word.line + 1 < currentLineNumber) {
                lineNumber = word.line;
                return;
            }
            var wordWidth = charWidth * word.word.length;
            if(word.line !== undefined) {
                if(lineNumber === word.line) {
                    currentWidth += wordWidth;
                } else {
                    currentWidth = wordWidth;
                }
                lineNumber = word.line;
            } else {
                if(currentWidth + wordWidth > lineWidth) {
                    words[i].line = ++lineNumber;
                    currentWidth = wordWidth;
                } else {
                    words[i].line = lineNumber;
                    currentWidth += wordWidth;
                }
            }
            if(currentLineNumber + 1 >= Math.max(lineNumber, 2) || 
                (currentLineNumber === 0 && [0,1,2].includes(lineNumber))) {
                words[i].hidden = false;
            } else {
                words[i].hidden = true;
            }
        });
        return words;
    }
    return words;
};

const TypingBliss = ({showBusyIndicator}) => {
    var [selectedWords, setSelectedWords] = useState([]);
    var [wordIndex, setWordIndex] = useState(0);
    var [alphabetIndex, setAlphabetIndex] = useState(0);
    var [lineNumber, setLineNumber] = useState(0);
    var [topLineNumber, setTopLineNumber] = useState(0);
    var [inputString, setInputString] = useState("");
    var [difficulty, setDifficulty] = useState("easy");
    var [mode, setMode] = useState("timed");
    var [setting, setSetting] = useState("30");
    var [additionalWordCount, setAdditionalWordCount] = useState(0);
    // var [timer, setTimer] = useState(null);
    // var [timerTime, setTimerTime] = useState("00:30");
    // var [activityTimer, setActivityTimer] = useState(null);
    // var [activityTime, setActivityTime] = useState(0);
    var [zenWordUpdate, setZenWordUpdate] = useState(false);
    var [charWidth, setCharWidth] = useState(0);
    var [showResults, setShowResults] = useState(false);
    var [copiedSuccessfully, setCopiedSuccessfully] = useState(false);
    var [keyStrokes, setKeyStrokes] = useState(0);
    var [correctKeyStrokes, setCorrectKeyStrokes] = useState(0);
    var [result, setResult] = useState({wpm: 0, accuracy: 0, duration: 0});
    var [customWordsInput, setCustomWordsInput] = useState("");
    var [showCustomWordsSelector, setShowCustomWordsSelector] = useState(true);
    var [typingGame, setTypingGame] = useState(null);
    const [gameOverScreen, setGameOverScreen] = useState(-1);
    
    // 0 = no activity, 1 = activity going on, 2 = activity done, 3 = activity done with results
    var [activityStarted, setActivityStarted] = useState(0);
    const [activityTime, setActivityTime] = useState(0);

    var [keysAccuracy, setKeysAccuracy] = useState(null);

    const [expanded, setExpanded] = useState(null);
    const [overlayVisible, setOverlayVisible] = useState(null);
    const [highScores, setHighScores] = useState(null);
    let [timerPaused, setTimerPaused] = useState(true);
    let [timerReset, setTimerReset] = useState(false);
    const [timerTime, setTimerTime] = useState(0);

    // const navigate = useNavigate();

    var inputRef = useRef(null);
    var wordsRef = useRef(null);
    // var overlayRef = useRef(null);
    var charRef = useRef(null);
    var customWordsRef = useRef(null);
    var editCustomWordsRef = useRef(null);
    var footerRef = useRef(null);
    var gameInputRef = useRef(null);
    var gameCanvasRef = useRef(null);

    // useEffect(() => {
    //     if(!isLoggedIn()) {
    //         navigate("/");
    //     }
    // }, [navigate]);

    useEffect(() => {
        if(!isLoggedIn()) return;
        const loadFun = (flag) => {
        var promise = new Promise((resolve, reject) => {
            _ReloadWords(resolve, reject, "easy", 50);
            setWordIndex(0);
            setAlphabetIndex(0);
            setLineNumber(0);
            setTopLineNumber(0);
            setAdditionalWordCount(0);
            // setTimerTime("00:30");
            setTimerTime(30000);
            setMode("timed");
            setSetting("30");
            setActivityStarted(0);
            setActivityTime(0);
            setCopiedSuccessfully(false);
            setShowResults(false);
            setKeyStrokes(0);
            setCorrectKeyStrokes(0);
            // setTimer(null);
            setResult({wpm: 0, accuracy: 0, duration: 0, totalWords: 0, correctWords: 0});
            // setActivityTimer(null);
            // setActivityTime(0);
            setTypingGame(null);
            setExpanded(false);
            setOverlayVisible(false);
            // setTimerTime(0);
            setTimerPaused(true);
            inputRef.current.focus();
            if(flag === true) {
                showBusyIndicator(true);
                getData("typing_bliss.keys").then((data) => {
                    if(data[0]) {
                        setKeysAccuracy(data[1]);
                        showBusyIndicator(false);
                    } else {
                        const chars = "abcdefghijklmnopqrstuvwxyz";
                        var newData = {};
                        chars.split("").forEach((c) => {
                            newData[c] = [0,0];
                        });
                        updateData({"typing_bliss.keys": newData}).then(
                            ()=>{showBusyIndicator(false);}
                        );
                        setKeysAccuracy(newData);
                    }
                });
                getData("typing_bliss.highScores").then((data) => {
                    if(data[0]) {
                        setHighScores(data[1]);
                        showBusyIndicator(false);
                    } else {
                        const highScoreData = {
                            easy: [0,0,0,0,0],
                            medium: [0,0,0,0,0],
                            hard: [0,0,0,0,0]
                        }
                        updateData({"typing_bliss.highScores": highScoreData}).then(
                            ()=>{showBusyIndicator(false);}
                        );
                        setHighScores(highScoreData);
                    }
                })
            }
        });
        promise.then((words) => {
            // flushSync(() => setSelectedWords(words));
            // if(flag === true) {
            charRef.current.hidden = false;
            var charWidth = charRef.current.getBoundingClientRect().width;
            setCharWidth(charWidth);
            charRef.current.hidden = true;
            // }
            setSelectedWords([..._setLineNumber(words, 0, wordsRef, charWidth)]);
        });
        }
        loadFun(true);
        window.addEventListener("resize", loadFun);
        return (() => window.removeEventListener("resize", loadFun));
    }, [showBusyIndicator]);

    useEffect(() => {
        var words = [...selectedWords];
        if(topLineNumber + 1 < lineNumber) {
            words.forEach((word, i) => {
                if(word.line <= topLineNumber) {
                    words[i].hidden = true;
                } else if(word.line > topLineNumber + 3) {
                    words[i].hidden = true;
                } else {
                    words[i].hidden = false;
                }
            });
            setTopLineNumber(topLineNumber + 1);
            setSelectedWords(words);
        } else if(topLineNumber !== 0 && lineNumber === topLineNumber) {
            words.forEach((word, i) => {
                if(word.line < topLineNumber - 1) {
                    words[i].hidden = true;
                } else if(word.line >= topLineNumber + 2) {
                    words[i].hidden = true;
                } else {
                    words[i].hidden = false;
                }
            });
            setTopLineNumber(topLineNumber - 1);
            setSelectedWords(words);
        }
    }, [lineNumber, topLineNumber, selectedWords]);

    useEffect(() => {
        if(additionalWordCount < wordIndex && ["timed", "zen"].includes(mode)) {
            if(mode === "zen" && (zenWordUpdate || (wordIndex !== 6 && difficulty !== "sentences"))) return;
            var promise = new Promise((resolve, reject) => {
                _RandomWords(1, resolve, difficulty);
            });
            promise.then((word) => {
                if(difficulty === "sentences") {
                    word.unshift({
                        word: " ",
                        index: selectedWords.length,
                        status: ["neutral"],
                        overallStatus: "neutral"
                    });
                    word.forEach(w => {
                        w.index = selectedWords.length;
                        selectedWords.push(w);
                    });
                } else {
                    word[0].index = selectedWords.length;
                    selectedWords.push(word[0]);
                    word[1].index = selectedWords.length;
                    selectedWords.push(word[1]);
                }
                if(difficulty !== "sentences" && mode === "zen" && selectedWords.length === 11) {
                    selectedWords.splice(0, 2);
                    // setAdditionalWordCount(additionalWordCount - 2);
                    setWordIndex(wordIndex - 2);
                    selectedWords.forEach((word, i) => {
                        selectedWords[i].index = i;
                    });
                } 
                else if(difficulty === "sentences") {
                    setAdditionalWordCount(additionalWordCount + word.length);
                }
                else {
                    setAdditionalWordCount(additionalWordCount + 2);
                }
                var words;
                // flushSync(() => {
                    words = [...selectedWords];
                    setZenWordUpdate(true);
                // });
                charRef.current.hidden = false;
                var charWidth = charRef.current.getBoundingClientRect().width;
                setCharWidth(charWidth);
                charRef.current.hidden = true;
                setSelectedWords([..._setLineNumber(words, lineNumber, wordsRef, charWidth)]);
            });
        }
    }, [wordIndex, additionalWordCount, difficulty, selectedWords, lineNumber, mode, zenWordUpdate, charWidth]);

    /*
    useEffect(() => {
        var data;
        if(activityStarted === 2) {
            var totalWords, seconds, minutes;
            if(activityTimer !== null) {
                clearInterval(activityTimer);
                setActivityTimer(null);
                totalWords = keyStrokes / 5; // 5 is taken as a standard size of a word
                seconds = activityTime / 10;
                minutes = Math.floor(seconds / 60);
                if(minutes !== 0) result.duration = `${minutes}min ${(seconds - (minutes * 60)).toFixed(2)}sec`;
                else result.duration = `${seconds}sec`
                result.wpm = ((totalWords / seconds) * 60).toFixed(2);
                result.accuracy = ((correctKeyStrokes / keyStrokes) * 100).toFixed(2);
                selectedWords.forEach((word) => {
                    if(word.overallStatus === "neutral") return;
                    if(word.word === " ") return;
                    result.totalWords++;
                    if(word.overallStatus === "correct") result.correctWords++;
                });
                setActivityTime(0);
                setActivityStarted(3);
                setResult({...result});
                if(mode !== "custom") {
                    const uniqueKey = new Date().valueOf();
                    data = {};
                    data[`typing_bliss.results.${uniqueKey}`] = {
                        date: uniqueKey,
                        wpm: result.wpm,
                        keystrokes: keyStrokes,
                        wordsCount: result.totalWords, 
                        accuracy: result.accuracy, 
                        duration: activityTime, 
                        mode: mode, 
                        difficulty: difficulty, 
                        setting: setting,
                        correctKeyStrokes: correctKeyStrokes,
                        correctWords: result.correctWords
                    };
                    updateData(data);
                }
            } else if(keyStrokes !== 0 && mode === "timed") {
                // setTimer(null);
                totalWords = keyStrokes / 5; // 5 is taken as a standard size of a word
                seconds = parseInt(setting, 10);
                minutes = Math.floor(seconds / 60);
                if(minutes !== 0) result.duration = `${minutes}min ${(seconds - (minutes * 60)).toFixed(2)}sec`;
                else result.duration = `${seconds}sec`
                result.wpm = ((totalWords / seconds) * 60).toFixed(2);
                result.accuracy = ((correctKeyStrokes / keyStrokes) * 100).toFixed(2);
                selectedWords.forEach((word) => {
                    if(word.overallStatus === "neutral") return;
                    if(word.word === " ") return;
                    result.totalWords++;
                    if(word.overallStatus === "correct") result.correctWords++;
                });
                setActivityStarted(3);
                setResult({...result});
                if(mode !== "custom") {
                    const uniqueKey = new Date().valueOf();
                    data = {};
                    data[`typing_bliss.results.${uniqueKey}`] = {
                        date: uniqueKey,
                        wpm: result.wpm,
                        keystrokes: keyStrokes,
                        wordsCount: result.totalWords, 
                        accuracy: result.accuracy, 
                        duration: setting*10, 
                        mode: mode, 
                        difficulty: difficulty, 
                        setting: setting,
                        correctKeyStrokes: correctKeyStrokes,
                        correctWords: result.correctWords
                    };
                    updateData(data);
                }
            }
        }
    }, [activityStarted, activityTimer, activityTime, keyStrokes, correctKeyStrokes, result, selectedWords,
    setting, mode, difficulty]);
    */

    useEffect(() => {
        if(activityStarted === 2) {
            const totalWords = keyStrokes / 5; // 5 is taken as a standard size of a word
            const seconds = activityTime / 1000;
            const minutes = Math.floor(seconds / 60);
            if(minutes !== 0) result.duration = `${minutes}min ${(seconds - (minutes * 60)).toFixed(2)}sec`;
            else result.duration = `${seconds}sec`
            result.wpm = ((totalWords / seconds) * 60).toFixed(2);
            result.accuracy = ((correctKeyStrokes / keyStrokes) * 100).toFixed(2);
            selectedWords.forEach((word) => {
                if(word.overallStatus === "neutral") return;
                if(word.word === " ") return;
                result.totalWords++;
                if(word.overallStatus === "correct") result.correctWords++;
            });
                // setActivityTime(0);
                // setActivityStarted(3);
            setResult({...result});
            if(mode !== "custom") {
                const uniqueKey = new Date().valueOf();
                const data = {
                    date: uniqueKey,
                    wpm: parseFloat(result.wpm),
                    keystrokes: keyStrokes,
                    wordsCount: result.totalWords, 
                    accuracy: parseFloat(result.accuracy), 
                    duration: activityTime, 
                    mode: mode, 
                    difficulty: difficulty, 
                    setting: setting,
                    correctKeyStrokes: correctKeyStrokes,
                    correctWords: result.correctWords
                };
                setData("typing_bliss-results", data, uniqueKey.toString());

                updateData({"typing_bliss.keys": keysAccuracy});

                // updateDashboardData("typing_bliss", "result", data);
            }
            setActivityTime(0);
            setActivityStarted(3);
        }
    }, [activityStarted, activityTime, correctKeyStrokes, difficulty, 
        keyStrokes, mode, result, selectedWords, setting, keysAccuracy]);

    useEffect(() => {
        if(showCustomWordsSelector) {
            // overlayRef.current.hidden = true;
            setOverlayVisible(false);
            footerRef.current.hidden = false;
        }
    }, [showCustomWordsSelector]);

    const reloadWords = (newDifficulty, newMode, newSetting, customWords) => {
        if(newDifficulty) difficulty = newDifficulty;
        if(newMode) mode = newMode;
        if(newSetting) setting = newSetting;
        var totalWords = 0;
        if(mode === "zen") totalWords = 5;
        else if(mode === "timed") totalWords = 50;
        else if(mode === "words") totalWords = setting;
        else if(mode === "custom" && customWords) totalWords = customWords.length;
        // if(timer) clearInterval(timer);
        if(mode === "timed") {
            setTimerTime(parseInt(newSetting) * 1000);
        } else {
            setTimerTime(0);
        }
        var promise = new Promise((resolve, reject) => {
            _ReloadWords(resolve, reject, difficulty, totalWords, customWords);
            setWordIndex(0);
            setAlphabetIndex(0);
            setLineNumber(0);
            setTopLineNumber(0);
            setAdditionalWordCount(0);
            // setTimerTime(timerTime);
            timerPaused = true;
            timerReset = true;
            setTimerPaused(timerPaused);
            setTimerReset(timerReset);
            // startTimer();
            // if(timer) clearInterval(timer);
            // setTimer(null);
            setActivityStarted(0);
            setActivityTime(0);
            setCopiedSuccessfully(false);
            setShowResults(false);
            setKeyStrokes(0);
            setCorrectKeyStrokes(0);
            // if(activityTimer) clearInterval(activityTimer);
            // setActivityTimer(null);
            // setActivityTime(0);
            setResult({wpm: 0, accuracy: 0, duration: 0, totalWords: 0, correctWords: 0});
            setShowCustomWordsSelector(true);
            // inputRef.current.focus();
        });
        promise.then((words) => {
            // flushSync(() => setSelectedWords(words));
            if(mode === "words" && words.length > parseInt(setting) * 2 - 1) {
                words.splice(parseInt(setting) * 2 - 1, words.length);
            }
            charRef.current.hidden = false;
            var charWidth = charRef.current.getBoundingClientRect().width;
            setCharWidth(charWidth);
            charRef.current.hidden = true;
            setSelectedWords([..._setLineNumber(words, 0, wordsRef, charWidth)]);
        });
    };
    
    const onBackspacePress = (oEvent) => {
        if(oEvent.keyCode === 8) {
            setKeyStrokes(keyStrokes + 1);
            if(alphabetIndex === 0) {
                selectedWords[wordIndex].overallStatus = "neutral";
                if(wordIndex !== 0) {
                    var previousWordLength = selectedWords[wordIndex - 1].word.length;
                    if(mode === "zen") {
                        previousWordLength = selectedWords[wordIndex - 2].word.length;
                        selectedWords[wordIndex - 2].status[previousWordLength - 1] = "neutral";
                        selectedWords[wordIndex - 1].overallStatus = "neutral";
                        setAlphabetIndex(previousWordLength - 1);
                        setWordIndex(wordIndex - 2);
                    } else {
                        if(selectedWords[wordIndex - 1].status[previousWordLength - 1] !== "correct") {
                            setCorrectKeyStrokes(correctKeyStrokes + 1);
                        }
                        selectedWords[wordIndex - 1].status[previousWordLength - 1] = "neutral";
                        setAlphabetIndex(previousWordLength - 1);
                        setWordIndex(wordIndex - 1);
                        setLineNumber(selectedWords[wordIndex - 1].line);
                    }
                }
            } else {
                if(mode === "zen" && alphabetIndex === selectedWords[wordIndex].word.length - 1 &&
                    selectedWords[wordIndex].status[alphabetIndex] !== "neutral") {
                    selectedWords[wordIndex].status[alphabetIndex] = "neutral";
                } else {
                    if(selectedWords[wordIndex].status[alphabetIndex - 1] !== "correct") {
                        setCorrectKeyStrokes(correctKeyStrokes + 1);
                    }
                    selectedWords[wordIndex].status[alphabetIndex - 1] = "neutral";
                    setAlphabetIndex(alphabetIndex - 1);
                }
            }
            setSelectedWords([...selectedWords]);
        }
        else if(oEvent.keyCode === 27) {
            reloadWords();
        }
    }
    const userInput = (oEvent) => {
        if(selectedWords.length < wordIndex + 1) {
            return;
        }
        if(activityStarted === 0) {
            setActivityStarted(1);
            // if(mode === "timed") setTimer(startTimer(mode));
            // else setActivityTimer(startTimer(mode));
            startTimer();
        }
        if(activityStarted === 1 && timerPaused) {
            timerPaused = false;
            setTimerPaused(timerPaused);
        }
        setKeyStrokes(keyStrokes + 1);
        var sInput = oEvent.target.value;
        var sWord = selectedWords[wordIndex].word;
        if(sWord === " " && sInput !== " ") {
            return;
        } 
        if(sInput === " ") {
            if(sWord !== " ") {
                if(mode === "zen" && alphabetIndex === selectedWords[wordIndex].word.length - 1) {
                    selectedWords[wordIndex + 1].overallStatus = "correct";
                    selectedWords[wordIndex + 1].status[0] = "correct";
                    setCorrectKeyStrokes(correctKeyStrokes + 1);
                } else {
                    selectedWords[wordIndex].overallStatus = "wrong";
                }
                if(alphabetIndex !== 0 || selectedWords[wordIndex].status[0] !== "neutral") {
                    if(wordIndex + 1 === selectedWords.length) {
                        return;
                    }
                    setWordIndex(wordIndex + 2);
                    if(mode === "zen") setZenWordUpdate(false);
                    setAlphabetIndex(0);
                    setLineNumber(selectedWords[wordIndex + 2].line);
                    setSelectedWords([...selectedWords]);
                    return;
                }
            } else {
                selectedWords[wordIndex].status[alphabetIndex] = "correct";
                setCorrectKeyStrokes(correctKeyStrokes + 1);
                alphabetIndex += 1;
            }
            
        } 
        // for last character of last word (only possible in 'words' and 'custom' mode)
        else if(selectedWords.length === wordIndex + 1 && 
            alphabetIndex + 1 === selectedWords[wordIndex].word.length) {
            if(sWord.charAt(alphabetIndex) !== sInput) {
                selectedWords[wordIndex].status[alphabetIndex] = "wrong";
                selectedWords[wordIndex].overallStatus = "wrong";
                updateKeyAccuracy(sInput, false);
            } else {
                selectedWords[wordIndex].status[alphabetIndex] = "correct";
                selectedWords[wordIndex].overallStatus = "correct";
                setCorrectKeyStrokes(correctKeyStrokes + 1);
                updateKeyAccuracy(sInput, true);
            }
            endActivity();
        } else if(sWord.charAt(alphabetIndex) !== sInput) {
            selectedWords[wordIndex].status[alphabetIndex] = "wrong";
            alphabetIndex = alphabetIndex + 1;
            updateKeyAccuracy(sInput, false);
        } else {
            selectedWords[wordIndex].status[alphabetIndex] = "correct";
            alphabetIndex = alphabetIndex + 1;
            setCorrectKeyStrokes(correctKeyStrokes + 1);
            updateKeyAccuracy(sInput, true);
        }
        if(alphabetIndex === sWord.length) {
            var flag = true;
            selectedWords[wordIndex].status.forEach((status) => {
                if(status !== "correct") {
                    flag = false;
                }
            });
            if(flag) {
                selectedWords[wordIndex].overallStatus = "correct";
            } else {
                selectedWords[wordIndex].overallStatus = "wrong";
            }
            if(wordIndex + 1 === selectedWords.length) {
                setSelectedWords([...selectedWords]);
                return;
            }
            if(mode === "zen") {
                setZenWordUpdate(false);
                // setWordIndex(wordIndex + 2);
            } else {
                setAlphabetIndex(0);
                setWordIndex(wordIndex + 1);
                setLineNumber(selectedWords[wordIndex + 1].line);
            }
        } else {
            setAlphabetIndex(alphabetIndex);
        }
        setSelectedWords([...selectedWords]);
        setInputString("");
    }

    const difficultyToggle = (oEvent) => {
        if(oEvent.keyCode === undefined || oEvent.keyCode === 13) {
            var buttonText = oEvent.target.innerText;
            var newDifficulty = buttonText.toLowerCase();
            setDifficulty(newDifficulty);
            reloadWords(newDifficulty, mode, setting);
            if(mode === "game" && typingGame !== null) endGame();
        }
    };

    const modeToggle = (oEvent) => {
        if(oEvent.keyCode === undefined || oEvent.keyCode === 13) {
            var buttonText = oEvent.target.innerText;
            var newMode = buttonText.toLowerCase();
            var newSetting = 0;
            if(newMode === "zen") newSetting = 3;
            else if(newMode === "timed") newSetting = 30;
            else if(newMode === "words") newSetting = 10;
            else if(newMode === "game") {
                if(typingGame !== null) endGame();
            }
            setMode(newMode);
            setSetting(newSetting);
            if(buttonText.toLowerCase() === "timed") setSetting('30');
            else if(buttonText.toLowerCase() === "words") setSetting('10');
            else if(buttonText.toLowerCase() === "game") setSetting('easy');
            reloadWords(difficulty, newMode, newSetting);
        }
        // inputRef.current.focus();
    };

    const settingToggle = (oEvent) => {
        if(oEvent.keyCode === undefined || oEvent.keyCode === 13) {
            var buttonText = oEvent.target.innerText;
            var newSetting = buttonText;
            setSetting(buttonText);
            reloadWords(difficulty, mode, newSetting);
        }
        // inputRef.current.focus();
    };

    // const _startTimer = (mode) => {
    //     if(mode === "zen") return null;
    //     var id, count;
    //     if(mode === "timed") {
    //         id = setInterval(timerFunction, 1000);
    //         count = parseInt(setting, 10);
    //         function timerFunction() {
    //             if(count === 0) {
    //                 clearInterval(id);
    //                 endActivity();
    //             } else {
    //                 count -= 1;
    //                 var min = Math.floor(count/60);
    //                 var sec = count - Math.floor(count/60)*60;
    //                 setTimerTime(min.toString().padStart(2,"0")+":"+sec.toString().padStart(2,"0"));
    //             }
    //         }
    //     } else {
    //         id = setInterval(timerFunction, 100);
    //         count = 0;
    //         function timerFunction() {
    //             count++;
    //             setActivityTime(count);
    //         }
    //     }
    //     return id;
    // };

    // const showResult = (time) => {
        // let totalWords, seconds, minutes;
        // if(activityTimer !== null) {
        // clearInterval(activityTimer);
        // setActivityTimer(null);
        // const totalWords = keyStrokes / 5; // 5 is taken as a standard size of a word
        // const seconds = time / 1000;
        // const minutes = Math.floor(seconds / 60);
        // if(minutes !== 0) result.duration = `${minutes}min ${(seconds - (minutes * 60)).toFixed(2)}sec`;
        // else result.duration = `${seconds}sec`
        // result.wpm = ((totalWords / seconds) * 60).toFixed(2);
        // result.accuracy = ((correctKeyStrokes / keyStrokes) * 100).toFixed(2);
        // selectedWords.forEach((word) => {
        //     if(word.overallStatus === "neutral") return;
        //     if(word.word === " ") return;
        //     result.totalWords++;
        //     if(word.overallStatus === "correct") result.correctWords++;
        // });
        //     // setActivityTime(0);
        //     setActivityStarted(3);
        // setResult({...result});
        // if(mode !== "custom") {
        //     const uniqueKey = new Date().valueOf();
        //     const data = {};
        //     data[`typing_bliss.results.${uniqueKey}`] = {
        //         date: uniqueKey,
        //         wpm: result.wpm,
        //         keystrokes: keyStrokes,
        //         wordsCount: result.totalWords, 
        //         accuracy: result.accuracy, 
        //         duration: time, 
        //         mode: mode, 
        //         difficulty: difficulty, 
        //         setting: setting,
        //         correctKeyStrokes: correctKeyStrokes,
        //         correctWords: result.correctWords
        //     };
        //     updateData(data);
        // }
        /*
        // } else if(keyStrokes !== 0 && mode === "timed") {
            // setTimer(null);
            totalWords = keyStrokes / 5; // 5 is taken as a standard size of a word
            seconds = parseInt(setting, 10);
            minutes = Math.floor(seconds / 60);
            if(minutes !== 0) result.duration = `${minutes}min ${(seconds - (minutes * 60)).toFixed(2)}sec`;
            else result.duration = `${seconds}sec`
            result.wpm = ((totalWords / seconds) * 60).toFixed(2);
            result.accuracy = ((correctKeyStrokes / keyStrokes) * 100).toFixed(2);
            selectedWords.forEach((word) => {
                if(word.overallStatus === "neutral") return;
                if(word.word === " ") return;
                result.totalWords++;
                if(word.overallStatus === "correct") result.correctWords++;
            });
            setActivityStarted(3);
            setResult({...result});
            if(mode !== "custom") {
                const uniqueKey = new Date().valueOf();
                data = {};
                data[`typing_bliss.results.${uniqueKey}`] = {
                    date: uniqueKey,
                    wpm: result.wpm,
                    keystrokes: keyStrokes,
                    wordsCount: result.totalWords, 
                    accuracy: result.accuracy, 
                    duration: setting*10, 
                    mode: mode, 
                    difficulty: difficulty, 
                    setting: setting,
                    correctKeyStrokes: correctKeyStrokes,
                    correctWords: result.correctWords
                };
                updateData(data);
            }
        }
        */
    // };

    const endActivity = () => {
        showOverlay();
        setExpanded(true);
        inputRef.current.blur();
        setActivityStarted(2);
        // setActivityTime(time);
        setShowResults(true);
        // updateData({"typing_bliss.keys": keysAccuracy});
    };

    const startNewActivity = () => {
        setShowResults(false);
        reloadWords();
        setExpanded(false);
        inputRef.current.focus();
        // overlayRef.current.hidden = true;
        setOverlayVisible(false);
        // footerRef.current.hidden = false;
    };

    const startActivity = () => {
        setExpanded(false);
        inputRef.current.focus();
    };

    const showOverlay = (oEvent) => {
        if((oEvent && mode === "custom" && oEvent.relatedTarget === editCustomWordsRef.current) ||
            (mode === "custom" && showCustomWordsSelector) ||
            (mode === "game") ||
            showResults) return;
        // overlayRef.current.hidden = false;
        setOverlayVisible(true);
        if(footerRef.current) footerRef.current.hidden = true;
        // if(timer !== null) {
        //     clearInterval(timer);
        //     setTimer(null);
        // }
        setTimerPaused(true);

        setExpanded(true);
    };

    const hideOverlay = () => {
        if(showResults) return;
        // overlayRef.current.hidden = true;
        inputRef.current.focus();
        setOverlayVisible(false);
        footerRef.current.hidden = false;
        // setTimerPaused(false);

        setExpanded(false);
    }

    const takeScreenshot = () => {
        html2canvas(document.querySelector(".result-fragment")).then(canvas => {
            canvas.toBlob(function(blob) {
                navigator.clipboard
                    .write([
                    new ClipboardItem(
                        Object.defineProperty({}, blob.type, {
                            value: blob,
                            enumerable: true
                        })
                    )
                ]).then(function() {
                    setCopiedSuccessfully(true);
                });
            });
        });
    }

    const enterCustomWords = (key) => {
        if(key.keyCode === undefined || key.keyCode === 13) {
            var words = customWordsRef.current.value;
            setCustomWordsInput(words);
            words = words.replaceAll("\n"," ").split(" ").filter((w) => (w.length !==  0));
            if(words.length <= 1) return;
            reloadWords(undefined, undefined, undefined, words);
            inputRef.current.focus();
            setExpanded(false);
            setShowCustomWordsSelector(false);
        }
    }

    const editCustomWords = (key) => {
        if(key.keyCode === undefined || key.keyCode === 13) {
            setShowCustomWordsSelector(true);
        }
    }

    const initializeGame = (words) => {
        typingGame = new TypingGame(
            gameInputRef.current, 
            gameCanvasRef.current, 
            words, 
            endGame,
            setting);
        
        gameInputRef.current.addEventListener("blur", () => {
            if(gameInputRef.current && typingGame !== null && !typingGame.game.gameOver) {
                setExpanded(false);
                gameInputRef.current.focus();
            }
        });
        gameInputRef.current.addEventListener("keydown", (oEvent) => {
            if(oEvent.code === "ArrowLeft" || oEvent.code === "ArrowRight") oEvent.preventDefault();
        });

        typingGame.startGame();
        setTypingGame(typingGame);
    };

    const startGame = () => {
        setTypingGame(true);
        setExpanded(false);
        fullScreen(true);
        var promise = new Promise((resolve, reject) => {
            _ReloadWords(resolve, reject, difficulty, 100);
        });
        promise.then((words) => {
            const newWords = [];
            words.forEach((word) => {
                if(word.word !== " ") newWords.push(word.word);
            });
            initializeGame(newWords);
        });
    };

    const endGame = (flag) => {
        if(flag !== true) typingGame.endGame();
        if(gameInputRef.current) {
            gameInputRef.current.blur();
        }
        if(typingGame !== null) {
            setGameOverScreen(typingGame.game.score);
            highScores[setting.toLowerCase()].push(typingGame.game.score);
            highScores[setting.toLowerCase()].sort((a,b) => a-b).reverse().pop();
            updateData({"typing_bliss.highScores": highScores});
            setHighScores(highScores);
        }
        setTypingGame(null);
        setExpanded(true);
        fullScreen(false);
    };

    const gameInputKeydown = (oEvent) => {
        if(!oEvent) endGame();
        if(oEvent.code === "Escape") {
            if(typingGame === null) {
                startGame();
            } else if(typingGame.game.gameOver) {
                typingGame.restart();
            } else {
                typingGame.game.pause = !typingGame.game.pause;
                setTypingGame({...typingGame});
            }
        }
    };

    const pauseGame = () => {
        if(typingGame === null) {
            startGame();
        } else if(typingGame.game.gameOver) {
            typingGame.restart();
        } else {
            typingGame.game.pause = !typingGame.game.pause;
            setTypingGame({...typingGame});
        }
    };

    const gameInput = () => {
        if(typingGame === null || typingGame.game.gameOver) return;
        let text = gameInputRef.current.value;
        if(text.charAt(text.length - 1) === " ") {
            if(typingGame.game.asteroids.length > 0 && 
                typingGame.game.ship.text === typingGame.game.asteroids[0].text) {
                typingGame.game.asteroids[0].destroy = true;
                const audio = new Audio("./lib/pew-pew.mp3");
                audio.volume = 0.1;
                audio.play();
                typingGame.game.score++;
            }
            text = "";
            gameInputRef.current.value = "";
        }
        typingGame.game.ship.text = text;
    };

    const updateKeyAccuracy = (char, corr) => {
        if(!keysAccuracy[char]) {
            return;
        }
        keysAccuracy[char][0]++;
        if(!corr) {
            keysAccuracy[char][1]++;
        }
        setKeysAccuracy({...keysAccuracy});
    };

    const goHome = () => {
        // navigate("/");
    };

    const startTimer = () => {
        if(modesWhereWeSeeTimer.includes(mode)) {
            if(modesWhereTimerIsCountdown.includes(mode)) {
                setTimerTime(parseInt(setting,10)*1000);
            } else {
                setTimerTime(3600000);
            }
            if(activityStarted === 1) {
                timerPaused = true;
            } else {
                timerPaused = false;
            }
            setTimerPaused(timerPaused);
        }
    };

    const pauseTimer = (bool) => {
        if(bool === timerPaused) return;
        timerPaused = bool;
        setTimerPaused(timerPaused);
        // if(bool) {
        //     showOverlay();
        // } else {
        //     hideOverlay();
        // }
    };

    const resetTimer = (bool) => {
        if(bool === timerReset) return;
        if(bool) {
            timerPaused = true;
            setTimerPaused(timerPaused);
            reloadWords();
        }
        timerReset = bool;
        setTimerReset(timerReset);
    };

    const fullScreen = (flag) => {
        const elem = document.querySelector(".game-board");
        if(flag && !elem.className.split(" ").includes("full-screen")) {
            elem.className += " full-screen";
        }
        if(!flag && elem.className.split(" ").includes("full-screen")) {
            let className = "";
            elem.className.split(" ").forEach(cl => {
                if(cl !== "full-screen") className += cl;
            });
            elem.className = className;
        }
    };

    const closeGameScore = () => {
        setGameOverScreen(-1);
    };

    return (
        <div className="typing-bliss-main">
            <div className="header">
            <div className="header-title">
                <div onClick={goHome} className="header-home">ultimate_utility</div>
                &nbsp;&gt;&nbsp;
                typing_bliss
            </div>
            <div className="tool-bar">
                {["custom"].includes(mode) ? 
                undefined : (
                    // <Toolbar 
                    //     toolbar_elements={difficulties}
                    //     selected_element={difficulty}
                    //     onClick_element={difficultyToggle}
                    //     type="singleSelect"
                    //     color={{backgroundColor: "yellow", textColor: "black"}}/>
                    <Toolbar 
                    expand={[expanded, setExpanded]} 
                    title="Difficulty" 
                    options={difficulties}
                    selected={difficulty}
                    onPress={difficultyToggle}
                    className="TypingBliss-Toolbar"/>
                )}
                {/* <Toolbar
                    toolbar_elements={modes}
                    selected_element={mode}
                    onClick_element={modeToggle}
                    type="singleSelect"
                    color={{backgroundColor: "yellow", textColor: "black"}}/> */}
                <Toolbar
                    expand={[expanded, setExpanded]}
                    title="Mode"
                    options={modes}
                    selected={mode}
                    onPress={modeToggle}
                    className="TypingBliss-Toolbar"/>
                {
                    mode === "timed" ? (
                        // <Toolbar
                        //     toolbar_elements={settings[0]}
                        //     selected_element={setting}
                        //     onClick_element={settingToggle}
                        //     type="singleSelect"
                        //     color={{backgroundColor: "yellow", textColor: "black"}}/>
                        <Toolbar
                            expand={[expanded, setExpanded]}
                            title="Time"
                            options={settings[0]}
                            selected={setting}
                            onPress={settingToggle}
                            className="TypingBliss-Toolbar"/>
                    ) : mode === "words" ? (
                        // <Toolbar
                        //     toolbar_elements={settings[1]}
                        //     selected_element={setting}
                        //     onClick_element={settingToggle}
                        //     type="singleSelect"
                        //     color={{backgroundColor: "yellow", textColor: "black"}}/>
                        <Toolbar
                            expand={[expanded, setExpanded]}
                            title="Words count"
                            options={settings[1]}
                            selected={setting}
                            onPress={settingToggle}
                            className="TypingBliss-Toolbar"/>
                    ) : mode === "game" ? (
                        <Toolbar
                            expand={[expanded, setExpanded]}
                            options={["Easy","Medium","Hard"]}
                            title="Game Difficulty"
                            selected={setting}
                            onPress={settingToggle}
                            className="TypingBliss-Toolbar"/>
                    ) : undefined
                }
            </div>
            </div>
            <div className="content">
            <span className='alphabet hide' hidden ref={charRef}>D</span>
            <div className="words-area">
                <div className={`words-box ${mode === "zen" ? "words-box-zen" : ""}`} ref={wordsRef}>
                    {
                        mode === "zen" ? 
                            <ZenWords key="_" words={selectedWords} wordIndex={wordIndex} 
                                alphabetIndex={alphabetIndex} charWidth={charWidth} wordsRef={wordsRef}
                                wordsWidth={wordsRef.current.getBoundingClientRect().width}/>
                        :
                        mode === "custom" ?
                            showCustomWordsSelector ?
                                <div className="custom-words-selector">
                                    <textarea className="custom-words-input" ref={customWordsRef}
                                        placeholder="Please enter your words here..."
                                        defaultValue={customWordsInput} maxLength={10000}/>
                                    <div className="custom-words-enter" onKeyDown={enterCustomWords} 
                                        tabIndex={0} onClick={enterCustomWords}>
                                        Confirm
                                    </div>
                                </div>
                            :
                            <div className="custom-words-selector">
                                <div className="custom-words-words">
                                {selectedWords.map((word) => {
                                    return (
                                        <Word key={word.index} status={word.status} word={word.word} 
                                            wordIndex={wordIndex} alphabetIndex={alphabetIndex} 
                                            index={word.index} overallStatus={word.overallStatus}
                                            hidden={word.hidden}/>
                                    )
                                })}
                                </div>
                                <div className="custom-words-edit" onKeyDown={editCustomWords} 
                                    tabIndex={0} ref={editCustomWordsRef} onClick={editCustomWords}>
                                    Edit Words
                                </div>
                            </div>
                        :
                        mode === "game" ? 
                            <div className="game-board">
                                {gameOverScreen !== -1 ?
                                <div className="game-curr-score">
                                    <div className="game-curr-score-board">
                                        <div>You Scored</div>
                                        <span className="game-curr-score-num">{gameOverScreen}</span>
                                        <Button text="OK" press={closeGameScore} className="TypingBliss-Button"/>
                                    </div>
                                </div>
                                : undefined}
                                <canvas ref={gameCanvasRef} 
                                    className={typingGame === null ? "game-game-hidden" : "game-game"}>
                                </canvas>
                                <input ref={gameInputRef} className="game-input" onKeyDown={gameInputKeydown} onInput={gameInput}></input>
                                {typingGame === null ?
                                <div className="game-preview">
                                <div className="game-score">
                                    High Scores:
                                    {highScores && ["Easy","Medium","Hard"].map((gameDifficulty, i) => {
                                        return (<div key={i} className="game-score-heading">
                                            {gameDifficulty}
                                            <div style={{display: "flex"}}>
                                            {highScores[gameDifficulty.toLowerCase()].map((score, j) => {
                                                return <div key={j} className="game-score-score">{score}</div>
                                            })}
                                            </div>
                                        </div>)
                                    })}
                                </div>
                                <div className="game-buttons">
                                <Button press={startGame} text="Start New Game" className="TypingBliss-Button"/>
                                </div>
                                </div>
                                :
                                <div className="game-buttons">
                                {/* <div onClick={endGame} className="game-button">End game</div> */}
                                <Button press={endGame} text="End Game" className="TypingBliss-Button"/>
                                <Button press={pauseGame} text={typingGame && typingGame.game && 
                                    typingGame.game.pause ? "Resume" : "Pause"} className="TypingBliss-Button"/>
                                {/* <Button press={fullScreen} text="Full Screen"/> */}
                                </div>
                                }
                            </div>
                        :
                        selectedWords.map((word) => {
                            return (
                                <Word key={word.index} status={word.status} word={word.word} 
                                    wordIndex={wordIndex} alphabetIndex={alphabetIndex} 
                                    index={word.index} overallStatus={word.overallStatus}
                                    hidden={word.hidden}/>
                            )
                        })
                    }
                </div>
                {overlayVisible && mode !== "game" ? 
                <div className="words-overlay" onClick={startActivity}>
                    <span className="words-overlay-text">click here to start typing...</span>
                </div>
                :
                undefined
                }
                <div className="input-box">
                    <input className="words-input" ref={inputRef} onChange={userInput} 
                        onBlur={showOverlay} onFocus={hideOverlay}
                        onKeyDown={onBackspacePress} value={inputString}></input>
                </div>
            </div>
            {/* {mode !== "timed"?
            <div/>:
            <div className="timer" hidden={mode !== "timed"}>
                <span className="timer-time">{timerTime}</span>
            </div>} */}
            {modesWhereWeSeeTimer.includes(mode) ?
            mode === "custom" && showCustomWordsSelector ?
            undefined
            :
            <Timer 
                time={timerTime} 
                updateTime={setActivityTime}
                paused={[timerPaused,pauseTimer]} 
                reset={[timerReset,resetTimer]} 
                finalFunction={endActivity}
                isCountdown={modesWhereTimerIsCountdown.includes(mode)}
                className="TypingBliss-Timer"/>
            :
            undefined
            }
            {showResults?
            <div className="result">
                <div className="result-body">
                    <TypingBlissResult 
                        result={result} keyStrokes={keyStrokes} correctKeyStrokes={correctKeyStrokes}
                        difficulty={difficulty} mode={mode} setting={setting} className="result-fragment"/>
                <div className="result-footer">
                    <Button 
                    press={startNewActivity}
                    text="Start new"
                    className="TypingBliss-Button"/>
                    {copiedSuccessfully ?
                        <Button 
                        enabled="no"
                        icon={<i className="uil uil-check-circle"/>}
                        text="Copied successfully"
                        className=""/>
                        :
                        <Button
                        press={takeScreenshot}
                        icon={<i className="uil uil-capture"/>}
                        text="Screenshot"
                        className="TypingBliss-Button"/>
                    }
                </div>
                </div>
            </div>:
            <div/>}
            </div>
            {showResults?
            <></>:
            <div className="footer" ref={footerRef}>
                <div className="footer-text">{["custom","game"].includes(mode) && showCustomWordsSelector ? 
                    "" : "Press [esc] to reload words"}</div>
                {mode === "custom" && !showCustomWordsSelector ?
                    <div className="footer-text">Press [shift] + [tab] & [enter] to edit custom words</div>
                    :
                    undefined
                }
            </div>
            }
        </div>
    )
}

export default TypingBliss;
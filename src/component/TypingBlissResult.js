import "./TypingBlissResult.css";

// result is an object with properties: wpm, totalWords, correctWords, accuracy, duration
function TypingBlissResult({result, keyStrokes, correctKeyStrokes, difficulty, mode, setting}) {
    return (
        <div className="result-fragment">
            <div className="result-fragment-title">typing_bliss</div>
            <div className="result-fragment-result">
                <div className="wpm">
                    <div className="wpm-wpm">{result.wpm}</div>
                    <div className="wpm-short">WPM</div>
                    <div className="wpm-long">(Words Per Minute)</div>
                </div>
                <div className="keystrokes">
                    Keystrokes: 
                    <div className="result-fragment-value">
                        {keyStrokes}
                        <div className="result-fragment-subvalue">
                            (<span className="result-fragment-subvalue-correct">
                                {correctKeyStrokes}</span>/
                            <span className="result-fragment-subvalue-wrong">
                                {keyStrokes-correctKeyStrokes}</span>
                            )
                        </div>
                    </div>
                </div>
                <div className="wordstyped">
                    Words Typed: 
                    <div className="result-fragment-value">
                        {result.totalWords}
                        <div className="result-fragment-subvalue">
                            (<span className="result-fragment-subvalue-correct">
                                {result.correctWords}</span>/
                            <span className="result-fragment-subvalue-wrong">
                                {result.totalWords - result.correctWords}</span>
                            )
                        </div>
                    </div>
                </div>
                <div className="accuracy">
                    Accuracy: 
                    <div className="result-fragment-value">{result.accuracy}%</div>
                </div>
                <div className="duration">
                    Duration:
                    <div className="result-fragment-value">{result.duration}</div>
                </div>
            </div>
            <div className="result-fragment-activity">
                Activity:&nbsp;&nbsp;
                <b>{difficulty}</b>&nbsp;&nbsp;
                <b>{mode}</b>&nbsp;
                {mode!=="custom"?`(${setting}${mode==="timed"?"sec":" words"})`:""}
            </div>
        </div>
    )
}

export default TypingBlissResult;
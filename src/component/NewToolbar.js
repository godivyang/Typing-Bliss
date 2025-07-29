import "./NewToolbar.css";

const capitalize = (str) => {
    if(typeof(str) === "object") {
        let retStr = "";
        str.forEach(s => retStr += s[0].toUpperCase() + s.substring(1) + ", ");
        return retStr.substring(0, retStr.length - 2);
    } else if(typeof(str) === "string") {
        if(str.length !== 0) {
            return str[0].toUpperCase() + str.substring(1);
        }
    }
}

// expand is an array having two values: expanded, setExpanded
const Toolbar = ({expand, options, title, selected, onPress, mode, className}) => {
    const expandToolbar = () => {
        expand[1](true);
    }
    if(mode === "MultiSelect") {
        selected = selected.map((item) => item.toLowerCase());
    }
    return (
    <div
    className={`${className ? className : ""} NewToolbar-Container`}
    onClick={expandToolbar}>
        <div className="NewToolbar-Title">
            {`${title} ${!expand[0] ? ": " + capitalize(selected) : ""}`}
        </div>
        {
        expand[0] ?
        <div className="NewToolbar-Options">
            {mode === "MultiSelect" ?
            options.map((option, i) => {
                let _className = "NewToolbar-Option";
                if(selected.includes(option.toLowerCase())) {
                    _className += " selected";
                }
                return (
                <div className={_className} onClick={onPress} key={i} 
                    tabIndex={0} onKeyDown={onPress}>
                    {option}
                </div>)
            })
            :
            options.map((option, i) => {
                let _className = "NewToolbar-Option";
                if(selected.toLowerCase() === option.toLowerCase()) {
                    _className += " selected";
                }
                return (
                <div className={_className} onClick={onPress} key={i} 
                    tabIndex={0} onKeyDown={onPress}>
                    {option}
                </div>)
            })}
        </div>
        :
        undefined
        }
    </div>
  )
}

export default Toolbar;
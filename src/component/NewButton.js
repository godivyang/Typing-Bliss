import { useRef } from "react";
import "./NewButton.css";

const animationClass = "NewButton-RippleEffect-Animation";
let animationTimeout = null;

// type: default / simple / minimal
// enabled: yes / no
const Button = ({ text, press = () => {}, icon, enabled = "yes", type = "default", className }) => {
    const ripple = useRef(null);

    const onButtonClick = (oEvent) => {
        if(enabled && enabled === "no") {
            return;
        }
        if(animationTimeout) {
            ripple.current.classList.toggle(animationClass, false);
            clearTimeout(animationTimeout);
            animationTimeout = null;
        }
        const x = oEvent.clientX - oEvent.currentTarget.offsetLeft;
        const y = oEvent.clientY - oEvent.currentTarget.offsetTop;
        ripple.current.style.left = `${x}px`;
        ripple.current.style.top = `${y}px`;
        ripple.current.classList.toggle(animationClass, true);
    
        animationTimeout = setTimeout(() => {
            if(ripple.current) {
                ripple.current.classList.toggle(animationClass, false);
                animationTimeout = null;
            }
        }, 500);

        press();
    }

    const onButtonClickThroughKeyboard = (oEvent) => {
        // key code 13 is for Enter key
        if(oEvent.keyCode === 13) {
            onButtonClick(oEvent);
        }
    }

    return (
        <div className={`${className ? className : ""}`}>
        <div 
        className={`${className ? className : ""} NewButton-Button`} 
        onClick={onButtonClick} 
        type={type}
        enabled={enabled}
        tabIndex={enabled === "yes" ? 0 : -1}
        onKeyDown={onButtonClickThroughKeyboard}>
            {icon ? icon : undefined}
            {icon && text ? <>&nbsp;</> : undefined}
            <div className="NewButton-Text">{text}</div>
            <span className="NewButton-RippleEffect" ref={ripple}></span>
        </div>
        </div>
    )
}

export default Button;
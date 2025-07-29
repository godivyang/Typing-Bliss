import "./Button.css";

const Button = ({ text, backgroundColor, color, size, icon, padding, onClick }) => {
    
    const style = {
        backgroundColor: backgroundColor ? backgroundColor : "Black",
        color: color ? color : "White",
        fontSize: size ? size : "Medium",
        padding: padding ? padding : "2%"
    }
    
    return (
        <div className="Custom-Button" style={style} onClick={onClick}>
            {icon ? icon : undefined}
            {icon && text ? <>&nbsp;</> : undefined}
            {text}
        </div>
    )
}

export default Button;
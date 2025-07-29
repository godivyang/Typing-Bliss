import './Toolbar.css';

function Toolbar({toolbar_elements, selected_element, onClick_element, type, color}) {
    document.documentElement.style.setProperty('--toolbar-backgroundColor', color.backgroundColor);
    document.documentElement.style.setProperty('--toolbar-textColor', color.textColor);
    return (
    <div className="Toolbar_Container">
        {
        toolbar_elements.map((element, i) => {
            let className = "Toolbar_Element";
            if(i === 0) 
                className += " Toolbar_Element_Start";
            if(i + 1 === toolbar_elements.length) 
                className += " Toolbar_Element_End";
            if(type === "singleSelect") {
                if(selected_element === element.toLowerCase())
                    className += " Toolbar_Selected";
            } else {
                if(selected_element.includes(element.toLowerCase()))
                    className += " Toolbar_Selected";
            }
            return (<div 
                    className={className} 
                    key={"Toolbar-Element-"+i}
                    onClick={onClick_element}>
                        {element}
                    </div>)
        })
        }
    </div>
  );
}

export default Toolbar;
import { useState, useEffect } from 'react';
import './CustomForm.css';

/*
configs is an array of different entries in the form
properties:
    label
    input type
        simple input
        number
        date
        text area
        tags (scroll horizontally / all visible) (color random / same color for all tags)
        special input for amount
    buttons
        text
        onclick function
    switch
        title

*/

function CustomForm({uniqueId, title, configurations, formSubmitFunction}) {
    var [configs, setConfigs] = useState(configurations);
    var [validated, setValidated] = useState(false);

    useEffect(() => {
        var flag = true;
        configs.forEach((component) => {
            if(component.type === "buttonGroup") {
                if(component.mandatory && component.selected === null) {
                    flag = false;
                }
            } else if(component.type === "date") {
                if(component.mandatory && isNaN(new Date(component.selected))) {
                    flag = false;
                }
            } else if(component.type === "amount") {
                if(component.mandatory && (!component.value || parseFloat(component.value) === 0)) {
                    flag = false;
                }
            } else if(component.type === "tags") {
                if(component.mandatory && component.selected === null) {
                    flag = false;
                }
            }
        });
        setValidated(flag);
    }, [configs, validated]);

    const formSubmitted = () => {
        var submitForm = {};
        configs.forEach((component) => {
            if(["buttonGroup", "date", "tags", "switch"].includes(component.type)) {
                submitForm[component.label] = component.selected;
            } else if(["amount", "textArea"].includes(component.type)) {
                if(component.type === "amount") submitForm[component.label] = parseFloat(component.value);
                else submitForm[component.label] = component.value;
            }
        });
        if(configs[0].selected.toLowerCase() === "income") {
            delete submitForm.wantNeedInvestment;
        }
        submitForm.uniqueId = uniqueId;
        formSubmitFunction(submitForm);
    };

    return (
        <div className="CF_container">
            {uniqueId ?
                <div className="CF_uniqueId">
                    <span className="CF_uniqueId_text">{uniqueId}</span>
                </div>
                :
                <div/>
            }
            {title ?
                <div className="CF_title">
                    <span className="CF_title_text">{title}</span>
                </div>
                :
                <div/>
            }
            {configs ?
                configs.map((component, i) => {
                    if(component.type === "buttonGroup") {
                        if(component.invisible 
                            && !component.invisible.includes(configs[0].selected.toLowerCase())) {
                                return (<div key={i}/>);
                            }
                        var widths = 100 / component.buttonTexts.length;
                        return (
                            <div className="CF_buttonGroup" key={i}>
                                {component.buttonTexts.map((text, j) => {
                                    var selectedClass = component.selected === text ? "selected" : "";
                                    return <div className={"CF_buttonGroup_button "+selectedClass} 
                                        style={{width: widths+"%"}} 
                                        key={j}
                                        onClick={()=>{
                                            configs[i].selected = text;
                                            setConfigs([...configs]);
                                        }}>{text}</div>
                                })}
                            </div>
                        )
                    } 
                    else if(component.type === "date") {
                        return (
                            <div className="CF_date" key={i}>
                                <span className="CF_date_label">{component.label}</span>
                                <input className="CF_date_input" type="date" value={component.selected}
                                    onChange={(oEvent) => {
                                        var date = new Date(oEvent.target.value);
                                        configs[i].selected = 
                                        `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
                                        setConfigs([...configs]);
                                    }}/>
                            </div>
                        )
                    }
                    else if(component.type === "amount") {
                        var amountWidth = 90 / component.amounts.length;
                        return (
                            <div className="CF_amount" key={i}>
                                <span className="CF_label">{component.label}</span>
                                <div style={{display: 'flex', marginLeft: '5%'}}>
                                    <input className="CF_amount_input" type="number" 
                                        value={component.value} step="0.01" 
                                        onChange={(oEvent)=>{
                                            configs[i].value = oEvent.target.innerHTML + oEvent.target.value;
                                            setConfigs([...configs]);
                                        }} min={0}/>
                                    <div className="CF_amount_reset" onClick={() => {
                                        configs[i].value = 0.00;
                                        setConfigs([...configs]);
                                    }}>Reset</div>
                                </div>
                                <div style={{display: 'inline-flex', marginTop: '10px'}}>
                                    {component.amounts.map((amo, index) => {
                                        return <span style={{width: amountWidth+"%"}}
                                            onClick={(oEvent) => {
                                                configs[i].value = (parseFloat(configs[i].value) + 
                                                parseFloat(oEvent.target.innerHTML, 10)).toFixed(2);
                                                setConfigs([...configs]);
                                            }}
                                            className="CF_amount_amounts" key={index}>+{amo}</span>
                                    })
                                    }
                                </div>
                            </div>
                        )
                    }
                    else if(component.type === "tags") {
                        var tags = [];
                        if(!Array.isArray(component.tags)) {
                            tags = component.tags[configs[0].selected.toLowerCase()];
                        } else {
                            tags = component.tags;
                        }
                        tags.sort();
                        if(tags.length === 0) return (<div key={i}/>);
                        return (
                            <div className="CF_tags" key={i}>
                                <span className="CF_label">{component.label}</span>
                                <div className="CF_tags_tags">
                                    {tags.map((tag, index) => {
                                        var className = "CF_tag";
                                        if(component.selected === tag) {
                                            className += " selected";
                                        }
                                        return <span onClick={(oEvent) => {
                                                if(oEvent.target.innerHTML === configs[i].selected) {
                                                    configs[i].selected = null;
                                                } else {
                                                    configs[i].selected = oEvent.target.innerHTML;
                                                }
                                                setConfigs([...configs]);
                                            }}
                                            className={className} key={index}>{tag}</span>
                                    })
                                    }
                                </div>
                            </div>
                        )
                    }
                    else if(component.type === "switch") {
                        return (
                            <div className="CF_switch" key={i}>
                                <span className="CF_switch_label">{component.label}</span>
                                <div className="CF_switch_switch">
                                    {component.options.map((switchText, index) => {
                                        var className = "CF_switch_option";
                                        if(component.selected === switchText) {
                                            className += " selected";
                                        }
                                        return <span onClick={(oEvent) => {
                                                configs[i].selected = oEvent.target.innerHTML;
                                                setConfigs([...configs]);
                                            }}
                                            className={className} key={index}>{switchText}</span>
                                    })
                                    }
                                </div>
                            </div>
                        )
                    }
                    else if(component.type === "textArea") {
                        return (
                            <div key={i}>
                                <span className="CF_label">{component.label}</span>
                                <textarea value={component.value} className="CF_textArea" rows={4}
                                    onChange={(oEvent) => {
                                        configs[i].value = oEvent.target.value;
                                        setConfigs([...configs]);
                                    }}/>
                            </div>
                        )
                    }
                    else {
                        return <div key={i}/>
                    }
                })
                :
                <div/>
            }
            <div className="CF_footer">
                <div className={validated ? "CF_footer_button active_button" : "CF_footer_button"}
                    onClick={validated ? formSubmitted : null}>
                    Submit
                </div>
            </div>
        </div>
    );
}

export default CustomForm;
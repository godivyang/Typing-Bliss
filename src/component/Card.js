import { useRef } from 'react';
import './Card.css';
import {Link} from 'react-router-dom';

function Card({title, description, link, color}) {
  const card = useRef(null);
  if(card.current) {
    card.current.addEventListener("mouseenter", (oEvent)=>{
        const circle = oEvent.srcElement.children[0];
        circle.style.width = "220px";
        circle.style.height = "170px";
        circle.style.borderRadius = "10px";
    });
    card.current.addEventListener("mouseleave", (oEvent)=>{
      const circle = oEvent.srcElement.children[0];
        circle.style.width = "40px";
        circle.style.height = "40px";
        circle.style.borderRadius = "0px 0px 0px 150%";
    });
  }

  return (
    <Link to={link} className="Card-Container" ref={card}>
        <span className="Card-Circle" 
        style={{background: color}}></span>
        <div className="Card-Title">{title}</div>
        <div className="Card-Description">
          {description}
        </div>
    </Link>
  );
}

export default Card;
import React from "react";
import "../styles/slider-style.css";
import "@material/web/slider/slider.js";

function Slider() {
  return (
    <>
      {/* <input type="range" className="w-full accent-fuchsia-800 " max={7} /> */}
      <md-slider
        min="0"
        max="70000"
        value="50000"
        ticks
        step="10000"
        className="w-full"
      ></md-slider>
    </>
  );
}

export default Slider;

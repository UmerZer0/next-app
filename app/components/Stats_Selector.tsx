"use client";
import React, { useState } from "react";
import Slider from "./Slider";

const Stats_Selector = ({
  label = "Max ATK",
  value = "33 168",
  initialValue = 5,
  min = 0,
  max = 10,
  activeColor = "bg-purple-600",
  inactiveColor = "bg-purple-100",
}) => {
  const [sliderValue, setSliderValue] = useState(initialValue);

  const handleSliderChange = (e: any) => {
    setSliderValue(Number(e.target.value));
  };

  return (
    <>
      <div
        className=" text-white p-6 rounded-lg w-full"
        style={{ backgroundColor: "#272727" }}
      >
        {/* Header with label and value */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-4xl font-bold">{label}</div>
          <div className="text-7xl font-bold">{value}</div>
        </div>

        {/* <input
        type="range"
        min={min}
        max={max}
        value={sliderValue}
        onChange={handleSliderChange}
        className="w-full cursor-pointer slider"
        aria-label={`${label} slider`}
        /> */}
        <Slider />
      </div>
    </>
  );
};

export default Stats_Selector;

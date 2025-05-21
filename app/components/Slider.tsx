"use client";
import React, { useRef, useEffect } from "react";
import "../styles/slider-style.css"; // Ensure this path is correct
import "@material/web/slider/slider.js";

// Interface for the md-slider element
interface MdSliderElement extends HTMLElement {
  value: number;
  step: number; // Expect 'step' property to be a number
  min: number; // Expect 'min' property to be a number
  max: number; // Expect 'max' property to be a number
}

interface SliderProps {
  value?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  min?: string;
  max?: string;
  step?: string;
  className?: string;
}

function Slider({
  value,
  initialValue = 0,
  onValueChange,
  min = "0", // Default string value from props
  max = "100000", // Default string value from props
  step = "1000", // Default string value from props
  className = "w-full",
}: SliderProps) {
  const sliderRef = useRef<MdSliderElement | null>(null);
  const displayValue = value !== undefined ? value : initialValue;

  // Parse min, max, and step props to numbers for setting properties
  const numMin = parseInt(min, 10);
  const numMax = parseInt(max, 10);
  const numStep = parseInt(step, 10); // This is the number 'step' we want

  useEffect(() => {
    const sliderElement = sliderRef.current;
    const handleInput = (event: Event) => {
      const target = event.target as MdSliderElement;
      const newValue = target.value;
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    if (sliderElement) {
      sliderElement.addEventListener("input", handleInput);
    }
    return () => {
      if (sliderElement) {
        sliderElement.removeEventListener("input", handleInput);
      }
    };
  }, [onValueChange]);

  useEffect(() => {
    // This effect synchronizes the DOM element's properties with React state/props
    if (sliderRef.current) {
      const el = sliderRef.current;

      // Sync min property
      if (el.min !== numMin) {
        // console.log(`Slider.tsx: Setting md-slider .min property to: ${numMin}`);
        el.min = numMin;
      }
      // Sync max property
      if (el.max !== numMax) {
        // console.log(`Slider.tsx: Setting md-slider .max property to: ${numMax}`);
        el.max = numMax;
      }
      // Sync step property (AS A NUMBER)
      if (el.step !== numStep) {
        console.log(
          `Slider.tsx: Setting md-slider .step property to: ${numStep} (was ${el.step})`
        );
        el.step = numStep;
      }
      // Sync value property
      if (el.value !== displayValue) {
        // console.log(`Slider.tsx: Setting md-slider .value property to: ${displayValue}`);
        el.value = displayValue;
      }
    }
  }, [displayValue, numMin, numMax, numStep]); // Dependencies include the parsed numeric values

  // Inside Slider.tsx function component

  // ... (all other code: props, refs, useEffects for listeners and property setting) ...
  // The useEffect that sets el.min, el.max, el.step, el.value is still good to have,
  // as it ensures properties are set correctly if the component *does* support dynamic updates.

  console.log(
    `Slider.tsx: Render/Props -> step: "${step}" (string), numStep: ${numStep} (number)`
  );

  return (
    <>
      {React.createElement("md-slider", {
        key: `${min}-${max}-${step}`, // <<<< ADD THIS LINE
        ref: sliderRef,
        min: min, // Pass string attributes for initial setup by the web component
        max: max,
        step: step, // The web component should ideally use this attribute for initialization
        className: className,
        value: displayValue, // Pass current value attribute
      })}
    </>
  );
}

export default Slider;

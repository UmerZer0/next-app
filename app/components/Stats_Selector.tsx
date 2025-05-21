"use client";
import React, { useRef, useState, useEffect } from "react"; // Added useEffect for safety, though not strictly needed by current logic
import Slider from "./Slider";

const formatValue = (value: string) => {
  const numeric = value.replace(/\D/g, "").slice(0, 5); // Max 5 digits
  return numeric.length > 3
    ? numeric.slice(0, numeric.length - 3) +
        " " +
        numeric.slice(numeric.length - 3)
    : numeric;
};

const Stats_Selector = ({
  label = <>Max ATK</>,
  initialValue = 50000,
  min = "0", // Slider min
  max = "70000", // Slider max
  step = "1000", // Slider step
}) => {
  const [statValue, setStatValue] = useState(() =>
    formatValue(initialValue.toString())
  );
  const divRef = useRef<HTMLDivElement>(null);

  // Parse min/max for internal use, with fallbacks
  const parsedMin = parseInt(min, 10) || 0;
  const parsedMax = parseInt(max, 10) || 70000;
  const sliderStep = parseInt(step, 10) || 1000; // Given the slider's step prop is "1000"

  // Convert the displayed statValue (e.g., "12 345") to a value for the slider's position
  // This will make the slider reflect the "thousands" part of the input
  const getSliderValueFromStat = (currentStatValue: string): number => {
    const numericString = currentStatValue.replace(/\D/g, "");
    let val = numericString ? parseInt(numericString, 10) : parsedMin;

    if (isNaN(val)) {
      val = parsedMin;
    }

    // Snap the value to the nearest step for the slider
    // e.g., if input is 12345, slider should represent 12000
    const snappedValue = Math.floor(val / sliderStep) * sliderStep;
    return Math.max(parsedMin, Math.min(snappedValue, parsedMax)); // Clamp to slider's own min/max
  };

  // This function is called WHEN THE SLIDER MOVES
  const handleValueChange = (sliderMovedToValue: number) => {
    // sliderMovedToValue is a pure number from the slider, e.g., 50000, 51000
    // It respects the slider's min, max, and step.

    const currentNumericStat = statValue.replace(/\D/g, ""); // Get current digits from displayed text
    let lastThreeDigits = 0;

    if (currentNumericStat.length > 0) {
      // Safely get the last up to 3 digits from the current text input
      lastThreeDigits = Number(
        currentNumericStat.slice(-Math.min(3, currentNumericStat.length))
      );
    }

    // The slider controls the thousands part. Combine with lastThreeDigits from input.
    const thousandsFromSlider = Math.floor(sliderMovedToValue / 1000);
    let finalNumericValue = thousandsFromSlider * 1000 + lastThreeDigits;

    // Ensure the combined value is within the overall min/max bounds
    finalNumericValue = Math.max(
      parsedMin,
      Math.min(finalNumericValue, parsedMax)
    );

    const clampedValue = Math.max(
      parsedMin,
      Math.min(sliderMovedToValue, parsedMax)
    );

    const newFormattedValue = formatValue(clampedValue.toString());
    setStatValue(newFormattedValue);
  };

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    const event = e.nativeEvent as InputEvent;
    const char = event.data;
    if (!char || !/^\d$/.test(char)) return;

    const div = divRef.current;
    if (!div) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    const currentTextInDiv = div.textContent || "";
    const numeric = currentTextInDiv.replace(/\D/g, "");

    let caretDigitIndex = 0;
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const textBeforeCaret = (range.startContainer as Text).data.slice(
        0,
        range.startOffset
      );
      caretDigitIndex = textBeforeCaret.replace(/\D/g, "").length;
    } else {
      caretDigitIndex = numeric.length;
    }

    const before = numeric.slice(0, caretDigitIndex);
    const after = numeric.slice(caretDigitIndex);
    let updatedNumeric = (before + char + after).slice(0, 5); // Limit to 5 digits overall

    // Ensure the numeric value doesn't exceed parsedMax just by typing
    let numRepresentation = parseInt(updatedNumeric, 10);
    if (!isNaN(numRepresentation) && numRepresentation > parsedMax) {
      updatedNumeric = updatedNumeric.slice(0, -1); // Prevent typing if it makes number too large
      // Or clamp: updatedNumeric = String(parsedMax).slice(0,5)
      // This simplified removal is one way.
      if (updatedNumeric === "") return; // Avoid issues if it becomes empty
    }

    const formatted = formatValue(updatedNumeric);
    setStatValue(formatted); // This will trigger re-render, updating slider via getSliderValueFromStat
    div.textContent = formatted;

    // Deferred caret placement (Method 1 from previous discussion)
    requestAnimationFrame(() => {
      const currentDiv = divRef.current;
      const currentSelection = window.getSelection();
      if (!currentDiv || !currentSelection) return;

      const updatedTextNode = currentDiv.firstChild as Text;
      if (updatedTextNode && updatedTextNode.nodeValue === formatted) {
        let newCaretDigitTarget = caretDigitIndex + 1; // after the inserted char

        let characterOffset = 0;
        let digitCount = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            digitCount++;
          }
          if (digitCount === newCaretDigitTarget) {
            characterOffset = i + 1; // Position after this digit
            break;
          }
          // If newCaretDigitTarget is 1 (first digit), and first char is digit,
          // digitCount becomes 1, characterOffset becomes 0+1=1. Correct.
        }
        // If all digits are processed and target not met (e.g., caret at very end of shorter num)
        // or if formatted string is shorter than expected caret.
        if (characterOffset === 0 && formatted.length > 0) {
          // Default to end of string if specific position not found (e.g. after last digit)
          // This happens if newCaretDigitTarget > total digits in formatted.
          // We want caret after the last actual digit typed, or end of string.
          let lastDigitCharOffset = 0;
          for (let i = 0; i < formatted.length; i++) {
            if (/\d/.test(formatted[i])) lastDigitCharOffset = i + 1;
          }
          characterOffset = Math.min(lastDigitCharOffset, formatted.length);
        }
        characterOffset = Math.min(characterOffset, formatted.length);

        const newRange = document.createRange();
        newRange.setStart(updatedTextNode, characterOffset);
        newRange.collapse(true);
        currentSelection.removeAllRanges();
        currentSelection.addRange(newRange);
      }
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    let numericPasted = text.replace(/\D/g, "").slice(0, 5); // Limit length

    let numRepresentation = parseInt(numericPasted, 10);
    if (!isNaN(numRepresentation) && numRepresentation > parsedMax) {
      numericPasted = String(parsedMax).slice(0, 5); // Clamp to max
    } else if (isNaN(numRepresentation) || numRepresentation < parsedMin) {
      numericPasted = String(parsedMin); // Default to min if invalid
    }

    const formatted = formatValue(numericPasted);

    setStatValue(formatted); // This updates slider
    if (divRef.current) {
      divRef.current.textContent = formatted;
      // Place caret at end after paste
      requestAnimationFrame(() => {
        // Defer for robustness
        const div = divRef.current;
        if (!div) return;
        const range = document.createRange();
        range.selectNodeContents(div);
        range.collapse(false); // false for end
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      });
    }
  };

  const handleBlur = () => {
    const div = divRef.current;
    if (!div) return;
    const currentText = div.textContent || "";
    let numericFromDiv = currentText.replace(/\D/g, "").slice(0, 5);

    let numRepresentation = parseInt(numericFromDiv, 10);
    if (isNaN(numRepresentation)) {
      // Handle if input is empty or non-numeric
      numRepresentation = parsedMin; // Default to min
    } else {
      numRepresentation = Math.max(
        parsedMin,
        Math.min(numRepresentation, parsedMax)
      ); // Clamp
    }

    const formatted = formatValue(String(numRepresentation));

    setStatValue(formatted); // This updates slider
    if (divRef.current) {
      // Update visual text if it was, e.g., unformatted or out of bounds
      divRef.current.textContent = formatted;
    }
  };

  return (
    <div
      className="text-white p-6 rounded-lg w-full"
      style={{ backgroundColor: "#272727" }}
    >
      <div className="flex justify-between items-center mb-4 ml-2">
        <div className="text-4xl">{label}</div>
        <div
          ref={divRef}
          className="text-7xl font-medium outline-none cursor-text"
          contentEditable
          suppressContentEditableWarning
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
          onBlur={handleBlur}
          // Initial content is set by statValue state
        >
          {statValue}
        </div>
      </div>

      <Slider
        // Assuming your Slider takes a `value` prop for controlled behavior
        value={getSliderValueFromStat(statValue)}
        onValueChange={handleValueChange}
        min={min} // Pass original string props
        max={max}
        step={step} // Slider's own step
      />
    </div>
  );
};

export default Stats_Selector;

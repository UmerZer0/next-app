"use client";
import React, { useState, useEffect, useRef, useId, useCallback } from "react";

const DRAG_SENSITIVITY = 20;
export const ANIMATION_DURATION = 300;

interface RollingNumberInputProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string; // For visible label and aria-labelledby
  id?: string;
  className?: string;
}

const Rolling_Input: React.FC<RollingNumberInputProps> = ({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label,
  id,
  className = "",
}) => {
  const internalId = useId();
  const componentId = id || internalId;
  const labelId = label ? `${componentId}-label-text` : undefined;

  const [currentAnimatedValue, setCurrentAnimatedValue] = useState(value);
  const [incomingAnimationClass, setIncomingAnimationClass] = useState("");
  const [animationKey, setAnimationKey] = useState(0);

  const isInitialMountRef = useRef(true);
  const dragStartYRef = useRef(0);
  const dragStartValueRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const changeOriginatedLocallyRef = useRef(false);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isInitialMountRef.current) {
      setCurrentAnimatedValue(value);
      isInitialMountRef.current = false;
      return;
    }

    let attemptRefocus = false;
    // Capture the flag's state at the beginning of this effect run.
    // This tells us if the prop change we're about to process was due to a local interaction.
    const wasLocalChangeWhenEffectTriggered =
      changeOriginatedLocallyRef.current;

    if (value !== currentAnimatedValue) {
      const isIncrement = value > currentAnimatedValue;
      setIncomingAnimationClass(
        isIncrement ? "animate-roll-in-from-bottom" : "animate-roll-in-from-top"
      );
      setCurrentAnimatedValue(value); // Sync internal display with new prop
      setAnimationKey((prevKey) => prevKey + 1);

      if (wasLocalChangeWhenEffectTriggered && wrapperRef.current) {
        if (document.activeElement !== wrapperRef.current) {
          attemptRefocus = true;
        }
      }
    }

    if (attemptRefocus) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      animationFrameIdRef.current = requestAnimationFrame(() => {
        if (
          wrapperRef.current &&
          document.activeElement !== wrapperRef.current
        ) {
          // console.log(`Re-focusing Rolling_Input (label: ${label}) via rAF. Original local change: ${wasLocalChangeWhenEffectTriggered}`);
          wrapperRef.current.focus({ preventScroll: true });
        }
        // CRITICAL: Reset the flag only *after* the focus attempt related to this specific local change.
        // This ensures the flag accurately reflects that this particular "local change event" has been processed.
        if (wasLocalChangeWhenEffectTriggered) {
          changeOriginatedLocallyRef.current = false;
        }
      });
    } else if (wasLocalChangeWhenEffectTriggered) {
      // If it was a local change, but no refocus was needed (e.g., focus was already correct),
      // still reset the flag as this "local change event" is now processed.
      changeOriginatedLocallyRef.current = false;
    }
    // If `!wasLocalChangeWhenEffectTriggered`, the flag is either already false
    // or will be managed by `onBlur` or `handleChange` (if an interaction doesn't lead to a prop change).

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [value, currentAnimatedValue, label]);

  const handleChange = useCallback(
    (newValue: number) => {
      const boundedValue = Math.max(min, Math.min(max, newValue));
      let finalValue = boundedValue;

      if (isFinite(min) && isFinite(step) && step !== 0) {
        finalValue = min + Math.round((boundedValue - min) / step) * step;
      } else if (isFinite(step) && step !== 0) {
        finalValue = Math.round(boundedValue / step) * step;
      }
      finalValue = Math.max(min, Math.min(max, finalValue));

      if (finalValue !== value) {
        // This interaction will lead to a parent update. Flag it.
        changeOriginatedLocallyRef.current = true;
        onChange(finalValue);
      } else {
        // Interaction occurred, but resulted in no change to the prop value.
        // The `useEffect` for `value` won't run for this.
        // Reset the flag as this interaction cycle concludes without a prop-driven focus check.
        changeOriginatedLocallyRef.current = false;
      }
    },
    [min, max, step, onChange, value]
  );

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (wrapperRef.current && document.activeElement !== wrapperRef.current) {
      wrapperRef.current.focus({ preventScroll: true });
    }
    setIsDragging(true);
    dragStartYRef.current = event.clientY;
    dragStartValueRef.current = currentAnimatedValue;
    event.preventDefault();
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (wrapperRef.current && document.activeElement !== wrapperRef.current) {
      // wrapperRef.current.focus({ preventScroll: true }); // Consider if needed for touch
    }
    setIsDragging(true);
    dragStartYRef.current = event.touches[0].clientY;
    dragStartValueRef.current = currentAnimatedValue;
  };

  useEffect(() => {
    const handleDragMove = (clientY: number) => {
      if (!isDragging) return;
      const deltaY = dragStartYRef.current - clientY;
      const changeInSteps = Math.round(deltaY / DRAG_SENSITIVITY);
      const newValue = dragStartValueRef.current + changeInSteps * step;
      handleChange(newValue);
    };

    const handleMouseMove = (event: MouseEvent) =>
      handleDragMove(event.clientY);
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        event.preventDefault();
        handleDragMove(event.touches[0].clientY);
      }
    };
    const handleDragEnd = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleDragEnd);
      document.addEventListener("touchcancel", handleDragEnd);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleDragEnd);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleDragEnd);
        document.removeEventListener("touchcancel", handleDragEnd);
      };
    }
  }, [isDragging, step, handleChange, currentAnimatedValue]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let newValue = currentAnimatedValue;
    let preventDefault = true;
    switch (event.key) {
      case "ArrowUp":
        newValue = currentAnimatedValue + step;
        break;
      case "ArrowDown":
        newValue = currentAnimatedValue - step;
        break;
      case "PageUp":
        newValue = currentAnimatedValue + step * 5;
        break;
      case "PageDown":
        newValue = currentAnimatedValue - step * 5;
        break;
      default:
        preventDefault = false;
        break;
    }
    if (preventDefault) {
      event.preventDefault();
      handleChange(newValue);
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    let newValue = currentAnimatedValue;
    if (event.deltaY < 0) newValue = currentAnimatedValue + step;
    else if (event.deltaY > 0) newValue = currentAnimatedValue - step;
    handleChange(newValue);
  };

  const handleFocus = () => {
    /* console.log(`Rolling_Input (label: ${label}) focused.`); */
  };

  const handleBlur = () => {
    if (isDragging) setIsDragging(false);
    // console.log(`Rolling_Input (label: ${label}) blurred. Resetting local change flag.`);
    // If focus is lost for any reason (user clicks away, tabs away),
    // any "local change" context for refocusing is invalidated.
    changeOriginatedLocallyRef.current = false;
  };

  return (
    <div
      ref={wrapperRef}
      id={componentId}
      className={`inline-flex flex-col font-sans items-center group ${className} focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded-lg cursor-default`}
      role="spinbutton"
      aria-labelledby={labelId}
      aria-valuenow={currentAnimatedValue}
      aria-valuemin={min === -Infinity ? undefined : min}
      aria-valuemax={max === Infinity ? undefined : max}
      aria-label={!label && !labelId ? "Numeric input" : undefined}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-md shadow-sm overflow-hidden select-none">
        <div
          className="px-2 py-0 w-16 text-center relative hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors duration-150 rounded-md overflow-hidden"
          style={{ height: "2.75rem" }}
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            key={animationKey}
            className={`absolute inset-0 flex items-center justify-center text-xl font-medium text-neutral-900 dark:text-neutral-50 ${incomingAnimationClass}`}
          >
            {currentAnimatedValue.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Rolling_Input;

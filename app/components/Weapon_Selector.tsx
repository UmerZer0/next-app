"use client";

import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import Image from "next/image";
// Make sure this path is correct for your project structure
import Rolling_Input, { ANIMATION_DURATION } from "./Rolling_Input";

// Define a type for your weapon data
interface Weapon {
  id: string;
  name: string;
  baseImageUrl: string; // Base image
  ascendedImageUrl?: string; // Image after a certain ascension
}

interface WeaponLevelStats {
  level: number;
  stat1: number; // e.g., Base Attack
  stat2: number; // e.g., Secondary Stat (Crit Rate %, ATK %, etc.)
}

// Helper type for keys of ascension arrays
type AscensionKey = `ascention${0 | 1 | 2 | 3 | 4 | 5 | 6}`;

interface WeaponProgression {
  weaponId: string;
  name: string;
  ascention0: WeaponLevelStats[];
  ascention1: WeaponLevelStats[];
  ascention2: WeaponLevelStats[];
  ascention3: WeaponLevelStats[];
  ascention4: WeaponLevelStats[];
  ascention5: WeaponLevelStats[];
  ascention6: WeaponLevelStats[];
}

const activeWeaponInfo: Weapon = {
  id: "yaxche001",
  name: "Ring of Yaxche",
  baseImageUrl: "/images/Weapon_Ring_of_Yaxche.webp",
  ascendedImageUrl: "/images/Weapon_Ring_of_Yaxche_2nd.webp",
};

const exampleWeaponProgression: WeaponProgression = {
  weaponId: "yaxche001",
  name: "Ring of Yaxche",
  ascention0: [
    { level: 1, stat1: 42.4, stat2: 9.0 },
    { level: 20, stat1: 108.93, stat2: 15.9 },
  ],
  ascention1: [
    { level: 20, stat1: 134.83, stat2: 15.9 },
    { level: 40, stat1: 204.83, stat2: 23.18 },
  ],
  ascention2: [
    { level: 40, stat1: 230.83, stat2: 23.18 },
    { level: 50, stat1: 265.86, stat2: 26.81 },
  ],
  ascention3: [
    { level: 50, stat1: 291.76, stat2: 26.81 },
    { level: 60, stat1: 326.78, stat2: 30.45 },
  ],
  ascention4: [
    { level: 60, stat1: 352.68, stat2: 30.45 },
    { level: 70, stat1: 387.66, stat2: 34.07 },
  ],
  ascention5: [
    { level: 70, stat1: 413.66, stat2: 34.07 },
    { level: 80, stat1: 448.68, stat2: 37.71 },
  ],
  ascention6: [
    { level: 80, stat1: 474.58, stat2: 37.71 },
    { level: 90, stat1: 509.61, stat2: 41.35 },
  ],
};

const getStartingLevelForAscensionPhase = (phase: number): number => {
  const phaseKey = `ascention${phase}` as AscensionKey;
  const phaseData = exampleWeaponProgression[phaseKey];
  if (phaseData && phaseData.length > 0) {
    // Genshin typically shows the *ascended* level, so for A1 (phase 1), it's level 20/40.
    // The first entry is usually the stats *at* that ascension boundary.
    // e.g. ascention1[0].level is 20.
    return phaseData[0].level;
  }
  // Fallback for phase 0 or if data is missing
  const phaseStartLevels = [1, 20, 40, 50, 60, 70, 80];
  return phaseStartLevels[phase] || 1;
};

function Weapon_Selector() {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedAscensionPhase, setSelectedAscensionPhase] =
    useState<number>(0);
  const [selectedRefinement, setSelectedRefinement] = useState<number>(1);
  const [currentStats, setCurrentStats] = useState<WeaponLevelStats | null>(
    null
  );
  const [currentWeaponImageUrl, setCurrentWeaponImageUrl] = useState<string>(
    activeWeaponInfo.baseImageUrl
  );

  useEffect(() => {
    const ascKey = `ascention${selectedAscensionPhase}` as AscensionKey;
    const progressionDataForPhase = exampleWeaponProgression[ascKey];
    let statsForSelectedLevel: WeaponLevelStats | undefined = undefined;

    if (progressionDataForPhase) {
      statsForSelectedLevel = progressionDataForPhase.find(
        (statEntry) => statEntry.level === selectedLevel
      );
      if (!statsForSelectedLevel) {
        const suitableLevels = progressionDataForPhase
          .filter((statEntry) => statEntry.level <= selectedLevel)
          .sort((a, b) => b.level - a.level);
        if (suitableLevels.length > 0) {
          statsForSelectedLevel = suitableLevels[0];
        }
      }
    }

    setCurrentStats(statsForSelectedLevel || null);

    if (selectedAscensionPhase >= 2 && activeWeaponInfo.ascendedImageUrl) {
      setCurrentWeaponImageUrl(activeWeaponInfo.ascendedImageUrl);
    } else {
      setCurrentWeaponImageUrl(activeWeaponInfo.baseImageUrl);
    }
  }, [selectedLevel, selectedAscensionPhase]);

  const handleLevelInputChange = useCallback(
    (newLevel: number) => {
      let level = Math.max(1, Math.min(90, newLevel));
      setSelectedLevel(level);

      let requiredPhase = 0;
      if (level > 80) requiredPhase = 6;
      else if (level > 70) requiredPhase = 5;
      else if (level > 60) requiredPhase = 4;
      else if (level > 50) requiredPhase = 3;
      else if (level > 40) requiredPhase = 2;
      else if (level > 20) requiredPhase = 1;

      const currentPhaseMaxLevelEntry =
        exampleWeaponProgression[
          `ascention${selectedAscensionPhase}` as AscensionKey
        ];
      const currentPhaseMaxLevel =
        currentPhaseMaxLevelEntry?.[currentPhaseMaxLevelEntry.length - 1]
          ?.level || selectedLevel;

      if (
        level > currentPhaseMaxLevel &&
        selectedAscensionPhase < requiredPhase
      ) {
        setSelectedAscensionPhase(requiredPhase);
      } else if (
        selectedAscensionPhase > requiredPhase &&
        level < getStartingLevelForAscensionPhase(selectedAscensionPhase)
      ) {
        setSelectedAscensionPhase(requiredPhase);
      }
    },
    [selectedAscensionPhase, setSelectedLevel, setSelectedAscensionPhase]
  ); // Added dependencies

  const handleRefinementChange = useCallback(
    (newRefinement: number) => {
      setSelectedRefinement(Math.max(1, Math.min(5, newRefinement)));
    },
    [setSelectedRefinement]
  ); // Added dependency

  const handleAscensionStarClick = (phase: number) => {
    setSelectedAscensionPhase(phase);
    const startingLevel = getStartingLevelForAscensionPhase(phase);
    setSelectedLevel(startingLevel);
  };

  const maxLevelButton = () => {
    setSelectedLevel(90);
    setSelectedAscensionPhase(6);
  };

  const maxRefinementButton = () => {
    setSelectedRefinement(5);
  };

  function Image_Section() {
    return (
      <>
        <style jsx global>{`
          @keyframes roll-in-from-bottom {
            0% {
              transform: translateY(1em) scale(0.9);
              opacity: 0;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          @keyframes roll-in-from-top {
            0% {
              transform: translateY(-1em) scale(0.9);
              opacity: 0;
            }
            100% {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }
          .animate-roll-in-from-bottom {
            animation: roll-in-from-bottom ${ANIMATION_DURATION}ms
              cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .animate-roll-in-from-top {
            animation: roll-in-from-top ${ANIMATION_DURATION}ms
              cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          body {
            font-family: "Inter", sans-serif;
          }
        `}</style>

        <div className="flex flex-row justify-around w-full my-3 md:my-4">
          <div className="self-center flex flex-col items-center">
            <Rolling_Input
              label="Level"
              value={selectedLevel}
              onChange={handleLevelInputChange}
              min={1}
              max={90}
              step={1}
              className="mx-auto w-24 md:w-28"
            />
            <button
              className="bg-orange-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-orange-600 transition-colors duration-200 text-sm md:text-base"
              onClick={maxLevelButton}
            >
              Max
            </button>
          </div>

          <div className="relative w-32 h-32 md:w-44 md:h-44 overflow-hidden place-self-center rounded-md shadow-lg">
            <Image
              src={currentWeaponImageUrl}
              alt={activeWeaponInfo.name}
              layout="fill"
              objectFit="contain"
              priority
              key={currentWeaponImageUrl}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/160x160/CCCCCC/FFFFFF?text=Img+Err&font=montserrat";
              }}
            />
          </div>

          <div className="self-center flex flex-col items-center">
            <Rolling_Input
              label="Refinement"
              value={selectedRefinement}
              onChange={handleRefinementChange}
              min={1}
              max={5}
              step={1}
              className="mx-auto w-24 md:w-28"
            />
            <button
              className="bg-cyan-500 text-white px-4 py-2 mt-2 rounded-md hover:bg-cyan-600 transition-colors duration-200 text-sm md:text-base"
              onClick={maxRefinementButton}
            >
              Max\
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="text-white p-4 md:p-6 pb-2 md:pb-2 rounded-lg w-full bg-neutral-800 border-2 md:border-4 border-yellow-400/60 shadow-xl">
      <div className="">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="text-lg md:text-xl flex flex-row justify-between w-full ">
            <div className="text-3xl md:text-4xl font-semibold text-neutral-100">
              {activeWeaponInfo.name}
            </div>

            <div className="flex flex-col rounded-md text-end self-start">
              {currentStats ? (
                <>
                  <p className="text-amber-400 text-xl md:text-2xl">
                    <span>⚔️</span>
                    {currentStats.stat1.toFixed(
                      currentStats.stat1 % 1 === 0 ? 0 : 2
                    )}
                  </p>
                  <p className="text-green-400 text-xl md:text-2xl">
                    <span>💧</span>
                    {currentStats.stat2.toFixed(
                      currentStats.stat2 % 1 === 0 ? 0 : 2
                    )}
                    %
                  </p>
                </>
              ) : (
                <p className="text-neutral-400">Select level/ascension.</p>
              )}
            </div>
          </div>

          <Image_Section />

          <div className="flex flex-col items-center w-full mt-1 mb-3 md:mb-4">
            <label className="text-sm text-neutral-300 mb-1.5">
              Ascension Phase
            </label>
            <div className="flex justify-center space-x-1 md:space-x-2">
              {[0, 1, 2, 3, 4, 5, 6].map((phase) => (
                <button
                  key={phase}
                  onClick={() => handleAscensionStarClick(phase)}
                  className={`px-2 py-1 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-all duration-200
                    ${
                      selectedAscensionPhase === phase
                        ? "bg-yellow-500 text-neutral-800 scale-110 shadow-md"
                        : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300"
                    }`}
                >
                  {phase}✦
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Weapon_Selector;

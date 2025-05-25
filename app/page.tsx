import Image from "next/image";
import Stats_Selector from "./components/Stats_Selector";
import Weapon_Selector from "./components/Weapon_Selector";

export default function Home() {
  return (
    <>
      <div className=" bg-neutral-900">
        <div className="max-w-md mx-auto">
          <Stats_Selector
            label={
              <>
                Max
                <br />
                ATK
              </>
            }
            initialValue={50123}
            min="0"
            max="70000"
            step="1000"
          />

          <Stats_Selector
            label={
              <>
                Max
                <br />
                HP
              </>
            }
            initialValue={50000}
            min="0"
            max="70000"
            step="1000"
          />

          <Stats_Selector
            label={
              <>
                Max
                <br />
                DEF
              </>
            }
            initialValue={50000}
            min="0"
            max="70000"
            step="1000"
          />

          <Stats_Selector
            label={
              <>
                Elem
                <br />
                Mastery
              </>
            }
            initialValue={500}
            min="0"
            max="2000"
            step="100"
          />

          <Stats_Selector
            label={
              <>
                Crit
                <br />
                DMG
              </>
            }
            initialValue={200}
            min="50"
            max="450"
            step="1"
            suffix="%"
          />

          <Weapon_Selector />

          {/* You could add more stat displays here */}
        </div>
      </div>
    </>
  );
}

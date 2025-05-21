import Image from "next/image";
import Stats_Selector from "./components/Stats_Selector";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Character Stats</h1>

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
          />

          {/* You could add more stat displays here */}
        </div>
      </div>
    </>
  );
}

import Image from "next/image";
import Stats_Selector from "./components/Stats_Selector";

export default function Home() {
  return (
    <>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Character Stats</h1>

          <Stats_Selector
            label="Max ATK"
            value="33 168"
            initialValue={5}
            min={0}
            max={7}
            activeColor="bg-purple-600"
            inactiveColor="bg-purple-100"
          />

          {/* You could add more stat displays here */}
        </div>
      </div>
    </>
  );
}

import React from "react";

const ART = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/e003345ec_Screenshot2026-07-31at153936-Photoroom.png";

export default function DemoHeroArt() {
  return (
    <img
      src={ART}
      alt="בעל עסק מקבל הקלטת שיחה בוואטסאפ"
      className="mx-auto translate-x-6 sm:translate-x-8 mt-8 -mb-10 sm:-mb-14 w-80 sm:w-[26rem] max-w-full h-auto block"
    />
  );
}
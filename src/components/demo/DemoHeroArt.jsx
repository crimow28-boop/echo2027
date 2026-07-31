import React from "react";
import { Image } from "@/components/ui/image";

const ART = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/e003345ec_Screenshot2026-07-31at153936-Photoroom.png";

export default function DemoHeroArt() {
  return (
    <div className="relative mx-auto mt-8 w-64 sm:w-72">
      <div className="absolute inset-x-2 bottom-0 h-44 sm:h-52 rounded-full bg-gradient-to-br from-teal-100 to-teal-200" />
      <Image
        src={ART}
        alt="בעל עסק מקבל הקלטת שיחה בוואטסאפ"
        fittingType="fit"
        className="relative w-full"
      />
    </div>
  );
}
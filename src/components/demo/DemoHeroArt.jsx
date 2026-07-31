import React from "react";
import { Image } from "@/components/ui/image";

const ART = "https://media.base44.com/images/public/6a689fcffadbeb43e30aa312/5c22a40e8_generated_image.png";

export default function DemoHeroArt() {
  return (
    <div className="mx-auto mt-8 w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-br from-teal-100 to-teal-300 overflow-hidden ring-1 ring-black/5">
      <Image
        src={ART}
        alt="בעל עסק מקבל הקלטת שיחה בוואטסאפ"
        fittingType="fill"
        className="w-full h-full"
      />
    </div>
  );
}
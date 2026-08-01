import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";
import AnnouncementClip from "@/components/announcements/AnnouncementClip";
import VersionPicker from "@/components/announcements/VersionPicker";
import HelpNotice from "@/components/announcements/HelpNotice";

const VERSIONS = {
  sentence: {
    title: "משפט ההודעה בלבד",
    subtitle: "יש לכם כבר הודעת פתיחה? הוסיפו אחריה רק את המשפט הזה.",
    text: '"לידיעתכם, השיחה מוקלטת, ותוכלו לבקש ולקבל את הקלטת השיחה בכל עת."',
    female: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/b74f4fe1c_tikun73-notice-sentence-female.mp3",
    male: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/db3ed20db_tikun73-notice-sentence-male.mp3",
    fileBase: "הודעת-הקלטה",
  },
  opener: {
    title: "הודעת פתיחה שלמה",
    subtitle: "אין לכם הודעת פתיחה? קובץ אחד שעושה הכל: ברכה, הודעת ההקלטה והמתנה.",
    text: '"שלום, תודה שהתקשרתם. לידיעתכם, השיחה מוקלטת, ותוכלו לבקש ולקבל את הקלטת השיחה בכל עת. אנא המתינו ונשמח לעזור."',
    female: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/18a6d5ff0_tikun73-notice-opener-female.mp3",
    male: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/51d21f601_tikun73-notice-opener-male.mp3",
    fileBase: "הודעת-פתיחה",
  },
};

export default function VoiceAnnouncements() {
  const [version, setVersion] = useState("sentence");
  const v = VERSIONS[version];

  return (
    <div dir="rtl" className="min-h-screen bg-transparent bg-grid text-foreground font-body">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-3.5 h-3.5" /> חזרה
        </Link>

        <h1 className="mt-6 text-2xl sm:text-3xl font-heading">הכרזות קוליות למרכזייה</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          בחרו את הנוסח המתאים לכם, והורידו בקול נשי או גברי.
        </p>

        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm leading-relaxed text-amber-800">
            ההודעה המוכרת לא מספיקה: הנוסח הנפוץ "שיחה זו מוקלטת לצורכי בקרת איכות" מודיע על ההקלטה,
            אבל לא על זכות הלקוח לקבל אותה — ולכן אינו עומד בדרישות החוק. גם עסקים שכבר מקליטים ומודיעים
            צריכים לעדכן את ההודעה.
          </p>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-sm font-medium">בחרו נוסח</p>
          <VersionPicker value={version} onChange={setVersion} />
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-heading">{v.title}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{v.subtitle}</p>
          <p className="mt-4 rounded-2xl bg-muted/50 border border-border px-4 py-3.5 text-sm leading-relaxed">
            {v.text}
          </p>
          <div className="mt-4 space-y-3">
            <AnnouncementClip label="קול נשי" url={v.female} fileName={`${v.fileBase}-קול-נשי.mp3`} />
            <AnnouncementClip label="קול גברי" url={v.male} fileName={`${v.fileBase}-קול-גברי.mp3`} />
          </div>
        </section>

        <div className="mt-10">
          <HelpNotice />
        </div>
      </div>
    </div>
  );
}
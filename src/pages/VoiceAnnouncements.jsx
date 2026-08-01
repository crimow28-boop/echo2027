import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";
import AnnouncementClip from "@/components/announcements/AnnouncementClip";

const FILES = {
  sentenceFemale: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/b74f4fe1c_tikun73-notice-sentence-female.mp3",
  sentenceMale: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/db3ed20db_tikun73-notice-sentence-male.mp3",
  openerFemale: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/18a6d5ff0_tikun73-notice-opener-female.mp3",
  openerMale: "https://media.base44.com/files/public/6a689fcffadbeb43e30aa312/51d21f601_tikun73-notice-opener-male.mp3",
};

export default function VoiceAnnouncements() {
  return (
    <div dir="rtl" className="min-h-screen bg-transparent bg-grid text-foreground font-body">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="w-3.5 h-3.5" /> חזרה
        </Link>

        <h1 className="mt-6 text-2xl sm:text-3xl font-heading">הכרזות קוליות למרכזייה</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          שני נוסחים, שני קולות — מוכנים להורדה ולהעלאה למרכזייה.
        </p>

        <div className="mt-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm leading-relaxed text-amber-800">
            ההודעה המוכרת לא מספיקה: הנוסח הנפוץ "שיחה זו מוקלטת לצורכי בקרת איכות" מודיע על ההקלטה,
            אבל לא על זכות הלקוח לקבל אותה — ולכן אינו עומד בדרישות החוק. גם עסקים שכבר מקליטים ומודיעים
            צריכים לעדכן את ההודעה.
          </p>
        </div>

        <section className="mt-10">
          <h2 className="text-lg font-heading">משפט ההודעה בלבד</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            יש לכם כבר הודעת פתיחה? הוסיפו אחריה רק את המשפט הזה.
          </p>
          <p className="mt-4 rounded-2xl bg-muted/50 border border-border px-4 py-3.5 text-sm leading-relaxed">
            "לידיעתכם, השיחה מוקלטת, ותוכלו לבקש ולקבל את הקלטת השיחה בכל עת."
          </p>
          <div className="mt-4 space-y-3">
            <AnnouncementClip label="קול נשי" url={FILES.sentenceFemale} fileName="הודעת-הקלטה-קול-נשי.mp3" />
            <AnnouncementClip label="קול גברי" url={FILES.sentenceMale} fileName="הודעת-הקלטה-קול-גברי.mp3" />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-lg font-heading">הודעת פתיחה שלמה</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            אין לכם הודעת פתיחה? קובץ אחד שעושה הכל: ברכה, הודעת ההקלטה והמתנה.
          </p>
          <p className="mt-4 rounded-2xl bg-muted/50 border border-border px-4 py-3.5 text-sm leading-relaxed">
            "שלום, תודה שהתקשרתם. לידיעתכם, השיחה מוקלטת, ותוכלו לבקש ולקבל את הקלטת השיחה בכל עת. אנא המתינו ונשמח לעזור."
          </p>
          <div className="mt-4 space-y-3">
            <AnnouncementClip label="קול נשי" url={FILES.openerFemale} fileName="הודעת-פתיחה-קול-נשי.mp3" />
            <AnnouncementClip label="קול גברי" url={FILES.openerMale} fileName="הודעת-פתיחה-קול-גברי.mp3" />
          </div>
        </section>
      </div>
    </div>
  );
}
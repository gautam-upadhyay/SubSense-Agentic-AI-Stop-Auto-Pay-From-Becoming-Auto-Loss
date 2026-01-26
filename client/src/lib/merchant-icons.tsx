import {
  Film,
  Music,
  Package,
  Youtube,
  Palette,
  HardDrive,
  FileText,
  MessageSquare,
  Video,
  FileSpreadsheet,
  Cloud,
  PenTool,
  PenLine,
  Briefcase,
  Tv,
  AppWindow,
} from "lucide-react";
import { SiNetflix, SiSpotify, SiAmazon, SiYoutube, SiAdobe, SiDropbox, SiNotion, SiSlack, SiZoom, SiMicrosoft, SiLinkedin, SiCanva, SiGrammarly } from "react-icons/si";

export const merchantIconMap: Record<string, { icon: React.ReactNode; bgColor: string }> = {
  Netflix: {
    icon: <SiNetflix className="w-5 h-5 text-red-600" />,
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  Spotify: {
    icon: <SiSpotify className="w-5 h-5 text-green-600" />,
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  "Amazon Prime": {
    icon: <SiAmazon className="w-5 h-5 text-orange-600" />,
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  "YouTube Premium": {
    icon: <SiYoutube className="w-5 h-5 text-red-600" />,
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  Disney: {
    icon: <Tv className="w-5 h-5 text-blue-600" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  "Adobe Creative": {
    icon: <SiAdobe className="w-5 h-5 text-red-700" />,
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  Dropbox: {
    icon: <SiDropbox className="w-5 h-5 text-blue-600" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  Notion: {
    icon: <SiNotion className="w-5 h-5 text-foreground" />,
    bgColor: "bg-muted",
  },
  Slack: {
    icon: <SiSlack className="w-5 h-5 text-purple-600" />,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  Zoom: {
    icon: <SiZoom className="w-5 h-5 text-blue-500" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  "Microsoft 365": {
    icon: <SiMicrosoft className="w-5 h-5 text-orange-500" />,
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  "Google One": {
    icon: <Cloud className="w-5 h-5 text-blue-500" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  Grammarly: {
    icon: <SiGrammarly className="w-5 h-5 text-green-600" />,
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  Canva: {
    icon: <SiCanva className="w-5 h-5 text-cyan-600" />,
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  LinkedIn: {
    icon: <SiLinkedin className="w-5 h-5 text-blue-700" />,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
};

export function getMerchantIcon(merchant: string) {
  return merchantIconMap[merchant] || {
    icon: <AppWindow className="w-5 h-5 text-muted-foreground" />,
    bgColor: "bg-muted",
  };
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Download,
  Image,
  Palette,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type TextElement = {
  id: string;
  type: "text";
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  bold: boolean;
  italic: boolean;
};

type ShapeElement = {
  id: string;
  type: "shape";
  shapeType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  rotation: number;
};

type CardElement = TextElement | ShapeElement;

type Card = {
  id: string;
  templateId: string;
  category: string;
  background: string;
  backgroundType: "solid" | "gradient" | "pattern";
  patternStyle?: string;
  patternColor?: string;
  elements: CardElement[];
  overlayImage?: string;
};

type Template = {
  id: string;
  name: string;
  category: string;
  background: string;
  backgroundType: "solid" | "gradient" | "pattern";
  patternStyle?: string;
  previewElements: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    bold?: boolean;
    italic?: boolean;
  }[];
  decorStyle?: string;
  overlayImage?: string;
  layoutType?: string;
  layoutColors?: string[];
};

// ─── Shape Definitions ────────────────────────────────────────────────────────

const SHAPE_DEFS: {
  id: string;
  label: string;
  path?: string;
  primitive?: string;
}[] = [
  { id: "circle", label: "Circle", primitive: "circle" },
  { id: "square", label: "Square", primitive: "rect" },
  { id: "rectangle", label: "Rectangle", primitive: "rect-wide" },
  {
    id: "triangle",
    label: "Triangle",
    path: "M 50 5 L 95 90 L 5 90 Z",
  },
  {
    id: "star",
    label: "Star",
    path: "M 50 5 L 61 35 L 95 35 L 68 57 L 79 91 L 50 70 L 21 91 L 32 57 L 5 35 L 39 35 Z",
  },
  {
    id: "heart",
    label: "Heart",
    path: "M 50 85 C 10 55 0 30 15 17 C 28 5 50 20 50 20 C 50 20 72 5 85 17 C 100 30 90 55 50 85 Z",
  },
  {
    id: "diamond",
    label: "Diamond",
    path: "M 50 5 L 95 50 L 50 95 L 5 50 Z",
  },
  {
    id: "pentagon",
    label: "Pentagon",
    path: "M 50 5 L 95 36 L 79 90 L 21 90 L 5 36 Z",
  },
  {
    id: "hexagon",
    label: "Hexagon",
    path: "M 50 5 L 90 27.5 L 90 72.5 L 50 95 L 10 72.5 L 10 27.5 Z",
  },
  {
    id: "burst",
    label: "Burst",
    path: "M 50 2 L 54 38 L 85 15 L 65 47 L 98 50 L 65 53 L 85 85 L 54 62 L 50 98 L 46 62 L 15 85 L 35 53 L 2 50 L 35 47 L 15 15 L 46 38 Z",
  },
  {
    id: "arrow",
    label: "Arrow",
    path: "M 5 38 L 60 38 L 60 18 L 95 50 L 60 82 L 60 62 L 5 62 Z",
  },
  {
    id: "ribbon",
    label: "Banner",
    path: "M 5 25 L 95 25 L 85 50 L 95 75 L 5 75 L 15 50 Z",
  },
  {
    id: "flower",
    label: "Flower",
    path: "M 50 20 C 50 20 60 5 70 15 C 80 25 65 35 65 35 C 65 35 85 30 85 45 C 85 60 65 55 65 55 C 65 55 80 65 70 75 C 60 85 50 70 50 70 C 50 70 40 85 30 75 C 20 65 35 55 35 55 C 35 55 15 60 15 45 C 15 30 35 35 35 35 C 35 35 20 25 30 15 C 40 5 50 20 50 20 Z",
  },
  {
    id: "crown",
    label: "Crown",
    path: "M 5 80 L 5 35 L 25 60 L 50 10 L 75 60 L 95 35 L 95 80 Z",
  },
  {
    id: "rounded-rect",
    label: "Rounded Rect",
    primitive: "rounded-rect",
  },
  {
    id: "oval",
    label: "Oval",
    primitive: "oval",
  },
  {
    id: "parallelogram",
    label: "Parallelogram",
    path: "M 20 5 L 95 5 L 80 95 L 5 95 Z",
  },
  {
    id: "trapezoid",
    label: "Trapezoid",
    path: "M 15 80 L 85 80 L 95 20 L 5 20 Z",
  },
  {
    id: "cross",
    label: "Cross",
    path: "M 35 5 L 65 5 L 65 35 L 95 35 L 95 65 L 65 65 L 65 95 L 35 95 L 35 65 L 5 65 L 5 35 L 35 35 Z",
  },
  {
    id: "speech-bubble",
    label: "Speech Bubble",
    path: "M 10 10 Q 10 5 15 5 L 85 5 Q 90 5 90 10 L 90 65 Q 90 70 85 70 L 55 70 L 45 85 L 40 70 L 15 70 Q 10 70 10 65 Z",
  },
  {
    id: "lightning",
    label: "Lightning",
    path: "M 60 5 L 25 52 L 48 52 L 40 95 L 75 48 L 52 48 Z",
  },
  {
    id: "tag",
    label: "Tag",
    primitive: "tag",
  },
];

// ─── Templates ────────────────────────────────────────────────────────────────

const TEMPLATES: Template[] = [
  // ── Birthday ──
  {
    id: "birthday-1",
    name: "Happy Birthday",
    category: "Birthday",
    background:
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #feada6 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Birthday!",
        x: 50,
        y: 35,
        fontSize: 38,
        color: "#7c2d6b",
        bold: true,
      },
      {
        text: "Wishing you a magical day",
        x: 50,
        y: 58,
        fontSize: 17,
        color: "#9d3b88",
        italic: true,
      },
      { text: "Happy Birthday!", x: 50, y: 76, fontSize: 14, color: "#7c2d6b" },
    ],
    decorStyle: "border-dots",
    layoutType: "banner-overlay",
    layoutColors: ["#ff4081", "#fff0f5"],
  },
  {
    id: "birthday-2",
    name: "Birthday Bash",
    category: "Birthday",
    background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "It's Your Day!",
        x: 50,
        y: 35,
        fontSize: 42,
        color: "#fff",
        bold: true,
      },
      {
        text: "Celebrate in style",
        x: 50,
        y: 58,
        fontSize: 18,
        color: "#f0e6ff",
        italic: true,
      },
      { text: "Let's Celebrate!", x: 50, y: 76, fontSize: 14, color: "#fff" },
    ],
    decorStyle: "confetti",
    layoutType: "circular-badge",
    layoutColors: ["rgba(255,255,255,0.35)"],
  },
  {
    id: "birthday-3",
    name: "Golden Birthday",
    category: "Birthday",
    background:
      "linear-gradient(135deg, #1a0533 0%, #4a0e8f 50%, #d4af37 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Birthday",
        x: 50,
        y: 28,
        fontSize: 20,
        color: "#d4af37",
        italic: true,
      },
      {
        text: "Happy Birthday!",
        x: 50,
        y: 48,
        fontSize: 40,
        color: "#fff",
        bold: true,
      },
      {
        text: "May all your wishes come true",
        x: 50,
        y: 68,
        fontSize: 16,
        color: "#fde68a",
        italic: true,
      },
    ],
    decorStyle: "luxe",
    layoutType: "bold-header",
    layoutColors: ["#1a0533", "#d4af37"],
  },
  {
    id: "birthday-boy-1",
    name: "Boy's Birthday",
    category: "Birthday",
    background:
      "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #93c5fd 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Birthday!",
        x: 30,
        y: 25,
        fontSize: 34,
        color: "#fff",
        bold: true,
      },
      {
        text: "It's a Boy's Special Day!",
        x: 30,
        y: 50,
        fontSize: 16,
        color: "#dbeafe",
        italic: true,
      },
      {
        text: "Celebrate & Have Fun!",
        x: 30,
        y: 72,
        fontSize: 13,
        color: "#bfdbfe",
      },
    ],
    overlayImage: "/assets/generated/birthday-boy-transparent.dim_300x400.png",
    decorStyle: "confetti",
    layoutType: "split-panel",
    layoutColors: ["#1e3a8a", "#dbeafe"],
  },
  // ── Wedding ──
  {
    id: "wedding-1",
    name: "Classic Wedding",
    category: "Wedding",
    background:
      "linear-gradient(135deg, #fdf8f0 0%, #f5e6d3 50%, #e8d5c4 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Sarah & James",
        x: 50,
        y: 30,
        fontSize: 32,
        color: "#8b6b4e",
        bold: true,
        italic: true,
      },
      {
        text: "Together Forever",
        x: 50,
        y: 50,
        fontSize: 20,
        color: "#a07856",
        italic: true,
      },
      {
        text: "We're Getting Married",
        x: 50,
        y: 70,
        fontSize: 15,
        color: "#8b6b4e",
      },
    ],
    decorStyle: "floral",
    layoutType: "framed",
    layoutColors: ["#d4af37", "#c9a882"],
  },
  {
    id: "wedding-2",
    name: "Rose Gold Wedding",
    category: "Wedding",
    background:
      "linear-gradient(135deg, #2d1b4e 0%, #7b3f6e 50%, #c4927a 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "~ Wedding Invitation ~",
        x: 50,
        y: 25,
        fontSize: 16,
        color: "#f0c8b8",
        italic: true,
      },
      {
        text: "Emily & Robert",
        x: 50,
        y: 45,
        fontSize: 34,
        color: "#fff",
        bold: true,
      },
      {
        text: "Join us in celebration",
        x: 50,
        y: 65,
        fontSize: 17,
        color: "#f0c8b8",
        italic: true,
      },
      {
        text: "Together Forever",
        x: 50,
        y: 80,
        fontSize: 15,
        color: "#f0c8b8",
      },
    ],
    layoutType: "framed",
    layoutColors: ["#c9a882", "#d4af37"],
  },
  {
    id: "wedding-3",
    name: "Minimalist Vows",
    category: "Wedding",
    background: "linear-gradient(135deg, #f8f4ef 0%, #ede0d4 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "A & B",
        x: 50,
        y: 30,
        fontSize: 60,
        color: "#c9a882",
        bold: true,
      },
      {
        text: "Two souls, one heart",
        x: 50,
        y: 60,
        fontSize: 18,
        color: "#9d7a56",
        italic: true,
      },
      { text: "∞  Forever  ∞", x: 50, y: 78, fontSize: 16, color: "#c9a882" },
    ],
    decorStyle: "minimal-luxe",
    layoutType: "minimal-lines",
    layoutColors: ["#c9a882"],
  },
  // ── Anniversary ──
  {
    id: "anniversary-1",
    name: "Happy Anniversary",
    category: "Anniversary",
    background:
      "linear-gradient(135deg, #880e4f 0%, #c2185b 50%, #f06292 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Anniversary",
        x: 50,
        y: 35,
        fontSize: 34,
        color: "#fff",
        bold: true,
      },
      {
        text: "Still falling for you",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#fce4ec",
        italic: true,
      },
      {
        text: "With love, always",
        x: 50,
        y: 74,
        fontSize: 15,
        color: "#f8bbd0",
      },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#be185d", "#fce7f3"],
  },
  {
    id: "anniversary-2",
    name: "Golden Anniversary",
    category: "Anniversary",
    background:
      "linear-gradient(135deg, #1a1200 0%, #4a3500 50%, #c9a227 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "50 Years",
        x: 50,
        y: 30,
        fontSize: 52,
        color: "#ffd700",
        bold: true,
      },
      {
        text: "of Love & Laughter",
        x: 50,
        y: 55,
        fontSize: 22,
        color: "#fff",
        italic: true,
      },
      {
        text: "Golden Anniversary",
        x: 50,
        y: 74,
        fontSize: 16,
        color: "#ffd700",
      },
    ],
    decorStyle: "luxe",
    layoutType: "bold-header",
    layoutColors: ["#1a1200", "#ffd700"],
  },
  // ── Thank You ──
  {
    id: "thank-you-1",
    name: "Thank You",
    decorStyle: "botanical",
    category: "Thank You",
    background: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Thank You!",
        x: 50,
        y: 35,
        fontSize: 42,
        color: "#276b3b",
        bold: true,
      },
      {
        text: "Your kindness means everything",
        x: 50,
        y: 58,
        fontSize: 17,
        color: "#2e7d42",
        italic: true,
      },
      {
        text: "Truly grateful",
        x: 50,
        y: 76,
        fontSize: 14,
        color: "#276b3b",
      },
    ],
    layoutType: "minimal-lines",
    layoutColors: ["#6366f1", "#e0e7ff"],
  },
  {
    id: "thank-you-2",
    name: "Elegant Thanks",
    category: "Thank You",
    background:
      "linear-gradient(135deg, #1a2a1a 0%, #2d5a27 50%, #7ab648 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Thank You",
        x: 50,
        y: 30,
        fontSize: 38,
        color: "#f0fce8",
        bold: true,
      },
      {
        text: "Words can't express our gratitude",
        x: 50,
        y: 55,
        fontSize: 16,
        color: "#c8f0b0",
        italic: true,
      },
      {
        text: "From the bottom of our hearts",
        x: 50,
        y: 72,
        fontSize: 14,
        color: "#a8e090",
      },
    ],
    layoutType: "minimal-lines",
    layoutColors: ["#15803d"],
  },
  // ── Congratulations ──
  {
    id: "congrats-1",
    name: "Congratulations!",
    category: "Congrats",
    background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Congratulations!",
        x: 50,
        y: 35,
        fontSize: 32,
        color: "#7c4f00",
        bold: true,
      },
      {
        text: "You did it! So proud of you",
        x: 50,
        y: 57,
        fontSize: 18,
        color: "#8a5800",
        italic: true,
      },
      {
        text: "You're Amazing",
        x: 50,
        y: 76,
        fontSize: 15,
        color: "#6b3e00",
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#7c3aed", "#a78bfa"],
  },
  {
    id: "congrats-2",
    name: "Big Achievement",
    category: "Congrats",
    background:
      "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "You Did It!",
        x: 50,
        y: 30,
        fontSize: 46,
        color: "#4fc3f7",
        bold: true,
      },
      {
        text: "Congratulations on this milestone",
        x: 50,
        y: 55,
        fontSize: 16,
        color: "#b3e5fc",
        italic: true,
      },
      {
        text: "The sky's the limit",
        x: 50,
        y: 74,
        fontSize: 15,
        color: "#81d4fa",
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#0f2027", "#4fc3f7"],
  },
  // ── Love / Romance ──
  {
    id: "love-1",
    name: "With All My Love",
    category: "Love",
    background:
      "linear-gradient(135deg, #4c0519 0%, #9f1239 50%, #e11d48 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "With All My Love",
        x: 50,
        y: 35,
        fontSize: 34,
        color: "#fff",
        bold: true,
      },
      {
        text: "Forever yours",
        x: 50,
        y: 57,
        fontSize: 20,
        color: "#fecdd3",
        italic: true,
      },
      {
        text: "Always & Forever",
        x: 50,
        y: 76,
        fontSize: 14,
        color: "#fda4af",
      },
    ],
    layoutType: "circular-badge",
    layoutColors: ["rgba(251,113,133,0.4)"],
  },
  {
    id: "love-2",
    name: "Be My Valentine",
    category: "Love",
    background:
      "linear-gradient(135deg, #881337 0%, #be123c 50%, #fda4af 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Be My Valentine",
        x: 50,
        y: 35,
        fontSize: 34,
        color: "#fff",
        bold: true,
      },
      {
        text: "You make every day special",
        x: 50,
        y: 58,
        fontSize: 17,
        color: "#fecdd3",
        italic: true,
      },
      { text: "XOXO", x: 50, y: 76, fontSize: 18, color: "#fff" },
    ],
    layoutType: "circular-badge",
    layoutColors: ["rgba(251,113,133,0.35)"],
  },
  // ── Baby Shower ──
  {
    id: "babyshower-1",
    name: "It's a Baby!",
    category: "Baby Shower",
    background:
      "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #7dd3fc 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Baby Shower!",
        x: 50,
        y: 35,
        fontSize: 38,
        color: "#0c4a6e",
        bold: true,
      },
      {
        text: "A new little star is arriving",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#075985",
        italic: true,
      },
      { text: "", x: 50, y: 76, fontSize: 18, color: "#0369a1" },
    ],
    layoutType: "banner-overlay",
    layoutColors: ["#60a5fa", "#eff6ff"],
  },
  {
    id: "babyshower-2",
    name: "Baby Girl",
    category: "Baby Shower",
    background:
      "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "It's a Girl!",
        x: 50,
        y: 33,
        fontSize: 38,
        color: "#9d174d",
        bold: true,
      },
      {
        text: "Welcome to the world, little one",
        x: 50,
        y: 56,
        fontSize: 16,
        color: "#be185d",
        italic: true,
      },
      { text: "With Love", x: 50, y: 76, fontSize: 15, color: "#db2777" },
    ],
    layoutType: "banner-overlay",
    layoutColors: ["#ec4899", "#fdf2f8"],
  },
  // ── Graduation ──
  {
    id: "graduation-1",
    name: "Congratulations Grad",
    category: "Graduation",
    background:
      "linear-gradient(135deg, #1f2937 0%, #111827 50%, #d4af37 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Congratulations!",
        x: 50,
        y: 30,
        fontSize: 36,
        color: "#fbbf24",
        bold: true,
      },
      { text: "Class of 2026", x: 50, y: 52, fontSize: 26, color: "#fff" },
      {
        text: "The future is yours",
        x: 50,
        y: 70,
        fontSize: 16,
        color: "#d4af37",
        italic: true,
      },
    ],
    decorStyle: "luxe",
    layoutType: "bold-header",
    layoutColors: ["#1e3a8a", "#d4af37"],
  },
  {
    id: "graduation-2",
    name: "Scholar's Pride",
    category: "Graduation",
    background:
      "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #60a5fa 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "We Did It!",
        x: 50,
        y: 30,
        fontSize: 44,
        color: "#fff",
        bold: true,
      },
      {
        text: "Graduating Class of 2026",
        x: 50,
        y: 54,
        fontSize: 17,
        color: "#bfdbfe",
      },
      {
        text: "Aim for the stars",
        x: 50,
        y: 72,
        fontSize: 16,
        color: "#93c5fd",
        italic: true,
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#1e3a5f", "#60a5fa"],
  },
  // ── Business / Professional ──
  {
    id: "business-1",
    name: "Professional Greeting",
    category: "Business",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Thank You",
        x: 50,
        y: 30,
        fontSize: 44,
        color: "#f1f5f9",
        bold: true,
      },
      {
        text: "for your partnership",
        x: 50,
        y: 52,
        fontSize: 20,
        color: "#94a3b8",
        italic: true,
      },
      {
        text: "We value your trust & collaboration",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#64748b",
      },
    ],
    decorStyle: "minimal",
    layoutType: "split-panel",
    layoutColors: ["#1e293b", "#334155"],
  },
  {
    id: "business-2",
    name: "Season's Greetings",
    category: "Business",
    background:
      "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #2dd4bf 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Season's Greetings",
        x: 50,
        y: 33,
        fontSize: 34,
        color: "#f0fdfa",
        bold: true,
      },
      {
        text: "Wishing you a prosperous year ahead",
        x: 50,
        y: 55,
        fontSize: 16,
        color: "#ccfbf1",
        italic: true,
      },
      {
        text: "~ With Warm Regards ~",
        x: 50,
        y: 74,
        fontSize: 14,
        color: "#99f6e4",
      },
    ],
    layoutType: "split-panel",
    layoutColors: ["#134e4a", "#0f766e"],
  },
  {
    id: "business-3",
    name: "Company Milestone",
    category: "Business",
    background:
      "linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #7c3aed 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Celebrating Success",
        x: 50,
        y: 30,
        fontSize: 34,
        color: "#ede9fe",
        bold: true,
      },
      {
        text: "Our Team's Achievement",
        x: 50,
        y: 52,
        fontSize: 18,
        color: "#ddd6fe",
      },
      {
        text: "Together we achieve more",
        x: 50,
        y: 70,
        fontSize: 16,
        color: "#c4b5fd",
        italic: true,
      },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#2e1065", "#7c3aed"],
  },
  // ── Get Well Soon ──
  {
    id: "getwellsoon-1",
    name: "Get Well Soon",
    category: "Get Well Soon",
    background:
      "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #6ee7b7 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Get Well Soon!",
        x: 50,
        y: 35,
        fontSize: 36,
        color: "#064e3b",
        bold: true,
      },
      {
        text: "Sending you healing thoughts",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#065f46",
        italic: true,
      },
      {
        text: "Speedy recovery",
        x: 50,
        y: 76,
        fontSize: 15,
        color: "#047857",
      },
    ],
    layoutType: "circular-badge",
    layoutColors: ["rgba(134,239,172,0.4)"],
  },
  // ── Diwali ──
  {
    id: "diwali-1",
    name: "Diwali Dhamaka",
    category: "Diwali",
    background:
      "linear-gradient(135deg, #1a0533 0%, #6b21a8 50%, #f59e0b 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Diwali!",
        x: 50,
        y: 32,
        fontSize: 38,
        color: "#fde68a",
        bold: true,
      },
      {
        text: "दीपावली की शुभकामनाएं",
        x: 50,
        y: 54,
        fontSize: 18,
        color: "#fcd34d",
      },
      {
        text: "May your life shine bright",
        x: 50,
        y: 72,
        fontSize: 15,
        color: "#fde68a",
        italic: true,
      },
    ],
    decorStyle: "sparkle",
    layoutType: "diagonal-split",
    layoutColors: ["#92400e", "#fef3c7"],
  },
  {
    id: "diwali-2",
    name: "Shubh Deepawali",
    category: "Diwali",
    background:
      "linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Shubh Deepawali",
        x: 50,
        y: 35,
        fontSize: 36,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Prosperity & joy to your home",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Light over darkness",
        x: 50,
        y: 75,
        fontSize: 14,
        color: "#fcd34d",
      },
    ],
    layoutType: "banner-overlay",
    layoutColors: ["#7c2d12", "#fef3c7"],
  },
  // ── Eid ──
  {
    id: "eid-1",
    name: "Eid Mubarak",
    category: "Eid",
    background:
      "linear-gradient(135deg, #0c2340 0%, #1a4f8a 50%, #d4af37 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Eid Mubarak",
        x: 50,
        y: 33,
        fontSize: 38,
        color: "#fde68a",
        bold: true,
      },
      { text: "عيد مبارك", x: 50, y: 54, fontSize: 24, color: "#d4af37" },
      {
        text: "May Allah bless you always",
        x: 50,
        y: 74,
        fontSize: 16,
        color: "#bfdbfe",
        italic: true,
      },
    ],
    decorStyle: "geometric",
    layoutType: "framed",
    layoutColors: ["#065f46", "#6ee7b7"],
  },
  {
    id: "eid-2",
    name: "Eid ul-Fitr",
    category: "Eid",
    background:
      "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #fde68a 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Eid ul-Fitr Mubarak",
        x: 50,
        y: 35,
        fontSize: 32,
        color: "#fff",
        bold: true,
      },
      {
        text: "May Allah's blessings be with you",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Peace & Blessings",
        x: 50,
        y: 76,
        fontSize: 14,
        color: "#fef9c3",
      },
    ],
    layoutType: "framed",
    layoutColors: ["#065f46", "#fde68a"],
  },
  // ── Christmas ──
  {
    id: "christmas-1",
    name: "Winter Wishes",
    category: "Christmas",
    background:
      "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #4a90c4 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Season's Greetings",
        x: 50,
        y: 30,
        fontSize: 34,
        color: "#fff",
        bold: true,
      },
      {
        text: "Wishing you warmth & joy",
        x: 50,
        y: 52,
        fontSize: 16,
        color: "#c8e6ff",
      },
      {
        text: "Have a Merry Christmas!",
        x: 50,
        y: 70,
        fontSize: 17,
        color: "#e8f4ff",
        italic: true,
      },
    ],
    layoutType: "split-panel",
    layoutColors: ["#991b1b", "#065f46"],
  },
  {
    id: "christmas-2",
    name: "Merry Christmas",
    category: "Christmas",
    background: "linear-gradient(135deg, #c41e3a 0%, #228b22 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Merry Christmas!",
        x: 50,
        y: 33,
        fontSize: 38,
        color: "#ffe066",
        bold: true,
      },
      {
        text: "May your days be merry",
        x: 50,
        y: 56,
        fontSize: 17,
        color: "#fff8dc",
      },
      { text: "Ho Ho Ho!", x: 50, y: 75, fontSize: 18, color: "#fff" },
    ],
    layoutType: "split-panel",
    layoutColors: ["#991b1b", "#228b22"],
  },
  // ── New Year ──
  {
    id: "newyear-1",
    name: "New Year's Eve",
    category: "New Year",
    background:
      "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy New Year!",
        x: 50,
        y: 33,
        fontSize: 38,
        color: "#fde68a",
        bold: true,
      },
      {
        text: "2026",
        x: 50,
        y: 56,
        fontSize: 48,
        color: "rgba(255,255,255,0.15)",
        bold: true,
      },
      {
        text: "Cheers to a brand new chapter",
        x: 50,
        y: 76,
        fontSize: 15,
        color: "#e9d5ff",
        italic: true,
      },
    ],
    decorStyle: "sparkle",
    layoutType: "bold-header",
    layoutColors: ["#1a1a2e", "#ffd700"],
  },
  {
    id: "newyear-2",
    name: "New Year Wishes",
    category: "New Year",
    background:
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Welcome 2026!",
        x: 50,
        y: 35,
        fontSize: 36,
        color: "#fff",
        bold: true,
      },
      {
        text: "New year, new beginnings",
        x: 50,
        y: 57,
        fontSize: 18,
        color: "#93c5fd",
        italic: true,
      },
      {
        text: "Make it count",
        x: 50,
        y: 76,
        fontSize: 14,
        color: "#60a5fa",
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#1a1a2e", "#93c5fd"],
  },
  // ── Holi ──
  {
    id: "holi-1",
    name: "Happy Holi",
    category: "Holi",
    background:
      "linear-gradient(135deg, #f43f5e 0%, #a855f7 33%, #3b82f6 66%, #22c55e 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Holi!",
        x: 50,
        y: 35,
        fontSize: 40,
        color: "#fff",
        bold: true,
      },
      {
        text: "Colors of joy and love",
        x: 50,
        y: 57,
        fontSize: 18,
        color: "#fef9c3",
        italic: true,
      },
      {
        text: "Rang Birangi Khushiyan",
        x: 50,
        y: 76,
        fontSize: 13,
        color: "#fff",
      },
    ],
    layoutType: "corner-block",
    layoutColors: ["rgba(251,191,36,0.5)"],
  },
  {
    id: "holi-2",
    name: "Rang Barse",
    category: "Holi",
    background:
      "linear-gradient(135deg, #ec4899 0%, #f97316 50%, #facc15 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Rang Barse",
        x: 50,
        y: 35,
        fontSize: 40,
        color: "#fff",
        bold: true,
      },
      {
        text: "Splash into happiness",
        x: 50,
        y: 57,
        fontSize: 18,
        color: "#fef9c3",
        italic: true,
      },
      {
        text: "Play of colours",
        x: 50,
        y: 76,
        fontSize: 14,
        color: "#fff",
      },
    ],
    layoutType: "corner-block",
    layoutColors: ["rgba(251,191,36,0.45)"],
  },
  // ── Navratri ──
  {
    id: "navratri-1",
    name: "Happy Navratri",
    category: "Navratri",
    background:
      "linear-gradient(135deg, #e65c00 0%, #b91c1c 50%, #991b1b 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Navratri",
        x: 30,
        y: 25,
        fontSize: 36,
        color: "#fff",
        bold: true,
      },
      {
        text: "Jai Mata Di",
        x: 30,
        y: 50,
        fontSize: 22,
        color: "#fde68a",
        bold: true,
      },
      {
        text: "Nine Nights of Devotion",
        x: 30,
        y: 72,
        fontSize: 13,
        color: "#fecaca",
        italic: true,
      },
    ],
    decorStyle: "navratri",
    layoutType: "bold-header",
    layoutColors: ["#991b1b", "#f59e0b"],
  },
  {
    id: "navratri-2",
    name: "Navratri Celebration",
    category: "Navratri",
    background:
      "linear-gradient(135deg, #7f1d1d 0%, #991b1b 40%, #b45309 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Navratri Celebration",
        x: 30,
        y: 22,
        fontSize: 28,
        color: "#fbbf24",
        bold: true,
      },
      {
        text: "Jai Mata Di",
        x: 30,
        y: 47,
        fontSize: 20,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Goddess Durga Ki Jai",
        x: 30,
        y: 70,
        fontSize: 13,
        color: "#fecaca",
      },
    ],
    decorStyle: "navratri",
    layoutType: "bold-header",
    layoutColors: ["#7f1d1d", "#f59e0b"],
  },
  // ── Halloween ──
  {
    id: "halloween-1",
    name: "Happy Halloween",
    category: "Halloween",
    background:
      "linear-gradient(135deg, #1c1917 0%, #292524 50%, #ea580c 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Halloween!",
        x: 50,
        y: 35,
        fontSize: 34,
        color: "#fed7aa",
        bold: true,
      },
      {
        text: "Tricks and treats await",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#fdba74",
        italic: true,
      },
      { text: "BOO!", x: 50, y: 76, fontSize: 20, color: "#f97316" },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#1c1917", "#451a03"],
  },
  // ── Mother's Day ──
  {
    id: "mothers-day-1",
    name: "Happy Mother's Day",
    category: "Mother's Day",
    background:
      "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #e879f9 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Mother's Day",
        x: 50,
        y: 33,
        fontSize: 30,
        color: "#701a75",
        bold: true,
      },
      {
        text: "Thank you for everything, Mom",
        x: 50,
        y: 55,
        fontSize: 18,
        color: "#86198f",
        italic: true,
      },
      {
        text: "You're our world",
        x: 50,
        y: 75,
        fontSize: 15,
        color: "#a21caf",
      },
    ],
    layoutType: "framed",
    layoutColors: ["#be185d", "#fce7f3"],
  },
  // ── Father's Day ──
  {
    id: "fathers-day-1",
    name: "Happy Father's Day",
    category: "Father's Day",
    background:
      "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #60a5fa 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Father's Day",
        x: 50,
        y: 33,
        fontSize: 30,
        color: "#fff",
        bold: true,
      },
      {
        text: "The best dad in the world",
        x: 50,
        y: 55,
        fontSize: 18,
        color: "#bfdbfe",
        italic: true,
      },
      {
        text: "Our hero, always",
        x: 50,
        y: 76,
        fontSize: 15,
        color: "#93c5fd",
      },
    ],
    layoutType: "framed",
    layoutColors: ["#1e3a8a", "#dbeafe"],
  },
  // ── Raksha Bandhan ──
  {
    id: "rakhi-1",
    name: "Happy Rakhi",
    category: "Raksha Bandhan",
    background:
      "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Raksha Bandhan",
        x: 50,
        y: 35,
        fontSize: 28,
        color: "#9d174d",
        bold: true,
      },
      {
        text: "Celebrating the bond of love",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#be185d",
        italic: true,
      },
      {
        text: "Always there for you",
        x: 50,
        y: 76,
        fontSize: 14,
        color: "#db2777",
      },
    ],
    layoutType: "banner-overlay",
    layoutColors: ["#7c2d12", "#fef3c7"],
  },
  // ── Ganesh Chaturthi ──
  {
    id: "ganesh-1",
    name: "Ganpati Bappa",
    category: "Ganesh Chaturthi",
    background:
      "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #f59e0b 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Ganpati Bappa Morya!",
        x: 50,
        y: 35,
        fontSize: 28,
        color: "#78350f",
        bold: true,
      },
      {
        text: "May Lord Ganesha bless you",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#92400e",
        italic: true,
      },
      { text: "Shubh Labh", x: 50, y: 76, fontSize: 15, color: "#78350f" },
    ],
    layoutType: "bold-header",
    layoutColors: ["#d97706", "#fef3c7"],
  },
  // ── Onam ──
  {
    id: "onam-1",
    name: "Happy Onam",
    decorStyle: "botanical",
    category: "Onam",
    background:
      "linear-gradient(135deg, #065f46 0%, #059669 50%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Onam",
        x: 50,
        y: 35,
        fontSize: 36,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Prosperity and harvest blessings",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Thrikkakara Appan bless you",
        x: 50,
        y: 76,
        fontSize: 13,
        color: "#fef9c3",
      },
    ],
    layoutType: "split-panel",
    layoutColors: ["#065f46", "#fef3c7"],
  },
  // ── Baisakhi ──
  {
    id: "baisakhi-1",
    name: "Happy Baisakhi",
    decorStyle: "botanical",
    category: "Baisakhi",
    background:
      "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Baisakhi!",
        x: 50,
        y: 35,
        fontSize: 36,
        color: "#fff",
        bold: true,
      },
      {
        text: "Harvest blessings and joy",
        x: 50,
        y: 57,
        fontSize: 17,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Bhangra & Giddha",
        x: 50,
        y: 76,
        fontSize: 14,
        color: "#fef9c3",
      },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#d97706", "#fef3c7"],
  },
  // ── Blank ──
  // ── Lohri ──
  {
    id: "lohri-1",
    name: "Happy Lohri",
    decorStyle: "geometric",
    category: "Lohri",
    background:
      "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #f97316 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Lohri!",
        x: 50,
        y: 32,
        fontSize: 38,
        color: "#fef3c7",
        bold: true,
      },
      {
        text: "May the bonfire light up your life",
        x: 50,
        y: 55,
        fontSize: 15,
        color: "#fed7aa",
        italic: true,
      },
      { text: "Lohri Mubarak", x: 50, y: 74, fontSize: 14, color: "#fde68a" },
    ],
    layoutType: "bold-header",
    layoutColors: ["#9a3412", "#fff7ed"],
  },
  {
    id: "lohri-2",
    name: "Lohri Bonfire",
    decorStyle: "geometric",
    category: "Lohri",
    background:
      "linear-gradient(160deg, #1c1917 0%, #7c2d12 60%, #ea580c 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Lohri Celebrations",
        x: 50,
        y: 30,
        fontSize: 30,
        color: "#fde68a",
        bold: true,
      },
      {
        text: "Dance, Sing & Celebrate",
        x: 50,
        y: 52,
        fontSize: 16,
        color: "#fdba74",
        italic: true,
      },
      {
        text: "With warmth and joy",
        x: 50,
        y: 70,
        fontSize: 13,
        color: "#fed7aa",
      },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#c2410c", "#fff7ed"],
  },
  // ── Pongal ──
  {
    id: "pongal-1",
    name: "Happy Pongal",
    decorStyle: "botanical",
    category: "Pongal",
    background:
      "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Pongal!",
        x: 50,
        y: 32,
        fontSize: 38,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Pongalo Pongal!",
        x: 50,
        y: 53,
        fontSize: 18,
        color: "#d9f99d",
        italic: true,
      },
      {
        text: "Harvest Blessings",
        x: 50,
        y: 72,
        fontSize: 14,
        color: "#bbf7d0",
      },
    ],
    layoutType: "split-panel",
    layoutColors: ["#166534", "#fef9c3"],
  },
  {
    id: "pongal-2",
    name: "Pongal Harvest",
    decorStyle: "botanical",
    category: "Pongal",
    background:
      "linear-gradient(145deg, #fef3c7 0%, #fde68a 40%, #16a34a 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Iniya Pongal!",
        x: 50,
        y: 30,
        fontSize: 28,
        color: "#14532d",
        bold: true,
      },
      {
        text: "May prosperity fill your home",
        x: 50,
        y: 52,
        fontSize: 15,
        color: "#166534",
        italic: true,
      },
      { text: "Thai Pongal", x: 50, y: 70, fontSize: 14, color: "#15803d" },
    ],
    layoutType: "framed-border",
    layoutColors: ["#15803d", "#fef9c3"],
  },
  // ── Makar Sankranti ──
  {
    id: "makar-sankranti-1",
    name: "Makar Sankranti",
    decorStyle: "geometric",
    category: "Makar Sankranti",
    background:
      "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 40%, #f59e0b 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Makar Sankranti!",
        x: 50,
        y: 30,
        fontSize: 24,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Fly your kites high!",
        x: 50,
        y: 52,
        fontSize: 18,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Til Gud Ghya, God God Bola",
        x: 50,
        y: 70,
        fontSize: 13,
        color: "#fef3c7",
      },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#2563eb", "#fef3c7"],
  },
  // ── Janmashtami ──
  {
    id: "janmashtami-1",
    name: "Happy Janmashtami",
    decorStyle: "geometric",
    category: "Janmashtami",
    background:
      "linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Janmashtami!",
        x: 50,
        y: 30,
        fontSize: 30,
        color: "#fde68a",
        bold: true,
      },
      {
        text: "Jai Shri Krishna",
        x: 50,
        y: 52,
        fontSize: 20,
        color: "#c7d2fe",
        italic: true,
      },
      {
        text: "Nand Ghar Anand Bhayo",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#e0e7ff",
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#312e81", "#fef3c7"],
  },
  {
    id: "janmashtami-2",
    name: "Govinda Aala Re",
    decorStyle: "geometric",
    category: "Janmashtami",
    background:
      "linear-gradient(145deg, #fef3c7 0%, #fde68a 30%, #1e40af 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Dahi Handi Celebration",
        x: 50,
        y: 30,
        fontSize: 24,
        color: "#1e1b4b",
        bold: true,
      },
      {
        text: "Govinda Aala Re!",
        x: 50,
        y: 52,
        fontSize: 20,
        color: "#1e40af",
        italic: true,
      },
      {
        text: "Break the Handi!",
        x: 50,
        y: 70,
        fontSize: 15,
        color: "#1d4ed8",
      },
    ],
    layoutType: "split-panel",
    layoutColors: ["#1e40af", "#fef9c3"],
  },
  // ── Durga Puja ──
  {
    id: "durga-puja-1",
    name: "Shubho Durga Puja",
    decorStyle: "geometric",
    category: "Durga Puja",
    background:
      "linear-gradient(135deg, #7f1d1d 0%, #dc2626 40%, #f59e0b 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Shubho Durga Puja!",
        x: 50,
        y: 30,
        fontSize: 28,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Ma Durga Blesses You",
        x: 50,
        y: 52,
        fontSize: 17,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Asche Bochor Abar Hobe",
        x: 50,
        y: 70,
        fontSize: 13,
        color: "#fed7aa",
      },
    ],
    layoutType: "framed-border",
    layoutColors: ["#b91c1c", "#fef9c3"],
  },
  {
    id: "durga-puja-2",
    name: "Maa Durga Celebration",
    decorStyle: "geometric",
    category: "Durga Puja",
    background:
      "linear-gradient(145deg, #fef3c7 0%, #fde68a 30%, #dc2626 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Navami!",
        x: 50,
        y: 30,
        fontSize: 36,
        color: "#7f1d1d",
        bold: true,
      },
      {
        text: "Victory of Good over Evil",
        x: 50,
        y: 52,
        fontSize: 15,
        color: "#991b1b",
        italic: true,
      },
      { text: "Jai Maa Durga", x: 50, y: 70, fontSize: 16, color: "#b91c1c" },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#dc2626", "#fef9c3"],
  },
  // ── Karva Chauth ──
  {
    id: "karva-chauth-1",
    name: "Karva Chauth",
    decorStyle: "botanical",
    category: "Karva Chauth",
    background:
      "linear-gradient(135deg, #831843 0%, #be185d 50%, #f9a8d4 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Karva Chauth!",
        x: 50,
        y: 30,
        fontSize: 28,
        color: "#fff1f2",
        bold: true,
      },
      {
        text: "Love Eternal and Pure",
        x: 50,
        y: 52,
        fontSize: 18,
        color: "#fce7f3",
        italic: true,
      },
      {
        text: "Karva Chauth Mubarak",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#fbcfe8",
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#9d174d", "#fff1f2"],
  },
  // ── Chhath Puja ──
  {
    id: "chhath-puja-1",
    name: "Chhath Puja",
    decorStyle: "botanical",
    category: "Chhath Puja",
    background:
      "linear-gradient(135deg, #7c2d12 0%, #ea580c 40%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Chhath Puja!",
        x: 50,
        y: 30,
        fontSize: 32,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Jai Chhathi Maiya",
        x: 50,
        y: 52,
        fontSize: 18,
        color: "#fed7aa",
        italic: true,
      },
      {
        text: "Sun God Blessings",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#fde68a",
      },
    ],
    layoutType: "split-panel",
    layoutColors: ["#c2410c", "#fef9c3"],
  },
  // ── Basant Panchami ──
  {
    id: "basant-panchami-1",
    name: "Basant Panchami",
    decorStyle: "botanical",
    category: "Basant Panchami",
    background:
      "linear-gradient(135deg, #fef08a 0%, #fbbf24 40%, #65a30d 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Basant Panchami!",
        x: 50,
        y: 30,
        fontSize: 22,
        color: "#713f12",
        bold: true,
      },
      {
        text: "Saraswati Puja Greetings",
        x: 50,
        y: 52,
        fontSize: 16,
        color: "#78350f",
        italic: true,
      },
      {
        text: "Jai Maa Saraswati",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#92400e",
      },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#ca8a04", "#fefce8"],
  },
  // ── Ugadi ──
  {
    id: "ugadi-1",
    name: "Happy Ugadi",
    decorStyle: "botanical",
    category: "Ugadi",
    background:
      "linear-gradient(135deg, #14532d 0%, #15803d 40%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Ugadi!",
        x: 50,
        y: 30,
        fontSize: 38,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Telugu New Year Greetings",
        x: 50,
        y: 52,
        fontSize: 14,
        color: "#d9f99d",
        italic: true,
      },
      {
        text: "Ugadi Subhakankshalu",
        x: 50,
        y: 70,
        fontSize: 13,
        color: "#bbf7d0",
      },
    ],
    layoutType: "framed-border",
    layoutColors: ["#166534", "#fef9c3"],
  },
  // ── Vishu ──
  {
    id: "vishu-1",
    name: "Happy Vishu",
    decorStyle: "botanical",
    category: "Vishu",
    background:
      "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #fde68a 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Vishu!",
        x: 50,
        y: 32,
        fontSize: 38,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Vishu Ashamsakal",
        x: 50,
        y: 53,
        fontSize: 18,
        color: "#d9f99d",
        italic: true,
      },
      {
        text: "Kerala New Year Greetings",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#bbf7d0",
      },
    ],
    layoutType: "split-panel",
    layoutColors: ["#15803d", "#fefce8"],
  },
  // ── Eid ul-Adha ──
  {
    id: "eid-adha-1",
    name: "Eid ul-Adha Mubarak",
    decorStyle: "geometric",
    category: "Eid",
    background:
      "linear-gradient(135deg, #064e3b 0%, #059669 50%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Eid ul-Adha Mubarak!",
        x: 50,
        y: 30,
        fontSize: 26,
        color: "#ecfdf5",
        bold: true,
      },
      {
        text: "Bakrid Mubarak",
        x: 50,
        y: 52,
        fontSize: 18,
        color: "#d1fae5",
        italic: true,
      },
      {
        text: "May Allah Accept Your Prayers",
        x: 50,
        y: 70,
        fontSize: 13,
        color: "#a7f3d0",
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#065f46", "#ecfdf5"],
  },
  // ── Thanksgiving ──
  {
    id: "thanksgiving-1",
    name: "Happy Thanksgiving",
    decorStyle: "botanical",
    category: "Thanksgiving",
    background:
      "linear-gradient(135deg, #7c2d12 0%, #b45309 50%, #fbbf24 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Thanksgiving!",
        x: 50,
        y: 30,
        fontSize: 28,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Grateful for Everything",
        x: 50,
        y: 52,
        fontSize: 17,
        color: "#fde68a",
        italic: true,
      },
      { text: "Give Thanks", x: 50, y: 70, fontSize: 16, color: "#fed7aa" },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#92400e", "#fef9c3"],
  },
  // ── Easter ──
  {
    id: "easter-1",
    name: "Happy Easter",
    decorStyle: "botanical",
    category: "Easter",
    background:
      "linear-gradient(135deg, #f0abfc 0%, #86efac 40%, #fde68a 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Easter!",
        x: 50,
        y: 32,
        fontSize: 38,
        color: "#581c87",
        bold: true,
      },
      {
        text: "He is Risen!",
        x: 50,
        y: 53,
        fontSize: 20,
        color: "#3b0764",
        italic: true,
      },
      {
        text: "Easter Blessings to You",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#4a044e",
      },
    ],
    layoutType: "framed-border",
    layoutColors: ["#a855f7", "#fefce8"],
  },
  // ── Maha Shivratri ──
  {
    id: "shivratri-1",
    name: "Maha Shivratri",
    decorStyle: "geometric",
    category: "Maha Shivratri",
    background:
      "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Maha Shivratri!",
        x: 50,
        y: 30,
        fontSize: 34,
        color: "#e9d5ff",
        bold: true,
      },
      {
        text: "Har Har Mahadev",
        x: 50,
        y: 52,
        fontSize: 20,
        color: "#ddd6fe",
        italic: true,
      },
      {
        text: "Om Namah Shivaya",
        x: 50,
        y: 70,
        fontSize: 15,
        color: "#c4b5fd",
      },
    ],
    layoutType: "bold-header",
    layoutColors: ["#3b0764", "#ede9fe"],
  },
  // ── Ram Navami ──
  {
    id: "ram-navami-1",
    name: "Ram Navami",
    decorStyle: "geometric",
    category: "Ram Navami",
    background:
      "linear-gradient(135deg, #fef3c7 0%, #f59e0b 40%, #b45309 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Happy Ram Navami!",
        x: 50,
        y: 30,
        fontSize: 30,
        color: "#1c1917",
        bold: true,
      },
      {
        text: "Jai Shri Ram",
        x: 50,
        y: 52,
        fontSize: 22,
        color: "#3b0764",
        italic: true,
      },
      {
        text: "Shri Ram Blesses You",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#44403c",
      },
    ],
    layoutType: "diagonal-split",
    layoutColors: ["#d97706", "#fef9c3"],
  },
  // ── Hanuman Jayanti ──
  {
    id: "hanuman-jayanti-1",
    name: "Hanuman Jayanti",
    decorStyle: "geometric",
    category: "Hanuman Jayanti",
    background:
      "linear-gradient(135deg, #7c2d12 0%, #dc2626 40%, #f59e0b 100%)",
    backgroundType: "gradient",
    previewElements: [
      {
        text: "Hanuman Jayanti!",
        x: 50,
        y: 30,
        fontSize: 32,
        color: "#fef9c3",
        bold: true,
      },
      {
        text: "Jai Bajrang Bali",
        x: 50,
        y: 52,
        fontSize: 20,
        color: "#fde68a",
        italic: true,
      },
      {
        text: "Om Hanumate Namah",
        x: 50,
        y: 70,
        fontSize: 14,
        color: "#fed7aa",
      },
    ],
    layoutType: "framed-border",
    layoutColors: ["#b91c1c", "#fef9c3"],
  },
  {
    id: "blank-1",
    name: "Blank Canvas",
    category: "Blank",
    background: "#ffffff",
    backgroundType: "solid",
    previewElements: [
      {
        text: "Your Message Here",
        x: 50,
        y: 48,
        fontSize: 28,
        color: "#aaa",
        italic: true,
      },
    ],
  },
];

const BACKGROUND_COLORS = [
  "#ffffff",
  "#fff5f5",
  "#fff0e6",
  "#fffff0",
  "#f0fff4",
  "#e6f7ff",
  "#f3e8ff",
  "#fce7f3",
  "#ecfdf5",
  "#1a1a2e",
  "#16213e",
  "#0f3460",
];

const BACKGROUND_GRADIENTS = [
  {
    id: "pink-rose",
    value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  },
  {
    id: "purple-pink",
    value: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  },
  {
    id: "orange-gold",
    value: "linear-gradient(135deg, #fda085 0%, #f6d365 100%)",
  },
  {
    id: "green-blue",
    value: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  },
  {
    id: "blue-sky",
    value: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  },
  {
    id: "lime-green",
    value: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  },
  {
    id: "magenta-red",
    value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: "blue-cyan",
    value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: "teal-mint",
    value: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
  {
    id: "pink-yellow",
    value: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    id: "navy-blue",
    value: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  },
  {
    id: "red-green",
    value: "linear-gradient(135deg, #c41e3a 0%, #228b22 100%)",
  },
];

const CARD_PATTERNS: {
  id: string;
  label: string;
  css: (c: string) => string;
}[] = [
  {
    id: "dots",
    label: "Dots",
    css: (c) =>
      `radial-gradient(circle, ${c} 15%, transparent 16%), radial-gradient(circle, ${c} 15%, transparent 16%)`,
  },
  {
    id: "stripes",
    label: "Stripes",
    css: (c) =>
      `repeating-linear-gradient(45deg, ${c} 0px, ${c} 4px, transparent 4px, transparent 20px)`,
  },
  {
    id: "grid",
    label: "Grid",
    css: (c) =>
      `repeating-linear-gradient(0deg, ${c} 0, ${c} 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, ${c} 0, ${c} 1px, transparent 1px, transparent 24px)`,
  },
  {
    id: "zigzag",
    label: "Zigzag",
    css: (c) =>
      `linear-gradient(135deg, ${c} 25%, transparent 25%) -20px 0, linear-gradient(225deg, ${c} 25%, transparent 25%) -20px 0, linear-gradient(315deg, ${c} 25%, transparent 25%), linear-gradient(45deg, ${c} 25%, transparent 25%)`,
  },
  {
    id: "diamonds",
    label: "Diamonds",
    css: (c) =>
      `repeating-linear-gradient(45deg, ${c} 0, ${c} 2px, transparent 2px, transparent 14px), repeating-linear-gradient(-45deg, ${c} 0, ${c} 2px, transparent 2px, transparent 14px)`,
  },
  {
    id: "stars",
    label: "Stars",
    css: (c) =>
      `radial-gradient(circle at 50% 50%, ${c} 2px, transparent 3px), radial-gradient(circle at 0% 50%, ${c} 1px, transparent 2px), radial-gradient(circle at 100% 50%, ${c} 1px, transparent 2px)`,
  },
  {
    id: "confetti",
    label: "Confetti",
    css: (c) =>
      `repeating-linear-gradient(60deg, ${c} 0, ${c} 2px, transparent 2px, transparent 18px), repeating-linear-gradient(-60deg, ${c} 0, ${c} 2px, transparent 2px, transparent 18px), repeating-linear-gradient(0deg, ${c} 0, ${c} 2px, transparent 2px, transparent 18px)`,
  },
  {
    id: "marble",
    label: "Marble",
    css: (c) =>
      `repeating-radial-gradient(circle at 20% 30%, transparent 0, transparent 18px, ${c} 19px, transparent 20px), repeating-linear-gradient(135deg, ${c}22, transparent 40px)`,
  },
];

type GraphicItem = {
  category: string;
  id: string;
  label: string;
  svgPath: string;
  color: string;
};

const GRAPHICS: GraphicItem[] = [
  // Celebrations
  {
    category: "Celebrations",
    id: "party-popper",
    label: "Party Popper",
    color: "#f59e0b",
    svgPath:
      "M 10 90 L 35 45 L 25 35 L 70 10 L 90 30 L 65 75 Z M 35 45 L 55 55 M 70 10 L 80 5 L 90 15",
  },
  {
    category: "Celebrations",
    id: "confetti-burst",
    label: "Confetti",
    color: "#ec4899",
    svgPath:
      "M 50 10 L 55 40 L 80 20 L 65 50 L 90 55 L 60 65 L 70 90 L 45 72 L 30 95 L 35 68 L 10 75 L 30 55 L 5 45 L 35 42 L 20 18 Z",
  },
  {
    category: "Celebrations",
    id: "balloon",
    label: "Balloon",
    color: "#ef4444",
    svgPath:
      "M 50 10 C 25 10 10 28 10 48 C 10 68 28 82 50 82 C 72 82 90 68 90 48 C 90 28 75 10 50 10 Z M 50 82 L 46 95 M 42 92 L 50 82 L 58 92",
  },
  {
    category: "Celebrations",
    id: "stars-burst",
    label: "Stars",
    color: "#d4af37",
    svgPath:
      "M 50 5 L 56 36 L 88 36 L 63 55 L 73 85 L 50 66 L 27 85 L 37 55 L 12 36 L 44 36 Z",
  },
  {
    category: "Celebrations",
    id: "gift-box",
    label: "Gift Box",
    color: "#8b5cf6",
    svgPath:
      "M 15 40 L 15 85 L 85 85 L 85 40 Z M 10 25 L 90 25 L 90 40 L 10 40 Z M 50 25 L 50 85 M 35 25 C 35 15 50 15 50 25 M 65 25 C 65 15 50 15 50 25",
  },
  {
    category: "Celebrations",
    id: "trophy",
    label: "Trophy",
    color: "#d4af37",
    svgPath:
      "M 30 10 L 30 55 C 30 70 70 70 70 55 L 70 10 Z M 15 10 L 30 10 C 30 30 20 40 15 35 Z M 85 10 L 70 10 C 70 30 80 40 85 35 Z M 40 70 L 40 80 L 60 80 L 60 70 M 30 80 L 70 80 L 70 90 L 30 90 Z",
  },
  {
    category: "Celebrations",
    id: "medal",
    label: "Medal",
    color: "#d4af37",
    svgPath:
      "M 35 5 L 65 5 L 58 35 C 75 40 85 55 85 72 C 85 87 68 97 50 97 C 32 97 15 87 15 72 C 15 55 25 40 42 35 Z M 50 55 L 54 67 L 67 67 L 57 75 L 61 87 L 50 80 L 39 87 L 43 75 L 33 67 L 46 67 Z",
  },
  {
    category: "Celebrations",
    id: "champagne",
    label: "Champagne",
    color: "#d4af37",
    svgPath:
      "M 40 10 L 60 10 L 65 40 L 75 40 L 75 55 L 65 55 L 65 80 L 35 80 L 35 55 L 25 55 L 25 40 L 35 40 Z M 45 80 L 40 90 L 60 90 L 55 80",
  },
  // Nature
  {
    category: "Nature",
    id: "cherry-blossom",
    label: "Blossom",
    color: "#f9a8d4",
    svgPath:
      "M 50 30 C 60 10 75 15 70 28 C 82 20 90 30 80 38 C 90 42 88 56 76 50 C 80 62 70 68 62 60 C 58 72 42 72 38 60 C 30 68 20 62 24 50 C 12 56 10 42 20 38 C 10 30 18 20 30 28 C 25 15 40 10 50 30 Z",
  },
  {
    category: "Nature",
    id: "sunflower",
    label: "Sunflower",
    color: "#f59e0b",
    svgPath:
      "M 50 20 L 53 35 L 65 25 L 57 38 L 72 35 L 62 46 L 78 50 L 62 54 L 72 65 L 57 62 L 65 75 L 53 65 L 50 80 L 47 65 L 35 75 L 43 62 L 28 65 L 38 54 L 22 50 L 38 46 L 28 35 L 43 38 L 35 25 L 47 35 Z M 50 36 C 58 36 64 42 64 50 C 64 58 58 64 50 64 C 42 64 36 58 36 50 C 36 42 42 36 50 36 Z",
  },
  {
    category: "Nature",
    id: "leaf",
    label: "Leaf",
    color: "#22c55e",
    svgPath:
      "M 50 90 C 20 70 10 40 25 15 C 40 5 65 10 80 25 C 90 40 85 70 50 90 Z M 50 90 L 50 30 M 50 60 L 30 45 M 50 50 L 70 35",
  },
  {
    category: "Nature",
    id: "clover",
    label: "Clover",
    color: "#16a34a",
    svgPath:
      "M 50 50 C 50 30 30 20 30 38 C 20 30 15 50 32 55 C 15 57 20 75 32 65 C 30 82 50 80 50 65 C 50 80 70 82 68 65 C 80 75 85 57 68 55 C 85 50 80 30 70 38 C 70 20 50 30 50 50 Z M 50 65 L 50 90 L 40 90 L 60 90",
  },
  {
    category: "Nature",
    id: "rainbow",
    label: "Rainbow",
    color: "#ef4444",
    svgPath:
      "M 10 75 C 10 38 38 12 75 12 C 88 12 92 18 88 22 C 82 22 75 22 75 22 C 50 22 32 40 32 65 L 10 75 Z",
  },
  {
    category: "Nature",
    id: "moon-star",
    label: "Moon",
    color: "#fbbf24",
    svgPath:
      "M 65 15 C 50 15 35 28 35 48 C 35 68 50 82 65 85 C 40 85 15 68 15 48 C 15 28 38 12 65 15 Z M 75 25 L 77 31 L 83 31 L 78 35 L 80 41 L 75 37 L 70 41 L 72 35 L 67 31 L 73 31 Z",
  },
  {
    category: "Nature",
    id: "sun",
    label: "Sun",
    color: "#f59e0b",
    svgPath:
      "M 50 15 L 50 5 M 50 95 L 50 85 M 85 50 L 95 50 M 5 50 L 15 50 M 74 26 L 81 19 M 19 81 L 26 74 M 74 74 L 81 81 M 19 19 L 26 26 M 50 25 C 64 25 75 36 75 50 C 75 64 64 75 50 75 C 36 75 25 64 25 50 C 25 36 36 25 50 25 Z",
  },
  {
    category: "Nature",
    id: "snowflake",
    label: "Snowflake",
    color: "#93c5fd",
    svgPath:
      "M 50 5 L 50 95 M 5 50 L 95 50 M 19 19 L 81 81 M 81 19 L 19 81 M 50 20 L 44 28 M 50 20 L 56 28 M 50 80 L 44 72 M 50 80 L 56 72 M 20 50 L 28 44 M 20 50 L 28 56 M 80 50 L 72 44 M 80 50 L 72 56",
  },
  // Love
  {
    category: "Love",
    id: "heart",
    label: "Heart",
    color: "#ef4444",
    svgPath:
      "M 50 85 C 10 55 0 30 15 17 C 28 5 50 20 50 20 C 50 20 72 5 85 17 C 100 30 90 55 50 85 Z",
  },
  {
    category: "Love",
    id: "double-heart",
    label: "Double Heart",
    color: "#f9a8d4",
    svgPath:
      "M 35 70 C 8 52 2 33 12 22 C 20 12 36 22 36 22 C 36 22 52 12 60 22 C 70 33 64 52 35 70 Z M 58 58 C 42 48 38 36 44 28 C 49 21 58 28 58 28 C 58 28 67 21 72 28 C 78 36 74 48 58 58 Z",
  },
  {
    category: "Love",
    id: "rose",
    label: "Rose",
    color: "#dc2626",
    svgPath:
      "M 50 60 C 30 55 20 40 30 28 C 38 18 50 25 50 35 C 50 25 62 18 70 28 C 80 40 70 55 50 60 Z M 50 60 L 50 90 M 35 75 L 50 60 M 65 75 L 50 60",
  },
  {
    category: "Love",
    id: "envelope",
    label: "Envelope",
    color: "#ec4899",
    svgPath: "M 10 25 L 90 25 L 90 80 L 10 80 Z M 10 25 L 50 55 L 90 25",
  },
  {
    category: "Love",
    id: "infinity",
    label: "Infinity",
    color: "#8b5cf6",
    svgPath:
      "M 30 50 C 30 35 15 28 8 38 C 2 48 8 62 20 62 C 32 62 38 50 50 50 C 62 50 68 62 80 62 C 92 62 98 48 92 38 C 85 28 70 35 70 50 C 70 65 62 50 50 50 C 38 50 32 65 30 50 Z",
  },
  {
    category: "Love",
    id: "wedding-rings",
    label: "Rings",
    color: "#d4af37",
    svgPath:
      "M 30 50 C 30 38 38 30 50 30 C 62 30 70 38 70 50 C 70 62 62 70 50 70 C 38 70 30 62 30 50 Z M 50 50 C 50 38 58 30 70 30 C 82 30 90 38 90 50 C 90 62 82 70 70 70 C 58 70 50 62 50 50 Z",
  },
  {
    category: "Love",
    id: "butterfly-love",
    label: "Butterfly",
    color: "#a855f7",
    svgPath:
      "M 50 50 C 30 30 5 15 10 35 C 15 52 35 52 50 50 C 65 52 85 52 90 35 C 95 15 70 30 50 50 Z M 50 50 C 30 65 10 78 15 65 C 20 52 40 52 50 50 C 60 52 80 52 85 65 C 90 78 70 65 50 50 Z M 48 48 L 48 40 M 52 40 L 52 48",
  },
  // Food
  {
    category: "Food",
    id: "birthday-cake",
    label: "Cake",
    color: "#f472b6",
    svgPath:
      "M 20 40 L 20 75 L 80 75 L 80 40 Z M 10 75 L 90 75 L 90 85 L 10 85 Z M 30 40 L 70 40 L 70 30 C 50 25 30 30 30 40 Z M 35 25 L 35 15 M 50 25 L 50 12 M 65 25 L 65 15",
  },
  {
    category: "Food",
    id: "cupcake",
    label: "Cupcake",
    color: "#f9a8d4",
    svgPath:
      "M 25 55 L 30 80 L 70 80 L 75 55 Z M 30 55 C 30 35 45 25 50 25 C 55 25 70 35 70 55 Z M 50 25 C 50 15 58 10 58 15 M 42 20 C 40 12 50 10 50 18",
  },
  {
    category: "Food",
    id: "candy",
    label: "Candy",
    color: "#ef4444",
    svgPath:
      "M 35 15 C 25 5 10 10 10 25 C 10 35 20 42 28 38 L 62 72 C 58 80 65 90 75 90 C 88 90 95 80 90 70 C 86 62 75 60 68 65 Z M 28 38 L 38 28 M 62 72 L 72 62",
  },
  {
    category: "Food",
    id: "ice-cream",
    label: "Ice Cream",
    color: "#fb923c",
    svgPath:
      "M 30 45 L 50 90 L 70 45 Z M 30 45 C 30 25 70 25 70 45 Z M 50 15 C 38 15 28 25 28 38 C 28 50 38 55 50 55 C 62 55 72 50 72 38 C 72 25 62 15 50 15 Z",
  },
  {
    category: "Food",
    id: "donut",
    label: "Donut",
    color: "#c084fc",
    svgPath:
      "M 50 12 C 27 12 8 31 8 50 C 8 75 27 88 50 88 C 73 88 92 75 92 50 C 92 31 73 12 50 12 Z M 50 32 C 39 32 30 40 30 50 C 30 60 39 68 50 68 C 61 68 70 60 70 50 C 70 40 61 32 50 32 Z",
  },
  {
    category: "Food",
    id: "lollipop",
    label: "Lollipop",
    color: "#f43f5e",
    svgPath:
      "M 50 20 C 30 20 15 30 15 45 C 15 60 30 68 50 65 C 70 68 85 60 85 45 C 85 30 70 20 50 20 Z M 50 65 L 50 90 M 42 85 L 50 90 L 58 85",
  },
  {
    category: "Food",
    id: "cookie",
    label: "Cookie",
    color: "#d97706",
    svgPath:
      "M 50 10 C 28 10 10 28 10 50 C 10 72 28 90 50 90 C 72 90 90 72 90 50 C 90 28 72 10 50 10 Z M 32 40 C 32 36 36 36 36 40 C 36 44 32 44 32 40 Z M 58 38 C 58 34 62 34 62 38 C 62 42 58 42 58 38 Z M 35 62 C 35 58 39 58 39 62 C 39 66 35 66 35 62 Z M 62 60 C 62 56 66 56 66 60 C 66 64 62 64 62 60 Z M 48 52 C 48 48 52 48 52 52 C 52 56 48 56 48 52 Z",
  },
  // Animals
  {
    category: "Animals",
    id: "butterfly",
    label: "Butterfly",
    color: "#a855f7",
    svgPath:
      "M 50 50 C 30 30 5 15 10 35 C 15 52 35 52 50 50 C 65 52 85 52 90 35 C 95 15 70 30 50 50 Z M 50 50 C 30 65 10 78 15 65 C 20 52 40 52 50 50 C 60 52 80 52 85 65 C 90 78 70 65 50 50 Z M 48 40 L 52 40 L 52 65 L 48 65 Z",
  },
  {
    category: "Animals",
    id: "bee",
    label: "Bee",
    color: "#f59e0b",
    svgPath:
      "M 38 30 C 25 30 18 40 18 50 C 18 62 28 70 40 68 L 60 68 C 72 70 82 62 82 50 C 82 40 75 30 62 30 Z M 45 15 C 35 20 35 30 40 30 M 55 15 C 65 20 65 30 60 30 M 30 42 C 30 36 22 28 18 30 M 70 42 C 70 36 78 28 82 30 M 35 50 L 65 50 M 35 58 L 65 58",
  },
  {
    category: "Animals",
    id: "unicorn",
    label: "Unicorn",
    color: "#f9a8d4",
    svgPath:
      "M 60 10 L 50 28 M 50 28 C 38 22 20 28 15 42 C 10 56 18 70 35 72 L 65 72 C 80 70 88 56 85 42 C 80 28 62 22 50 28 Z M 30 72 L 25 90 M 40 72 L 38 90 M 60 72 L 62 90 M 70 72 L 75 90 M 40 45 C 40 42 44 42 44 45 C 44 48 40 48 40 45 Z",
  },
  {
    category: "Animals",
    id: "dolphin",
    label: "Dolphin",
    color: "#38bdf8",
    svgPath:
      "M 10 55 C 10 35 30 20 55 22 C 75 24 88 35 88 50 C 88 62 78 70 65 68 L 85 80 L 65 72 C 55 78 40 78 28 70 C 16 62 10 55 10 55 Z M 60 36 C 60 32 64 32 64 36 C 64 40 60 40 60 36 Z",
  },
  {
    category: "Animals",
    id: "peacock",
    label: "Peacock",
    color: "#06b6d4",
    svgPath:
      "M 50 60 C 40 45 20 35 15 15 C 25 5 40 18 50 40 C 60 18 75 5 85 15 C 80 35 60 45 50 60 Z M 30 15 C 28 8 35 6 35 13 M 50 12 C 50 5 57 5 55 12 M 70 15 C 72 8 65 6 65 13 M 50 60 L 50 90 M 40 85 L 50 90 L 60 85",
  },
  {
    category: "Animals",
    id: "panda",
    label: "Panda",
    color: "#374151",
    svgPath:
      "M 50 20 C 32 20 18 34 18 52 C 18 70 32 80 50 80 C 68 80 82 70 82 52 C 82 34 68 20 50 20 Z M 28 28 C 22 22 15 24 15 32 C 15 40 22 42 28 38 Z M 72 28 C 78 22 85 24 85 32 C 85 40 78 42 72 38 Z M 38 46 C 36 42 40 40 40 44 C 40 48 36 48 38 46 Z M 62 46 C 64 42 60 40 60 44 C 60 48 64 48 62 46 Z M 44 60 L 56 60 M 50 56 L 50 64",
  },
  {
    category: "Animals",
    id: "lion",
    label: "Lion",
    color: "#d97706",
    svgPath:
      "M 50 25 C 35 25 22 35 22 50 C 22 65 35 72 50 72 C 65 72 78 65 78 50 C 78 35 65 25 50 25 Z M 20 42 C 12 35 8 45 12 52 M 80 42 C 88 35 92 45 88 52 M 22 30 C 18 20 26 15 30 22 M 78 30 C 82 20 74 15 70 22 M 35 20 C 35 12 42 10 45 16 M 65 20 C 65 12 58 10 55 16 M 42 46 C 42 44 44 44 44 46 C 44 48 42 48 42 46 Z M 58 46 C 58 44 56 44 56 46 C 56 48 58 48 58 46 Z M 44 58 L 56 58 M 50 56 L 50 62",
  },
  {
    category: "Animals",
    id: "parrot",
    label: "Parrot",
    color: "#22c55e",
    svgPath:
      "M 60 10 C 75 10 85 20 80 30 C 75 38 60 38 55 50 C 50 60 55 72 50 80 L 40 80 C 40 70 35 58 40 48 C 38 42 28 38 25 28 C 20 18 32 10 42 15 C 48 5 55 8 60 10 Z M 58 22 C 58 18 62 18 62 22 C 62 26 58 26 58 22 Z M 35 72 L 30 82 M 45 78 L 42 88",
  },
  // Fun
  {
    category: "Fun",
    id: "palette",
    label: "Palette",
    color: "#8b5cf6",
    svgPath:
      "M 50 10 C 28 10 10 28 10 50 C 10 72 28 90 50 90 C 55 90 60 87 62 83 C 58 80 58 74 62 72 C 66 70 72 72 72 78 C 78 74 82 66 82 58 C 82 32 68 10 50 10 Z M 28 42 C 28 38 32 38 32 42 C 32 46 28 46 28 42 Z M 40 30 C 40 26 44 26 44 30 C 44 34 40 34 40 30 Z M 56 28 C 56 24 60 24 60 28 C 60 32 56 32 56 28 Z M 68 36 C 68 32 72 32 72 36 C 72 40 68 40 68 36 Z",
  },
  {
    category: "Fun",
    id: "theater-masks",
    label: "Theater",
    color: "#f59e0b",
    svgPath:
      "M 15 20 C 5 20 5 55 20 65 C 30 72 45 65 45 55 L 45 20 Z M 22 38 C 22 34 26 34 26 38 M 38 38 C 38 34 34 34 34 38 M 22 52 C 26 58 38 58 38 52 M 55 20 L 55 55 C 55 65 70 72 80 65 C 95 55 95 20 85 20 Z M 62 38 C 62 34 66 34 66 38 M 78 38 C 78 34 74 34 74 38 M 62 52 C 66 46 78 46 78 52",
  },
  {
    category: "Fun",
    id: "carousel",
    label: "Carousel",
    color: "#ec4899",
    svgPath:
      "M 50 15 L 50 85 M 20 30 L 50 15 L 80 30 M 15 50 L 50 35 L 85 50 M 20 70 L 50 55 L 80 70 M 20 30 C 15 40 15 60 20 70 M 80 30 C 85 40 85 60 80 70",
  },
  {
    category: "Fun",
    id: "star-sparkle",
    label: "Sparkle",
    color: "#d4af37",
    svgPath:
      "M 50 10 L 53 43 L 85 38 L 58 55 L 80 82 L 50 65 L 20 82 L 42 55 L 15 38 L 47 43 Z M 20 15 L 22 22 L 15 25 L 22 28 L 20 35 L 25 28 L 32 30 L 27 25 L 32 20 L 25 22 Z M 75 65 L 77 70 L 72 72 L 77 74 L 75 79 L 78 74 L 83 75 L 79 72 L 83 69 L 78 70 Z",
  },
  {
    category: "Fun",
    id: "magic-wand",
    label: "Magic Wand",
    color: "#a855f7",
    svgPath:
      "M 20 80 L 70 30 M 65 25 L 75 35 M 15 85 L 25 75 M 68 22 L 72 15 L 76 22 L 83 18 L 79 25 L 86 28 L 79 31 L 83 38 L 76 34 L 72 41 L 68 34 L 61 38 L 65 31 L 58 28 L 65 25 Z M 30 45 L 28 40 M 45 28 L 42 22 M 25 35 L 18 32",
  },
  {
    category: "Fun",
    id: "lightning-bolt",
    label: "Lightning",
    color: "#f59e0b",
    svgPath: "M 60 5 L 25 52 L 48 52 L 40 95 L 75 48 L 52 48 Z",
  },
  {
    category: "Fun",
    id: "fire",
    label: "Fire",
    color: "#ef4444",
    svgPath:
      "M 50 5 C 40 20 25 22 22 38 C 18 52 28 68 38 72 C 32 62 35 52 42 48 C 40 58 45 68 50 72 C 55 68 60 58 58 48 C 65 52 68 62 62 72 C 72 68 82 52 78 38 C 75 22 60 20 50 5 Z",
  },
  {
    category: "Fun",
    id: "diamond-gem",
    label: "Diamond",
    color: "#38bdf8",
    svgPath:
      "M 20 38 L 50 8 L 80 38 L 50 92 Z M 20 38 L 50 58 L 80 38 M 35 22 L 50 58 M 65 22 L 50 58 M 20 38 L 35 22 L 65 22 L 80 38",
  },
];
const GRAPHICS_CATEGORIES = [
  "Celebrations",
  "Nature",
  "Love",
  "Food",
  "Animals",
  "Fun",
];

const PATTERN_BG_SIZES: Record<string, string> = {
  dots: "30px 30px, 30px 30px",
  stripes: "20px 20px",
  grid: "24px 24px, 24px 24px",
  zigzag: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
  diamonds: "20px 20px, 20px 20px",
  stars: "30px 30px, 30px 30px, 30px 30px",
  confetti: "18px 18px, 18px 18px, 18px 18px",
  marble: "100px 100px, 200px 200px",
};

const PATTERN_BG_POSITIONS: Record<string, string> = {
  dots: "0 0, 15px 15px",
  stripes: "0 0",
  grid: "0 0, 0 0",
  zigzag: "-20px 0, -20px 0, 0 0, 0 0",
  diamonds: "0 0, 10px 10px",
  stars: "0 0, 15px 0, -15px 0",
  confetti: "0 0, 0 0, 0 0",
  marble: "0 0, 0 0",
};

const TEXT_FONTS = [
  "sans-serif",
  "serif",
  "cursive",
  "Georgia, serif",
  "Palatino, serif",
];
const FONT_LABELS = [
  "Modern",
  "Classic Serif",
  "Handwritten",
  "Georgia",
  "Palatino",
];
const TEXT_COLORS = [
  "#1a1a1a",
  "#ffffff",
  "#c41e3a",
  "#276b3b",
  "#1e3c72",
  "#7c2d6b",
  "#8b6b4e",
  "#f7971e",
  "#9b1c2e",
  "#4a90c4",
  "#d4a017",
  "#6b4c9b",
];

// ─── Helper ────────────────────────────────────────────────────────────────────
let idCounter = 0;
function genId() {
  return `el-${Date.now()}-${idCounter++}`;
}

function ShapeSVG({
  shapeType,
  fillColor,
  width,
  height,
}: { shapeType: string; fillColor: string; width: number; height: number }) {
  // Handle graphic SVG paths (format: "graphic:id:svgPath")
  if (shapeType.startsWith("graphic:")) {
    const parts = shapeType.split(":");
    const svgPath = parts.slice(2).join(":");
    return (
      <svg
        role="img"
        aria-label="graphic"
        width={width}
        height={height}
        viewBox="0 0 100 100"
        style={{ overflow: "visible" }}
      >
        <path
          d={svgPath}
          fill={fillColor}
          stroke={fillColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  const def = SHAPE_DEFS.find((s) => s.id === shapeType);
  if (!def) return null;

  if (def.primitive === "circle") {
    return (
      <svg
        role="img"
        aria-label="shape"
        width={width}
        height={height}
        viewBox="0 0 100 100"
        style={{ overflow: "visible" }}
      >
        <circle cx="50" cy="50" r="48" fill={fillColor} />
      </svg>
    );
  }
  if (def.primitive === "rect") {
    return (
      <svg
        role="img"
        aria-label="shape"
        width={width}
        height={height}
        viewBox="0 0 100 100"
        style={{ overflow: "visible" }}
      >
        <rect x="2" y="2" width="96" height="96" rx="4" fill={fillColor} />
      </svg>
    );
  }
  if (def.primitive === "rect-wide") {
    return (
      <svg
        role="img"
        aria-label="shape"
        width={width}
        height={height}
        viewBox="0 0 200 100"
        style={{ overflow: "visible" }}
      >
        <rect x="2" y="2" width="196" height="96" rx="4" fill={fillColor} />
      </svg>
    );
  }
  if (def.path) {
    return (
      <svg
        role="img"
        aria-label="shape"
        width={width}
        height={height}
        viewBox="0 0 100 100"
        style={{ overflow: "visible" }}
      >
        <path d={def.path} fill={fillColor} />
      </svg>
    );
  }
  return null;
}

// ─── Card Preview Element ──────────────────────────────────────────────────────

function CardPreviewElement({
  el,
  selected,
  onSelect,
  onDrag,
}: {
  el: CardElement;
  selected: boolean;
  onSelect: (id: string) => void;
  onDrag: (id: string, dx: number, dy: number) => void;
}) {
  const dragStart = useRef<{ mx: number; my: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(el.id);
    dragStart.current = { mx: e.clientX, my: e.clientY };
    const handleMove = (ev: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = ((ev.clientX - dragStart.current.mx) / 560) * 100;
      const dy = ((ev.clientY - dragStart.current.my) / 392) * 100;
      onDrag(el.id, dx, dy);
      dragStart.current = { mx: ev.clientX, my: ev.clientY };
    };
    const handleUp = () => {
      dragStart.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  if (el.type === "shape") {
    const w = (el.width / 100) * 560;
    const h = (el.height / 100) * 392;
    return (
      <div
        data-ocid="card.canvas_target"
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: `${el.x}%`,
          top: `${el.y}%`,
          transform: `translate(-50%, -50%) rotate(${el.rotation}deg)`,
          cursor: "move",
          userSelect: "none",
          outline: selected ? "2px dashed rgba(139,92,246,0.7)" : "none",
          outlineOffset: "4px",
        }}
      >
        <ShapeSVG
          shapeType={el.shapeType}
          fillColor={el.fillColor}
          width={w}
          height={h}
        />
      </div>
    );
  }

  return (
    <div
      data-ocid="card.canvas_target"
      onMouseDown={handleMouseDown}
      style={{
        position: "absolute",
        left: `${el.x}%`,
        top: `${el.y}%`,
        transform: "translate(-50%, -50%)",
        cursor: "move",
        userSelect: "none",
        outline: selected ? "2px dashed rgba(139,92,246,0.7)" : "none",
        outlineOffset: "4px",
        borderRadius: 4,
        fontSize: el.fontSize,
        color: el.color,
        fontFamily: el.fontFamily,
        fontWeight: el.bold ? "bold" : "normal",
        fontStyle: el.italic ? "italic" : "normal",
        padding: "2px 4px",
        whiteSpace: "nowrap",
        maxWidth: "90%",
        textShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }}
    >
      {el.content}
    </div>
  );
}

// ─── Template Preview Card ─────────────────────────────────────────────────────

// ─── Category Decorations ─────────────────────────────────────────────────────

function CategoryDecor({ category }: { category: string }) {
  const base = "absolute pointer-events-none";
  switch (category) {
    case "Birthday":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-7 h-9 opacity-55`}
            viewBox="0 0 28 36"
          >
            <ellipse cx="14" cy="12" rx="9" ry="11" fill="#f472b6" />
            <path
              d="M14 23 Q12 28 13 32"
              stroke="#f472b6"
              strokeWidth="1.2"
              fill="none"
            />
            <polygon points="12,23 16,23 14,26" fill="#f472b6" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-7 h-9 opacity-55`}
            viewBox="0 0 28 36"
          >
            <ellipse cx="14" cy="12" rx="9" ry="11" fill="#60a5fa" />
            <path
              d="M14 23 Q16 28 15 32"
              stroke="#60a5fa"
              strokeWidth="1.2"
              fill="none"
            />
            <polygon points="12,23 16,23 14,26" fill="#60a5fa" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-1/2 -translate-x-1/2 w-6 h-8 opacity-45`}
            viewBox="0 0 24 32"
          >
            <ellipse cx="12" cy="10" rx="8" ry="9" fill="#fbbf24" />
            <path
              d="M12 19 Q11 23 12 27"
              stroke="#fbbf24"
              strokeWidth="1.2"
              fill="none"
            />
            <polygon points="10,19 14,19 12,22" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-5 h-5 opacity-50`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11.5 7.5 L17 7.5 L12.5 11 L14 17 L10 13.5 L6 17 L7.5 11 L3 7.5 L8.5 7.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-5 h-5 opacity-50`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11.5 7.5 L17 7.5 L12.5 11 L14 17 L10 13.5 L6 17 L7.5 11 L3 7.5 L8.5 7.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 opacity-45`}
            viewBox="0 0 32 32"
          >
            <rect x="4" y="16" width="24" height="12" rx="2" fill="#f9a8d4" />
            <rect x="8" y="10" width="16" height="8" rx="2" fill="#fbcfe8" />
            <line
              x1="10"
              y1="10"
              x2="10"
              y2="6"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <circle cx="10" cy="5" r="2" fill="#f43f5e" />
            <line
              x1="16"
              y1="10"
              x2="16"
              y2="5"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <circle cx="16" cy="4" r="2" fill="#a78bfa" />
            <line
              x1="22"
              y1="10"
              x2="22"
              y2="6"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <circle cx="22" cy="5" r="2" fill="#60a5fa" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-full h-full opacity-20`}
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <circle cx="25" cy="5" r="2" fill="#f472b6" />
            <circle cx="75" cy="5" r="2" fill="#60a5fa" />
            <rect
              x="40"
              y="60"
              width="3"
              height="6"
              rx="1"
              fill="#4ade80"
              transform="rotate(20,40,60)"
            />
            <rect
              x="60"
              y="58"
              width="3"
              height="6"
              rx="1"
              fill="#fbbf24"
              transform="rotate(-15,60,58)"
            />
          </svg>
        </>
      );
    case "Wedding":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-10 h-10 opacity-40`}
            viewBox="0 0 40 40"
          >
            <circle cx="20" cy="12" r="5" fill="#f9a8d4" />
            <circle cx="28" cy="20" r="5" fill="#f9a8d4" />
            <circle cx="20" cy="28" r="5" fill="#f9a8d4" />
            <circle cx="12" cy="20" r="5" fill="#f9a8d4" />
            <circle cx="20" cy="20" r="4" fill="#fef3c7" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-2 w-5 h-5 opacity-50`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#e879f9"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-10 h-6 opacity-55`}
            viewBox="0 0 40 20"
          >
            <circle
              cx="13"
              cy="10"
              r="8"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
            />
            <circle
              cx="27"
              cy="10"
              r="8"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 right-0 w-10 h-10 opacity-40`}
            viewBox="0 0 40 40"
          >
            <circle cx="20" cy="12" r="5" fill="#f9a8d4" />
            <circle cx="28" cy="20" r="5" fill="#f9a8d4" />
            <circle cx="20" cy="28" r="5" fill="#f9a8d4" />
            <circle cx="12" cy="20" r="5" fill="#f9a8d4" />
            <circle cx="20" cy="20" r="4" fill="#fef3c7" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-7 h-7 opacity-40`}
            viewBox="0 0 28 28"
          >
            <circle cx="14" cy="8" r="4" fill="#fda4af" />
            <circle cx="20" cy="14" r="4" fill="#fda4af" />
            <circle cx="14" cy="20" r="4" fill="#fda4af" />
            <circle cx="8" cy="14" r="4" fill="#fda4af" />
            <circle cx="14" cy="14" r="3" fill="#fef9c3" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-10 h-6 opacity-45`}
            viewBox="0 0 40 24"
          >
            <path
              d="M20 12 C14 6 4 4 6 10 C8 16 18 14 20 12 Z"
              fill="#f9a8d4"
            />
            <path
              d="M20 12 C26 6 36 4 34 10 C32 16 22 14 20 12 Z"
              fill="#f9a8d4"
            />
            <circle cx="20" cy="12" r="2.5" fill="#e879f9" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 left-1 w-4 h-4 opacity-40`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 14 C3 9 1 6 1 4 A3.5 3.5 0 0 1 8 3 A3.5 3.5 0 0 1 15 4 C15 6 13 9 8 14 Z"
              fill="#fb7185"
            />
          </svg>
        </>
      );
    case "Anniversary":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#f43f5e"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#f43f5e"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-10 h-6 opacity-55`}
            viewBox="0 0 40 20"
          >
            <circle
              cx="13"
              cy="10"
              r="7"
              fill="none"
              stroke="#ffd700"
              strokeWidth="2"
            />
            <circle
              cx="27"
              cy="10"
              r="7"
              fill="none"
              stroke="#ffd700"
              strokeWidth="2"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 opacity-35`}
            viewBox="0 0 40 40"
          >
            <path
              d="M12 4 L16 16 L10 16 Z"
              fill="none"
              stroke="#ffd700"
              strokeWidth="1.5"
            />
            <line
              x1="13"
              y1="16"
              x2="13"
              y2="26"
              stroke="#ffd700"
              strokeWidth="1.5"
            />
            <line
              x1="10"
              y1="26"
              x2="16"
              y2="26"
              stroke="#ffd700"
              strokeWidth="1.5"
            />
            <path
              d="M28 4 L32 16 L26 16 Z"
              fill="none"
              stroke="#ffd700"
              strokeWidth="1.5"
            />
            <line
              x1="29"
              y1="16"
              x2="29"
              y2="26"
              stroke="#ffd700"
              strokeWidth="1.5"
            />
            <line
              x1="26"
              y1="26"
              x2="32"
              y2="26"
              stroke="#ffd700"
              strokeWidth="1.5"
            />
            <path
              d="M18 8 Q20 4 22 8"
              stroke="#ffd700"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-4 h-4 opacity-45`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 14 C3 9 1 6 1 4 A3.5 3.5 0 0 1 8 3 A3.5 3.5 0 0 1 15 4 C15 6 13 9 8 14 Z"
              fill="#fb7185"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-4 h-4 opacity-45`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 14 C3 9 1 6 1 4 A3.5 3.5 0 0 1 8 3 A3.5 3.5 0 0 1 15 4 C15 6 13 9 8 14 Z"
              fill="#fb7185"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-6 h-8 opacity-45`}
            viewBox="0 0 24 32"
          >
            <rect x="9" y="14" width="6" height="14" rx="1" fill="#fda4af" />
            <path d="M12 14 Q11 8 12 4 Q13 8 12 14 Z" fill="#fbbf24" />
            <ellipse cx="12" cy="4" rx="2" ry="3" fill="#fef08a" />
          </svg>
        </>
      );
    case "Thank You":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-0 right-0 w-12 h-12 opacity-35`}
            viewBox="0 0 48 48"
          >
            <path
              d="M44 4 C44 24 28 40 4 44 C18 36 32 22 44 4 Z"
              fill="#4ade80"
            />
            <path
              d="M44 4 C30 10 20 24 4 44 C22 30 38 18 44 4 Z"
              fill="#86efac"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 left-0 w-12 h-12 opacity-35`}
            viewBox="0 0 48 48"
            style={{ transform: "rotate(180deg)" }}
          >
            <path
              d="M44 4 C44 24 28 40 4 44 C18 36 32 22 44 4 Z"
              fill="#4ade80"
            />
            <path
              d="M44 4 C30 10 20 24 4 44 C22 30 38 18 44 4 Z"
              fill="#86efac"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-9 h-6 opacity-50`}
            viewBox="0 0 36 24"
          >
            <path
              d="M18 12 C12 6 2 4 4 10 C6 16 16 14 18 12 Z"
              fill="#f9a8d4"
            />
            <path
              d="M18 12 C24 6 34 4 32 10 C30 16 20 14 18 12 Z"
              fill="#f9a8d4"
            />
            <circle cx="18" cy="12" r="2.5" fill="#e879f9" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-14 w-4 h-4 opacity-50`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 2 L8.5 6.5 L13 8 L8.5 9.5 L8 14 L7.5 9.5 L3 8 L7.5 6.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-full h-full opacity-25`}
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <circle cx="50" cy="5" r="2.5" fill="#4ade80" />
            <circle cx="50" cy="65" r="2.5" fill="#4ade80" />
            <circle cx="5" cy="35" r="2" fill="#86efac" />
            <circle cx="95" cy="35" r="2" fill="#86efac" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 right-0 w-10 h-10 opacity-35`}
            viewBox="0 0 40 40"
          >
            <path
              d="M36 36 C36 20 24 8 4 4 C14 16 24 28 36 36 Z"
              fill="#4ade80"
            />
          </svg>
        </>
      );
    case "Congrats":
    case "Graduation":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11.5 7.5 L17 7.5 L12.5 11 L14 17 L10 13.5 L6 17 L7.5 11 L3 7.5 L8.5 7.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11.5 7.5 L17 7.5 L12.5 11 L14 17 L10 13.5 L6 17 L7.5 11 L3 7.5 L8.5 7.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-10 h-8 opacity-50`}
            viewBox="0 0 40 32"
          >
            <polygon points="20,4 38,12 20,20 2,12" fill="#1e293b" />
            <rect x="14" y="12" width="12" height="8" rx="1" fill="#334155" />
            <line
              x1="20"
              y1="20"
              x2="20"
              y2="28"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="29" r="2" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-8 h-9 opacity-45`}
            viewBox="0 0 32 36"
          >
            <path
              d="M8 4 L24 4 L24 16 C24 22 16 26 16 26 C16 26 8 22 8 16 Z"
              fill="#ffd700"
            />
            <path d="M4 4 L8 4 L8 12 C4 12 2 8 4 4 Z" fill="#ffd700" />
            <path d="M28 4 L24 4 L24 12 C28 12 30 8 28 4 Z" fill="#ffd700" />
            <line
              x1="16"
              y1="26"
              x2="16"
              y2="30"
              stroke="#d4af37"
              strokeWidth="1.5"
            />
            <rect x="10" y="30" width="12" height="3" rx="1" fill="#d4af37" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-8 h-7 opacity-45`}
            viewBox="0 0 32 28"
          >
            <rect x="4" y="6" width="24" height="16" rx="2" fill="#fef3c7" />
            <line
              x1="9"
              y1="11"
              x2="23"
              y2="11"
              stroke="#d4af37"
              strokeWidth="1"
            />
            <line
              x1="9"
              y1="14"
              x2="23"
              y2="14"
              stroke="#d4af37"
              strokeWidth="1"
            />
            <line
              x1="9"
              y1="17"
              x2="18"
              y2="17"
              stroke="#d4af37"
              strokeWidth="1"
            />
            <circle cx="4" cy="14" r="4" fill="#e5e7eb" />
            <circle cx="28" cy="14" r="4" fill="#e5e7eb" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-full h-full opacity-20`}
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <line
              x1="5"
              y1="0"
              x2="15"
              y2="20"
              stroke="#f472b6"
              strokeWidth="2"
            />
            <line
              x1="80"
              y1="5"
              x2="92"
              y2="25"
              stroke="#60a5fa"
              strokeWidth="2"
            />
            <line
              x1="30"
              y1="60"
              x2="20"
              y2="70"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            <line
              x1="72"
              y1="55"
              x2="85"
              y2="70"
              stroke="#4ade80"
              strokeWidth="2"
            />
            <circle cx="60" cy="10" r="2" fill="#f472b6" />
            <circle cx="20" cy="40" r="2" fill="#60a5fa" />
            <circle cx="85" cy="45" r="2" fill="#fbbf24" />
            <rect
              x="45"
              y="55"
              width="3"
              height="6"
              rx="1"
              fill="#a855f7"
              transform="rotate(20,45,55)"
            />
          </svg>
        </>
      );
    case "Love":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#f43f5e"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-4 h-4 opacity-50`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 14 C3 9 1 6 1 4 A3.5 3.5 0 0 1 8 3 A3.5 3.5 0 0 1 15 4 C15 6 13 9 8 14 Z"
              fill="#fb7185"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-12 h-5 opacity-45`}
            viewBox="0 0 48 20"
          >
            <line
              x1="4"
              y1="10"
              x2="44"
              y2="10"
              stroke="#f43f5e"
              strokeWidth="1.5"
            />
            <polygon points="44,6 48,10 44,14" fill="#f43f5e" />
            <path
              d="M4 6 L2 2 M4 6 L8 4"
              stroke="#f43f5e"
              strokeWidth="1.2"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 right-1 w-7 h-7 opacity-40`}
            viewBox="0 0 28 28"
          >
            <circle cx="14" cy="14" r="6" fill="#f43f5e" />
            <circle cx="14" cy="10" r="4" fill="#fb7185" />
            <circle cx="18" cy="14" r="4" fill="#fb7185" />
            <circle cx="14" cy="18" r="3" fill="#fda4af" />
            <line
              x1="14"
              y1="20"
              x2="14"
              y2="26"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-10 h-6 opacity-45`}
            viewBox="0 0 40 24"
          >
            <path
              d="M20 12 C14 6 4 4 6 10 C8 16 18 14 20 12 Z"
              fill="#f9a8d4"
            />
            <path
              d="M20 12 C26 6 36 4 34 10 C32 16 22 14 20 12 Z"
              fill="#f9a8d4"
            />
            <circle cx="20" cy="12" r="2.5" fill="#e879f9" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-2 w-4 h-4 opacity-45`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 14 C3 9 1 6 1 4 A3.5 3.5 0 0 1 8 3 A3.5 3.5 0 0 1 15 4 C15 6 13 9 8 14 Z"
              fill="#fda4af"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#f43f5e"
            />
          </svg>
        </>
      );
    case "Baby Shower":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-4 h-4 opacity-50`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 1 L9 5.5 L14 5.5 L10 8.5 L11.5 13 L8 10.5 L4.5 13 L6 8.5 L2 5.5 L7 5.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-6 h-6 opacity-50`}
            viewBox="0 0 24 24"
          >
            <path d="M18 12 A9 9 0 1 1 9 3 A7 7 0 0 0 18 12 Z" fill="#fde68a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-8 h-8 opacity-45`}
            viewBox="0 0 32 32"
          >
            <circle cx="20" cy="10" r="8" fill="#fbcfe8" />
            <line
              x1="14"
              y1="16"
              x2="6"
              y2="24"
              stroke="#f9a8d4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="5" cy="25" r="3" fill="#f9a8d4" />
            <circle cx="23" cy="7" r="2" fill="#fde68a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 right-1 w-6 h-8 opacity-40`}
            viewBox="0 0 24 32"
          >
            <rect x="7" y="10" width="10" height="18" rx="4" fill="#bfdbfe" />
            <rect x="9" y="6" width="6" height="6" rx="1" fill="#93c5fd" />
            <rect x="10" y="3" width="4" height="4" rx="1" fill="#60a5fa" />
            <line
              x1="9"
              y1="16"
              x2="15"
              y2="16"
              stroke="white"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-10 h-6 opacity-40`}
            viewBox="0 0 40 24"
          >
            <ellipse cx="20" cy="16" rx="16" ry="7" fill="white" />
            <circle cx="12" cy="14" r="6" fill="white" />
            <circle cx="28" cy="14" r="6" fill="white" />
            <circle cx="20" cy="10" r="7" fill="white" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-8 h-8 opacity-40`}
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="18" r="8" fill="#fde68a" />
            <circle cx="16" cy="12" r="6" fill="#fde68a" />
            <circle cx="8" cy="10" r="3.5" fill="#fde68a" />
            <circle cx="24" cy="10" r="3.5" fill="#fde68a" />
            <circle cx="14" cy="11" r="1" fill="#78716c" />
            <circle cx="18" cy="11" r="1" fill="#78716c" />
            <ellipse cx="16" cy="14" rx="2.5" ry="1.5" fill="#d97706" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-8 h-5 opacity-30`}
            viewBox="0 0 32 20"
          >
            <ellipse cx="16" cy="14" rx="12" ry="5" fill="white" />
            <circle cx="10" cy="12" r="5" fill="white" />
            <circle cx="22" cy="12" r="5" fill="white" />
            <circle cx="16" cy="8" r="6" fill="white" />
          </svg>
        </>
      );
    case "Diwali":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-7 h-7 opacity-55`}
            viewBox="0 0 28 28"
          >
            <ellipse cx="14" cy="20" rx="9" ry="4" fill="#d97706" />
            <path d="M8 20 Q14 16 20 20" fill="#b45309" />
            <path d="M14 18 Q13 10 14 6 Q15 10 14 18 Z" fill="#fbbf24" />
            <ellipse cx="14" cy="6" rx="2" ry="3" fill="#fef08a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-60`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-8 h-8 opacity-50`}
            viewBox="0 0 32 32"
          >
            <line
              x1="16"
              y1="16"
              x2="16"
              y2="4"
              stroke="#f97316"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="28"
              y2="16"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="16"
              y2="28"
              stroke="#f97316"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="4"
              y2="16"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="24"
              y2="8"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="8"
              y2="8"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="24"
              y2="24"
              stroke="#f97316"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="8"
              y2="24"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-10 h-8 opacity-50`}
            viewBox="0 0 40 32"
          >
            <path
              d="M20 28 C20 28 10 20 10 12 C10 8 14 6 20 10 C26 6 30 8 30 12 C30 20 20 28 20 28 Z"
              fill="#f9a8d4"
            />
            <path d="M20 28 C20 28 4 22 4 14 C4 10 8 10 12 14" fill="#fda4af" />
            <path
              d="M20 28 C20 28 36 22 36 14 C36 10 32 10 28 14"
              fill="#fda4af"
            />
            <circle cx="20" cy="16" r="3" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 opacity-20`}
            viewBox="0 0 40 40"
          >
            <polygon
              points="20,4 36,14 36,26 20,36 4,26 4,14"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
            />
            <polygon
              points="20,10 30,16 30,24 20,30 10,24 10,16"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1"
            />
            <circle
              cx="20"
              cy="20"
              r="4"
              fill="none"
              stroke="#f97316"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-7 h-7 opacity-55`}
            viewBox="0 0 28 28"
          >
            <ellipse cx="14" cy="20" rx="9" ry="4" fill="#d97706" />
            <path d="M8 20 Q14 16 20 20" fill="#b45309" />
            <path d="M14 18 Q13 10 14 6 Q15 10 14 18 Z" fill="#fbbf24" />
            <ellipse cx="14" cy="6" rx="2" ry="3" fill="#fef08a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-5 h-5 opacity-60`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
              fill="#fbbf24"
            />
          </svg>
        </>
      );
    case "Eid":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-7 h-7 opacity-55`}
            viewBox="0 0 28 28"
          >
            <path
              d="M20 14 A9 9 0 1 1 11 5 A7 7 0 0 0 20 14 Z"
              fill="#fde68a"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
              fill="#d4af37"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-7 h-10 opacity-50`}
            viewBox="0 0 28 40"
          >
            <rect x="6" y="8" width="16" height="24" rx="4" fill="#dc2626" />
            <line
              x1="14"
              y1="0"
              x2="14"
              y2="8"
              stroke="#d4af37"
              strokeWidth="1.5"
            />
            <line
              x1="14"
              y1="32"
              x2="14"
              y2="38"
              stroke="#d4af37"
              strokeWidth="1.5"
            />
            <line
              x1="6"
              y1="20"
              x2="22"
              y2="20"
              stroke="#d4af37"
              strokeWidth="1"
              opacity="0.5"
            />
            <ellipse cx="14" cy="8" rx="8" ry="3" fill="#d4af37" />
            <ellipse cx="14" cy="32" rx="8" ry="3" fill="#d4af37" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 left-1/2 -translate-x-1/2 w-14 h-8 opacity-35`}
            viewBox="0 0 56 32"
          >
            <path
              d="M4 28 L4 18 Q4 8 14 8 Q20 4 28 4 Q36 4 42 8 Q52 8 52 18 L52 28 Z"
              fill="#4338ca"
            />
            <rect x="22" y="16" width="12" height="12" fill="#3730a3" />
            <line
              x1="28"
              y1="4"
              x2="28"
              y2="0"
              stroke="#fde68a"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-full h-full opacity-10`}
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <polygon
              points="5,5 15,5 10,13"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1"
            />
            <polygon
              points="85,5 95,5 90,13"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1"
            />
            <polygon
              points="5,57 15,57 10,65"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1"
            />
            <polygon
              points="85,57 95,57 90,65"
              fill="none"
              stroke="#d4af37"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-2 w-6 h-6 opacity-45`}
            viewBox="0 0 24 24"
          >
            <path d="M18 12 A9 9 0 1 1 9 3 A7 7 0 0 0 18 12 Z" fill="#fde68a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-4 h-4 opacity-50`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 2 L8.5 6 L13 8 L8.5 10 L8 14 L7.5 10 L3 8 L7.5 6 Z"
              fill="#d4af37"
            />
          </svg>
        </>
      );
    case "Christmas":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-6 h-6 opacity-50`}
            viewBox="0 0 24 24"
          >
            <line
              x1="12"
              y1="2"
              x2="12"
              y2="22"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
            <line
              x1="5"
              y1="5"
              x2="19"
              y2="19"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
            <line
              x1="19"
              y1="5"
              x2="5"
              y2="19"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11.5 7.5 L17 7.5 L12.5 11 L14 17 L10 13.5 L6 17 L7.5 11 L3 7.5 L8.5 7.5 Z"
              fill="#fef08a"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-8 h-10 opacity-50`}
            viewBox="0 0 32 40"
          >
            <polygon
              points="16,2 26,14 20,14 28,24 22,24 28,34 4,34 10,24 4,24 12,14 6,14"
              fill="#16a34a"
            />
            <rect x="13" y="34" width="6" height="4" fill="#92400e" />
            <circle cx="14" cy="10" r="2" fill="#ef4444" />
            <circle cx="19" cy="18" r="2" fill="#fbbf24" />
            <circle cx="11" cy="22" r="2" fill="#60a5fa" />
            <circle cx="21" cy="28" r="2" fill="#f472b6" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-9 h-7 opacity-50`}
            viewBox="0 0 36 28"
          >
            <ellipse
              cx="10"
              cy="16"
              rx="7"
              ry="5"
              fill="#16a34a"
              transform="rotate(-30,10,16)"
            />
            <ellipse
              cx="22"
              cy="16"
              rx="7"
              ry="5"
              fill="#15803d"
              transform="rotate(30,22,16)"
            />
            <circle cx="16" cy="12" r="3" fill="#dc2626" />
            <circle cx="20" cy="11" r="2.5" fill="#ef4444" />
            <circle cx="12" cy="11" r="2.5" fill="#b91c1c" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-6 h-8 opacity-50`}
            viewBox="0 0 24 32"
          >
            <path
              d="M14 4 Q14 4 14 20 Q14 28 8 28 Q2 28 2 22"
              fill="none"
              stroke="#ef4444"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M14 4 Q14 4 14 20 Q14 28 8 28 Q2 28 2 22"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="4,4"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-7 h-8 opacity-45`}
            viewBox="0 0 28 32"
          >
            <circle cx="14" cy="18" r="10" fill="#dc2626" />
            <rect x="11" y="4" width="6" height="6" rx="1" fill="#d4af37" />
            <line
              x1="8"
              y1="14"
              x2="20"
              y2="22"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-8 right-1 w-6 h-6 opacity-50`}
            viewBox="0 0 24 24"
          >
            <line
              x1="12"
              y1="2"
              x2="12"
              y2="22"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
            <line
              x1="2"
              y1="12"
              x2="22"
              y2="12"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
            <line
              x1="5"
              y1="5"
              x2="19"
              y2="19"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
            <line
              x1="19"
              y1="5"
              x2="5"
              y2="19"
              stroke="#bfdbfe"
              strokeWidth="1.5"
            />
          </svg>
        </>
      );
    case "New Year":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-8 h-8 opacity-50`}
            viewBox="0 0 32 32"
          >
            <line
              x1="16"
              y1="16"
              x2="16"
              y2="4"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="28"
              y2="16"
              stroke="#f43f5e"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="16"
              y2="28"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="4"
              y2="16"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="24"
              y2="8"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="8"
              y2="8"
              stroke="#f43f5e"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="24"
              y2="24"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="8"
              y2="24"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-1/2 -translate-x-1/2 w-6 h-10 opacity-45`}
            viewBox="0 0 24 40"
          >
            <path
              d="M10 20 Q8 16 8 10 L10 6 L14 6 L16 10 Q16 16 14 20 L14 36 Q14 38 12 38 Q10 38 10 36 Z"
              fill="#16a34a"
            />
            <rect x="9" y="3" width="6" height="5" rx="1" fill="#d4af37" />
            <path d="M12 6 L12 0" stroke="#d4af37" strokeWidth="1.5" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-8 h-8 opacity-45`}
            viewBox="0 0 32 32"
          >
            <line
              x1="16"
              y1="16"
              x2="16"
              y2="4"
              stroke="#e879f9"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="28"
              y2="16"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="16"
              y2="28"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="4"
              y2="16"
              stroke="#f43f5e"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="24"
              y2="8"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="8"
              y2="8"
              stroke="#e879f9"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="24"
              y2="24"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="8"
              y2="24"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-8 h-8 opacity-40`}
            viewBox="0 0 32 32"
          >
            <circle
              cx="16"
              cy="16"
              r="12"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="16"
              y1="16"
              x2="16"
              y2="8"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="16"
              x2="22"
              y2="20"
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 right-1 w-5 h-5 opacity-45`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
              fill="#e879f9"
            />
          </svg>
        </>
      );
    case "Holi":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} inset-0 w-full h-full opacity-30`}
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <circle cx="8" cy="8" r="3" fill="#f43f5e" />
            <circle cx="92" cy="8" r="3" fill="#60a5fa" />
            <circle cx="8" cy="62" r="3" fill="#4ade80" />
            <circle cx="92" cy="62" r="3" fill="#fbbf24" />
            <circle cx="20" cy="15" r="2" fill="#a855f7" />
            <circle cx="80" cy="15" r="2" fill="#f97316" />
            <circle cx="15" cy="50" r="2" fill="#06b6d4" />
            <circle cx="85" cy="50" r="2" fill="#ec4899" />
            <circle cx="50" cy="5" r="2" fill="#fbbf24" />
            <circle cx="50" cy="65" r="2" fill="#f43f5e" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-10 h-6 opacity-45`}
            viewBox="0 0 40 24"
          >
            <rect x="2" y="10" width="22" height="6" rx="3" fill="#06b6d4" />
            <rect x="20" y="8" width="10" height="10" rx="2" fill="#0891b2" />
            <line
              x1="30"
              y1="12"
              x2="38"
              y2="8"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="14"
              x2="36"
              y2="14"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="30"
              y1="16"
              x2="38"
              y2="20"
              stroke="#93c5fd"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="8" cy="13" r="2" fill="#0e7490" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 right-0 w-12 h-10 opacity-35`}
            viewBox="0 0 48 40"
          >
            <ellipse
              cx="36"
              cy="8"
              rx="10"
              ry="6"
              fill="#f43f5e"
              transform="rotate(-20,36,8)"
            />
            <ellipse
              cx="42"
              cy="18"
              rx="6"
              ry="8"
              fill="#fbbf24"
              transform="rotate(15,42,18)"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 left-0 w-12 h-10 opacity-35`}
            viewBox="0 0 48 40"
          >
            <ellipse
              cx="12"
              cy="30"
              rx="10"
              ry="7"
              fill="#a855f7"
              transform="rotate(15,12,30)"
            />
            <ellipse
              cx="6"
              cy="22"
              rx="7"
              ry="6"
              fill="#ec4899"
              transform="rotate(-10,6,22)"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 right-0 w-12 h-10 opacity-35`}
            viewBox="0 0 48 40"
          >
            <ellipse
              cx="36"
              cy="32"
              rx="10"
              ry="6"
              fill="#4ade80"
              transform="rotate(20,36,32)"
            />
            <ellipse
              cx="42"
              cy="22"
              rx="6"
              ry="8"
              fill="#60a5fa"
              transform="rotate(-15,42,22)"
            />
          </svg>
        </>
      );
    case "Navratri":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-10 h-12 opacity-40`}
            viewBox="0 0 40 48"
          >
            <ellipse
              cx="20"
              cy="6"
              rx="10"
              ry="4"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="14"
              y1="6"
              x2="14"
              y2="2"
              stroke="#fbbf24"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1="6"
              x2="20"
              y2="0"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line
              x1="26"
              y1="6"
              x2="26"
              y2="2"
              stroke="#fbbf24"
              strokeWidth="1"
            />
            <circle cx="20" cy="12" r="6" fill="#d97706" />
            <path
              d="M14 18 Q10 28 12 38 Q16 42 20 42 Q24 42 28 38 Q30 28 26 18 Z"
              fill="#dc2626"
            />
            <path d="M14 18 Q20 22 26 18" fill="#fbbf24" />
            <line
              x1="14"
              y1="22"
              x2="6"
              y2="18"
              stroke="#d97706"
              strokeWidth="2"
            />
            <line
              x1="26"
              y1="22"
              x2="34"
              y2="18"
              stroke="#d97706"
              strokeWidth="2"
            />
            <line
              x1="6"
              y1="18"
              x2="4"
              y2="14"
              stroke="#94a3b8"
              strokeWidth="1"
            />
            <line
              x1="34"
              y1="18"
              x2="36"
              y2="14"
              stroke="#94a3b8"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-8 h-8 opacity-55`}
            viewBox="0 0 32 32"
          >
            <line
              x1="4"
              y1="28"
              x2="22"
              y2="4"
              stroke="#dc2626"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="28"
              x2="10"
              y2="4"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="22" cy="4" r="2.5" fill="#ef4444" />
            <circle cx="10" cy="4" r="2.5" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-8 h-8 opacity-55`}
            viewBox="0 0 32 32"
          >
            <line
              x1="4"
              y1="28"
              x2="22"
              y2="4"
              stroke="#a855f7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="28"
              y1="28"
              x2="10"
              y2="4"
              stroke="#f97316"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="22" cy="4" r="2.5" fill="#a855f7" />
            <circle cx="10" cy="4" r="2.5" fill="#f97316" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-10 h-8 opacity-50`}
            viewBox="0 0 40 32"
          >
            <path
              d="M20 28 C20 28 10 20 10 12 C10 8 14 6 20 10 C26 6 30 8 30 12 C30 20 20 28 20 28 Z"
              fill="#f9a8d4"
            />
            <path d="M20 28 C20 28 4 22 4 14 C4 10 8 10 12 14" fill="#fda4af" />
            <path
              d="M20 28 C20 28 36 22 36 14 C36 10 32 10 28 14"
              fill="#fda4af"
            />
            <circle cx="20" cy="16" r="3" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-8 h-8 opacity-45`}
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="16" r="2" fill="#fbbf24" />
            <circle cx="8" cy="10" r="1.5" fill="#dc2626" />
            <circle cx="24" cy="10" r="1.5" fill="#dc2626" />
            <circle cx="8" cy="22" r="1.5" fill="#f97316" />
            <circle cx="24" cy="22" r="1.5" fill="#f97316" />
            <circle cx="16" cy="6" r="1.5" fill="#a855f7" />
            <circle cx="16" cy="26" r="1.5" fill="#a855f7" />
            <circle cx="6" cy="16" r="1.5" fill="#fbbf24" />
            <circle cx="26" cy="16" r="1.5" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-8 h-8 opacity-45`}
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="16" r="2" fill="#fbbf24" />
            <circle cx="8" cy="10" r="1.5" fill="#dc2626" />
            <circle cx="24" cy="10" r="1.5" fill="#dc2626" />
            <circle cx="8" cy="22" r="1.5" fill="#f97316" />
            <circle cx="24" cy="22" r="1.5" fill="#f97316" />
            <circle cx="16" cy="6" r="1.5" fill="#a855f7" />
            <circle cx="16" cy="26" r="1.5" fill="#a855f7" />
          </svg>
        </>
      );
    case "Halloween":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-10 h-10 opacity-55`}
            viewBox="0 0 40 40"
          >
            <ellipse cx="14" cy="22" rx="8" ry="10" fill="#ea580c" />
            <ellipse cx="20" cy="22" rx="9" ry="11" fill="#f97316" />
            <ellipse cx="26" cy="22" rx="8" ry="10" fill="#ea580c" />
            <path d="M16 14 Q20 10 24 14" fill="#15803d" />
            <line
              x1="20"
              y1="10"
              x2="20"
              y2="6"
              stroke="#15803d"
              strokeWidth="2"
            />
            <polygon points="14,20 12,24 16,24" fill="#7c2d12" />
            <polygon points="26,20 24,24 28,24" fill="#7c2d12" />
            <path d="M13 28 Q16 32 20 30 Q24 32 27 28" fill="#7c2d12" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-8 h-9 opacity-40`}
            viewBox="0 0 32 36"
          >
            <path
              d="M6 28 Q6 8 16 6 Q26 8 26 28 Q22 24 18 28 Q16 24 14 28 Q10 24 6 28 Z"
              fill="white"
            />
            <circle cx="12" cy="18" r="2.5" fill="#1e1b4b" />
            <circle cx="20" cy="18" r="2.5" fill="#1e1b4b" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 right-0 w-10 h-10 opacity-40`}
            viewBox="0 0 40 40"
          >
            <line
              x1="40"
              y1="0"
              x2="20"
              y2="20"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <line
              x1="40"
              y1="10"
              x2="20"
              y2="20"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <line
              x1="40"
              y1="20"
              x2="20"
              y2="20"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <line
              x1="30"
              y1="0"
              x2="20"
              y2="20"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <path
              d="M28 8 Q34 14 32 20"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <path
              d="M34 4 Q38 10 36 18"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <circle cx="28" cy="4" r="3" fill="#1e1b4b" />
            <line
              x1="24"
              y1="4"
              x2="26"
              y2="0"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <line
              x1="32"
              y1="4"
              x2="34"
              y2="0"
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-10 h-6 opacity-50`}
            viewBox="0 0 40 24"
          >
            <path
              d="M20 12 C18 8 10 4 2 8 C6 10 10 12 12 12 C10 14 8 16 8 18 C12 16 16 14 20 12 Z"
              fill="#1e1b4b"
            />
            <path
              d="M20 12 C22 8 30 4 38 8 C34 10 30 12 28 12 C30 14 32 16 32 18 C28 16 24 14 20 12 Z"
              fill="#1e1b4b"
            />
            <ellipse cx="20" cy="12" rx="3" ry="4" fill="#312e81" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-8 h-5 opacity-45`}
            viewBox="0 0 32 20"
          >
            <path
              d="M16 10 C14 6 8 2 2 6 C5 8 8 10 10 10 C8 12 6 14 6 16 C9 13 12 11 16 10 Z"
              fill="#1e1b4b"
            />
            <path
              d="M16 10 C18 6 24 2 30 6 C27 8 24 10 22 10 C24 12 26 14 26 16 C23 13 20 11 16 10 Z"
              fill="#1e1b4b"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-4 h-4 opacity-50`}
            viewBox="0 0 16 16"
          >
            <path d="M12 8 A6 6 0 1 1 6 2 A5 5 0 0 0 12 8 Z" fill="#fde68a" />
          </svg>
        </>
      );
    case "Mother's Day":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-1/2 -translate-x-1/2 w-12 h-10 opacity-50`}
            viewBox="0 0 48 40"
          >
            <circle cx="24" cy="10" r="6" fill="#f9a8d4" />
            <circle cx="24" cy="6" r="4" fill="#fda4af" />
            <circle cx="18" cy="12" r="5" fill="#f472b6" />
            <circle cx="30" cy="12" r="5" fill="#e879f9" />
            <circle cx="16" cy="8" r="4" fill="#fbcfe8" />
            <circle cx="32" cy="8" r="4" fill="#f9a8d4" />
            <circle cx="24" cy="10" r="3" fill="#fef08a" />
            <path
              d="M18 18 L24 30 L30 18"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-6 h-6 opacity-55`}
            viewBox="0 0 24 24"
          >
            <path
              d="M12 21 C5 15 1 10 1 6.5 A5 5 0 0 1 12 5 A5 5 0 0 1 23 6.5 C23 10 19 15 12 21 Z"
              fill="#f43f5e"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-9 h-6 opacity-50`}
            viewBox="0 0 36 24"
          >
            <path
              d="M18 12 C12 6 2 4 4 10 C6 16 16 14 18 12 Z"
              fill="#f9a8d4"
            />
            <path
              d="M18 12 C24 6 34 4 32 10 C30 16 20 14 18 12 Z"
              fill="#f9a8d4"
            />
            <circle cx="18" cy="12" r="2.5" fill="#e879f9" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-5 h-5 opacity-50`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#fb7185"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-5 h-5 opacity-50`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#fb7185"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 left-0 w-9 h-9 opacity-40`}
            viewBox="0 0 36 36"
          >
            <circle cx="18" cy="10" r="5" fill="#f9a8d4" />
            <circle cx="26" cy="18" r="5" fill="#f9a8d4" />
            <circle cx="18" cy="26" r="5" fill="#f9a8d4" />
            <circle cx="10" cy="18" r="5" fill="#f9a8d4" />
            <circle cx="18" cy="18" r="4" fill="#fef9c3" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 right-0 w-9 h-9 opacity-40`}
            viewBox="0 0 36 36"
          >
            <circle cx="18" cy="10" r="5" fill="#fda4af" />
            <circle cx="26" cy="18" r="5" fill="#fda4af" />
            <circle cx="18" cy="26" r="5" fill="#fda4af" />
            <circle cx="10" cy="18" r="5" fill="#fda4af" />
            <circle cx="18" cy="18" r="4" fill="#fef9c3" />
          </svg>
        </>
      );
    case "Father's Day":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-8 h-10 opacity-50`}
            viewBox="0 0 32 40"
          >
            <polygon
              points="16,4 22,12 18,36 16,38 14,36 10,12"
              fill="#1d4ed8"
            />
            <polygon points="16,4 22,12 16,14 10,12" fill="#1e40af" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-10 h-7 opacity-50`}
            viewBox="0 0 40 28"
          >
            <path d="M4 18 Q4 10 20 8 Q36 10 36 18 Z" fill="#1e293b" />
            <rect x="2" y="18" width="36" height="4" rx="2" fill="#0f172a" />
            <rect x="10" y="4" width="20" height="6" rx="3" fill="#334155" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2 L11.5 7.5 L17 7.5 L12.5 11 L14 17 L10 13.5 L6 17 L7.5 11 L3 7.5 L8.5 7.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-10 h-6 opacity-45`}
            viewBox="0 0 40 24"
          >
            <path
              d="M20 12 C14 6 4 4 6 10 C8 16 18 14 20 12 Z"
              fill="#3b82f6"
            />
            <path
              d="M20 12 C26 6 36 4 34 10 C32 16 22 14 20 12 Z"
              fill="#3b82f6"
            />
            <circle cx="20" cy="12" r="2.5" fill="#1d4ed8" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-4 h-4 opacity-45`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 1 L9 5.5 L14 5.5 L10 8.5 L11.5 13 L8 10.5 L4.5 13 L6 8.5 L2 5.5 L7 5.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-4 h-4 opacity-45`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 1 L9 5.5 L14 5.5 L10 8.5 L11.5 13 L8 10.5 L4.5 13 L6 8.5 L2 5.5 L7 5.5 Z"
              fill="#fbbf24"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 left-0 w-8 h-8 opacity-30`}
            viewBox="0 0 32 32"
          >
            <path
              d="M2 30 L12 30 M2 30 L2 20"
              stroke="#1d4ed8"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 right-0 w-8 h-8 opacity-30`}
            viewBox="0 0 32 32"
          >
            <path
              d="M30 30 L20 30 M30 30 L30 20"
              stroke="#1d4ed8"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
        </>
      );
    case "Raksha Bandhan":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-10 h-10 opacity-55`}
            viewBox="0 0 40 40"
          >
            <circle
              cx="20"
              cy="20"
              r="8"
              fill="none"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <circle cx="20" cy="20" r="5" fill="#fbbf24" />
            <circle cx="20" cy="12" r="3" fill="#dc2626" />
            <circle cx="28" cy="20" r="3" fill="#dc2626" />
            <circle cx="20" cy="28" r="3" fill="#dc2626" />
            <circle cx="12" cy="20" r="3" fill="#dc2626" />
            <line
              x1="4"
              y1="20"
              x2="12"
              y2="20"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="2,1"
            />
            <line
              x1="28"
              y1="20"
              x2="36"
              y2="20"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="2,1"
            />
            <circle cx="20" cy="20" r="2" fill="#7c3aed" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-10 h-10 opacity-45`}
            viewBox="0 0 40 40"
          >
            <circle cx="14" cy="10" r="5" fill="#f9a8d4" />
            <circle cx="22" cy="10" r="5" fill="#fda4af" />
            <circle cx="10" cy="18" r="5" fill="#f472b6" />
            <circle cx="14" cy="10" r="3" fill="#fef9c3" />
            <circle cx="22" cy="10" r="3" fill="#fef9c3" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-55`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#f43f5e"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-full h-full opacity-15`}
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <path
              d="M0 10 Q25 5 50 10 Q75 15 100 10"
              fill="none"
              stroke="#ef4444"
              strokeWidth="1.5"
            />
            <path
              d="M0 60 Q25 55 50 60 Q75 65 100 60"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 right-0 w-10 h-10 opacity-45`}
            viewBox="0 0 40 40"
          >
            <circle cx="26" cy="30" r="5" fill="#f9a8d4" />
            <circle cx="18" cy="30" r="5" fill="#fda4af" />
            <circle cx="30" cy="22" r="5" fill="#f472b6" />
            <circle cx="26" cy="30" r="3" fill="#fef9c3" />
            <circle cx="18" cy="30" r="3" fill="#fef9c3" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-5 h-5 opacity-50`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#f43f5e"
            />
          </svg>
        </>
      );
    case "Ganesh Chaturthi":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-12 h-12 opacity-45`}
            viewBox="0 0 48 48"
          >
            <ellipse cx="8" cy="18" rx="6" ry="9" fill="#f97316" />
            <ellipse cx="40" cy="18" rx="6" ry="9" fill="#f97316" />
            <ellipse cx="8" cy="18" rx="4" ry="6" fill="#fdba74" />
            <ellipse cx="40" cy="18" rx="4" ry="6" fill="#fdba74" />
            <ellipse cx="24" cy="16" rx="12" ry="13" fill="#f97316" />
            <path
              d="M18 24 Q14 30 16 36 Q18 40 24 38"
              fill="none"
              stroke="#ea580c"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="19" cy="14" r="2" fill="#1e293b" />
            <circle cx="29" cy="14" r="2" fill="#1e293b" />
            <path
              d="M14 6 L18 2 L24 4 L30 2 L34 6"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <ellipse cx="24" cy="38" rx="10" ry="8" fill="#fbbf24" />
            <circle cx="36" cy="34" r="4" fill="#f9a8d4" />
            <path d="M34 34 Q36 30 38 34" fill="#fde68a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-9 h-8 opacity-45`}
            viewBox="0 0 36 32"
          >
            <path
              d="M18 28 C18 28 8 20 8 12 C8 8 12 6 18 10 C24 6 28 8 28 12 C28 20 18 28 18 28 Z"
              fill="#f9a8d4"
            />
            <path d="M18 28 C18 28 2 22 2 14 C2 10 6 10 10 14" fill="#fda4af" />
            <path
              d="M18 28 C18 28 34 22 34 14 C34 10 30 10 26 14"
              fill="#fda4af"
            />
            <circle cx="18" cy="16" r="2.5" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 right-0 w-9 h-8 opacity-45`}
            viewBox="0 0 36 32"
          >
            <path
              d="M18 28 C18 28 8 20 8 12 C8 8 12 6 18 10 C24 6 28 8 28 12 C28 20 18 28 18 28 Z"
              fill="#fda4af"
            />
            <path d="M18 28 C18 28 2 22 2 14 C2 10 6 10 10 14" fill="#f9a8d4" />
            <path
              d="M18 28 C18 28 34 22 34 14 C34 10 30 10 26 14"
              fill="#f9a8d4"
            />
            <circle cx="18" cy="16" r="2.5" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-8 h-7 opacity-50`}
            viewBox="0 0 32 28"
          >
            <path
              d="M16 4 Q8 4 6 12 Q4 20 16 24 Q28 20 26 12 Q24 4 16 4 Z"
              fill="#fde68a"
            />
            <path
              d="M10 10 Q16 6 22 10"
              fill="none"
              stroke="#d97706"
              strokeWidth="1"
            />
            <path
              d="M8 16 Q16 12 24 16"
              fill="none"
              stroke="#d97706"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-7 h-6 opacity-50`}
            viewBox="0 0 28 24"
          >
            <path
              d="M14 3 Q7 3 5 10 Q3 17 14 21 Q25 17 23 10 Q21 3 14 3 Z"
              fill="#fde68a"
            />
            <path
              d="M9 9 Q14 6 19 9"
              fill="none"
              stroke="#d97706"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 opacity-40`}
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="4" r="2" fill="#f97316" />
            <circle cx="8" cy="12" r="1.5" fill="#fbbf24" />
            <circle cx="24" cy="12" r="1.5" fill="#fbbf24" />
            <circle cx="4" cy="20" r="1.5" fill="#f97316" />
            <circle cx="28" cy="20" r="1.5" fill="#f97316" />
          </svg>
        </>
      );
    case "Onam":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 opacity-30`}
            viewBox="0 0 56 56"
          >
            <circle cx="28" cy="28" r="4" fill="#fbbf24" />
            <circle cx="28" cy="14" r="4" fill="#f43f5e" />
            <circle cx="42" cy="28" r="4" fill="#4ade80" />
            <circle cx="28" cy="42" r="4" fill="#f43f5e" />
            <circle cx="14" cy="28" r="4" fill="#4ade80" />
            <circle cx="38" cy="14" r="3" fill="#f97316" />
            <circle cx="42" cy="38" r="3" fill="#f97316" />
            <circle cx="18" cy="42" r="3" fill="#60a5fa" />
            <circle cx="14" cy="18" r="3" fill="#60a5fa" />
            <circle cx="28" cy="20" r="3" fill="#fda4af" />
            <circle cx="36" cy="28" r="3" fill="#fda4af" />
            <circle cx="28" cy="36" r="3" fill="#fda4af" />
            <circle cx="20" cy="28" r="3" fill="#fda4af" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-10 h-8 opacity-45`}
            viewBox="0 0 40 32"
          >
            <path
              d="M20 28 C20 28 10 20 10 12 C10 8 14 6 20 10 C26 6 30 8 30 12 C30 20 20 28 20 28 Z"
              fill="#f9a8d4"
            />
            <path d="M20 28 C20 28 4 22 4 14 C4 10 8 10 12 14" fill="#fda4af" />
            <path
              d="M20 28 C20 28 36 22 36 14 C36 10 32 10 28 14"
              fill="#fda4af"
            />
            <circle cx="20" cy="16" r="2.5" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 right-0 w-10 h-10 opacity-40`}
            viewBox="0 0 40 40"
          >
            <path
              d="M36 4 C36 4 4 16 4 36 C16 28 28 18 36 4 Z"
              fill="#4ade80"
            />
            <path
              d="M36 4 C36 4 8 20 4 36 C20 26 32 14 36 4 Z"
              fill="#86efac"
            />
            <line
              x1="36"
              y1="4"
              x2="4"
              y2="36"
              stroke="#16a34a"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 left-0 w-10 h-10 opacity-40`}
            viewBox="0 0 40 40"
            style={{ transform: "rotate(180deg)" }}
          >
            <path
              d="M36 4 C36 4 4 16 4 36 C16 28 28 18 36 4 Z"
              fill="#4ade80"
            />
            <path
              d="M36 4 C36 4 8 20 4 36 C20 26 32 14 36 4 Z"
              fill="#86efac"
            />
            <line
              x1="36"
              y1="4"
              x2="4"
              y2="36"
              stroke="#16a34a"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-0 right-0 w-10 h-8 opacity-45`}
            viewBox="0 0 40 32"
          >
            <path
              d="M20 28 C20 28 10 20 10 12 C10 8 14 6 20 10 C26 6 30 8 30 12 C30 20 20 28 20 28 Z"
              fill="#fda4af"
            />
            <path d="M20 28 C20 28 4 22 4 14 C4 10 8 10 12 14" fill="#f9a8d4" />
            <path
              d="M20 28 C20 28 36 22 36 14 C36 10 32 10 28 14"
              fill="#f9a8d4"
            />
            <circle cx="20" cy="16" r="2.5" fill="#fbbf24" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-full h-full opacity-20`}
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <circle cx="50" cy="4" r="2.5" fill="#f43f5e" />
            <circle cx="50" cy="66" r="2.5" fill="#4ade80" />
          </svg>
        </>
      );
    case "Baisakhi":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-0 left-0 w-10 h-12 opacity-45`}
            viewBox="0 0 40 48"
          >
            <line
              x1="20"
              y1="48"
              x2="20"
              y2="10"
              stroke="#d97706"
              strokeWidth="2"
            />
            <line
              x1="14"
              y1="48"
              x2="12"
              y2="16"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <line
              x1="26"
              y1="48"
              x2="28"
              y2="16"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <ellipse cx="20" cy="8" rx="4" ry="6" fill="#fbbf24" />
            <ellipse
              cx="12"
              cy="14"
              rx="3"
              ry="5"
              fill="#fbbf24"
              transform="rotate(-15,12,14)"
            />
            <ellipse
              cx="28"
              cy="14"
              rx="3"
              ry="5"
              fill="#fbbf24"
              transform="rotate(15,28,14)"
            />
            <ellipse
              cx="8"
              cy="18"
              rx="2.5"
              ry="4"
              fill="#d97706"
              transform="rotate(-25,8,18)"
            />
            <ellipse
              cx="32"
              cy="18"
              rx="2.5"
              ry="4"
              fill="#d97706"
              transform="rotate(25,32,18)"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-0 right-0 w-10 h-12 opacity-45`}
            viewBox="0 0 40 48"
            style={{ transform: "scaleX(-1)" }}
          >
            <line
              x1="20"
              y1="48"
              x2="20"
              y2="10"
              stroke="#d97706"
              strokeWidth="2"
            />
            <line
              x1="14"
              y1="48"
              x2="12"
              y2="16"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <line
              x1="26"
              y1="48"
              x2="28"
              y2="16"
              stroke="#d97706"
              strokeWidth="1.5"
            />
            <ellipse cx="20" cy="8" rx="4" ry="6" fill="#fbbf24" />
            <ellipse
              cx="12"
              cy="14"
              rx="3"
              ry="5"
              fill="#fbbf24"
              transform="rotate(-15,12,14)"
            />
            <ellipse
              cx="28"
              cy="14"
              rx="3"
              ry="5"
              fill="#fbbf24"
              transform="rotate(15,28,14)"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-9 h-9 opacity-50`}
            viewBox="0 0 36 36"
          >
            <circle cx="18" cy="18" r="8" fill="#fbbf24" />
            <line
              x1="18"
              y1="2"
              x2="18"
              y2="8"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="18"
              y1="28"
              x2="18"
              y2="34"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="2"
              y1="18"
              x2="8"
              y2="18"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="28"
              y1="18"
              x2="34"
              y2="18"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="6"
              y1="6"
              x2="10"
              y2="10"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="26"
              y1="26"
              x2="30"
              y2="30"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="30"
              y1="6"
              x2="26"
              y2="10"
              stroke="#f97316"
              strokeWidth="2"
            />
            <line
              x1="10"
              y1="26"
              x2="6"
              y2="30"
              stroke="#f97316"
              strokeWidth="2"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-9 h-8 opacity-50`}
            viewBox="0 0 36 32"
          >
            <circle cx="10" cy="8" r="4" fill="#fde047" />
            <circle cx="10" cy="8" r="2" fill="#ca8a04" />
            <line
              x1="10"
              y1="12"
              x2="10"
              y2="28"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
            <circle cx="22" cy="12" r="4" fill="#fde047" />
            <circle cx="22" cy="12" r="2" fill="#ca8a04" />
            <line
              x1="22"
              y1="16"
              x2="22"
              y2="28"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-9 h-8 opacity-45`}
            viewBox="0 0 36 32"
          >
            <ellipse cx="18" cy="16" rx="14" ry="8" fill="#d97706" />
            <ellipse
              cx="18"
              cy="16"
              rx="14"
              ry="8"
              fill="none"
              stroke="#92400e"
              strokeWidth="1.5"
            />
            <ellipse cx="18" cy="10" rx="14" ry="5" fill="#fbbf24" />
            <ellipse cx="18" cy="22" rx="14" ry="5" fill="#fbbf24" />
            <line
              x1="4"
              y1="10"
              x2="4"
              y2="22"
              stroke="#92400e"
              strokeWidth="1"
            />
            <line
              x1="32"
              y1="10"
              x2="32"
              y2="22"
              stroke="#92400e"
              strokeWidth="1"
            />
            <line
              x1="26"
              y1="8"
              x2="30"
              y2="4"
              stroke="#92400e"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 opacity-45`}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="10" r="4" fill="#fde047" />
            <circle cx="12" cy="10" r="2" fill="#ca8a04" />
            <line
              x1="12"
              y1="14"
              x2="12"
              y2="22"
              stroke="#4ade80"
              strokeWidth="1.5"
            />
          </svg>
        </>
      );
    case "Business":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-8 h-8 opacity-35`}
            viewBox="0 0 32 32"
          >
            <path
              d="M2 2 L12 2 M2 2 L2 12"
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-8 h-8 opacity-35`}
            viewBox="0 0 32 32"
          >
            <path
              d="M30 2 L20 2 M30 2 L30 12"
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-8 h-8 opacity-35`}
            viewBox="0 0 32 32"
          >
            <path
              d="M2 30 L12 30 M2 30 L2 20"
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-8 h-8 opacity-35`}
            viewBox="0 0 32 32"
          >
            <path
              d="M30 30 L20 30 M30 30 L30 20"
              stroke="#94a3b8"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-9 h-8 opacity-40`}
            viewBox="0 0 36 32"
          >
            <rect
              x="2"
              y="12"
              width="32"
              height="18"
              rx="3"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <path
              d="M12 12 L12 8 Q12 4 18 4 Q24 4 24 8 L24 12"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1="2"
              y1="21"
              x2="34"
              y2="21"
              stroke="#64748b"
              strokeWidth="1"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-12 h-7 opacity-35`}
            viewBox="0 0 48 28"
          >
            <path
              d="M2 20 L14 14 Q18 10 22 14 L26 14 Q30 10 34 14 L46 20"
              fill="none"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="24" cy="14" r="3" fill="#94a3b8" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1/2 right-1 w-6 h-6 opacity-25`}
            viewBox="0 0 24 24"
          >
            <polygon
              points="12,2 22,12 12,22 2,12"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
          </svg>
        </>
      );
    case "Get Well Soon":
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-8 h-8 opacity-45`}
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="10" r="4" fill="#86efac" />
            <circle cx="22" cy="16" r="4" fill="#86efac" />
            <circle cx="16" cy="22" r="4" fill="#86efac" />
            <circle cx="10" cy="16" r="4" fill="#86efac" />
            <circle cx="16" cy="16" r="3.5" fill="#fef08a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-5 h-5 opacity-50`}
            viewBox="0 0 20 20"
          >
            <path
              d="M10 17 C4 12 1 8 1 5.5 A4 4 0 0 1 10 4.5 A4 4 0 0 1 19 5.5 C19 8 16 12 10 17 Z"
              fill="#4ade80"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1/2 -translate-x-1/2 w-6 h-6 opacity-45`}
            viewBox="0 0 24 24"
          >
            <rect x="8" y="2" width="8" height="20" rx="2" fill="#ef4444" />
            <rect x="2" y="8" width="20" height="8" rx="2" fill="#ef4444" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1/2 -translate-x-1/2 w-12 h-7 opacity-40`}
            viewBox="0 0 48 28"
          >
            <path
              d="M4 24 Q4 4 24 4 Q44 4 44 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            />
            <path
              d="M8 24 Q8 8 24 8 Q40 8 40 24"
              fill="none"
              stroke="#f97316"
              strokeWidth="2"
            />
            <path
              d="M12 24 Q12 12 24 12 Q36 12 36 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
            />
            <path
              d="M16 24 Q16 16 24 16 Q32 16 32 24"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
            />
            <path
              d="M20 24 Q20 20 24 20 Q28 20 28 24"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-7 h-7 opacity-40`}
            viewBox="0 0 28 28"
          >
            <circle cx="14" cy="9" r="3.5" fill="#86efac" />
            <circle cx="19" cy="14" r="3.5" fill="#86efac" />
            <circle cx="14" cy="19" r="3.5" fill="#86efac" />
            <circle cx="9" cy="14" r="3.5" fill="#86efac" />
            <circle cx="14" cy="14" r="3" fill="#fef08a" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-6 h-6 opacity-40`}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="7" r="3" fill="#bbf7d0" />
            <circle cx="17" cy="12" r="3" fill="#bbf7d0" />
            <circle cx="12" cy="17" r="3" fill="#bbf7d0" />
            <circle cx="7" cy="12" r="3" fill="#bbf7d0" />
            <circle cx="12" cy="12" r="2.5" fill="#fef08a" />
          </svg>
        </>
      );
    case "Blank":
      return null;
    default:
      return (
        <>
          <svg
            aria-hidden="true"
            className={`${base} top-1 left-1 w-4 h-4 opacity-40`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 1 L9 5.5 L14 5.5 L10 8.5 L11.5 13 L8 10.5 L4.5 13 L6 8.5 L2 5.5 L7 5.5 Z"
              fill="white"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} top-1 right-1 w-4 h-4 opacity-40`}
            viewBox="0 0 16 16"
          >
            <path
              d="M8 1 L9 5.5 L14 5.5 L10 8.5 L11.5 13 L8 10.5 L4.5 13 L6 8.5 L2 5.5 L7 5.5 Z"
              fill="white"
            />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 left-1 w-3 h-3 opacity-35`}
            viewBox="0 0 12 12"
          >
            <circle cx="6" cy="6" r="4" fill="white" />
          </svg>
          <svg
            aria-hidden="true"
            className={`${base} bottom-1 right-1 w-3 h-3 opacity-35`}
            viewBox="0 0 12 12"
          >
            <circle cx="6" cy="6" r="4" fill="white" />
          </svg>
        </>
      );
  }
}

function TemplateCard({
  template,
  onClick,
}: { template: Template; onClick: () => void }) {
  return (
    <button
      type="button"
      data-ocid="gallery.item.1"
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl border border-border/30 text-left w-full"
      onClick={onClick}
    >
      {/* Card Preview */}
      <div
        className="relative w-full"
        style={{ paddingBottom: "70%", background: template.background }}
      >
        {/* Canva-style layout layers */}
        {template.layoutType === "split-panel" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute top-0 left-0 h-full"
              style={{
                width: "35%",
                background: template.layoutColors?.[0] ?? "rgba(0,0,0,0.2)",
              }}
            />
            <div
              className="absolute top-0 h-full"
              style={{
                left: "35%",
                width: "2px",
                background:
                  template.layoutColors?.[1] ?? "rgba(255,255,255,0.3)",
              }}
            />
          </div>
        )}
        {template.layoutType === "banner-overlay" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                height: "38%",
                background: template.layoutColors?.[0] ?? "rgba(0,0,0,0.3)",
                borderRadius: "0 0 18px 18px",
              }}
            />
          </div>
        )}
        {template.layoutType === "framed" && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
          >
            <rect
              x="6"
              y="5"
              width="88"
              height="60"
              fill="none"
              stroke={template.layoutColors?.[0] ?? "#d4af37"}
              strokeWidth="2.5"
              rx="2"
            />
            {template.layoutColors?.[1] && (
              <rect
                x="9"
                y="8"
                width="82"
                height="54"
                fill="none"
                stroke={template.layoutColors[1]}
                strokeWidth="1"
                rx="1"
              />
            )}
          </svg>
        )}
        {template.layoutType === "diagonal-split" && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
          >
            <polygon
              points="0,0 42,0 0,70"
              fill={template.layoutColors?.[0] ?? "rgba(0,0,0,0.25)"}
            />
          </svg>
        )}
        {template.layoutType === "bold-header" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <div
              className="absolute top-0 left-0 w-full"
              style={{
                height: "45%",
                background: template.layoutColors?.[0] ?? "rgba(0,0,0,0.4)",
              }}
            />
            {template.layoutColors?.[1] && (
              <div
                className="absolute left-0 w-full"
                style={{
                  top: "45%",
                  height: "3px",
                  background: template.layoutColors[1],
                }}
              />
            )}
          </div>
        )}
        {template.layoutType === "circular-badge" && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 70"
            preserveAspectRatio="xMidYMid meet"
            style={{ zIndex: 0 }}
          >
            <circle
              cx="62"
              cy="35"
              r="38"
              fill={template.layoutColors?.[0] ?? "rgba(255,255,255,0.2)"}
            />
          </svg>
        )}
        {template.layoutType === "corner-block" && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
          >
            <polygon
              points="0,0 22,0 0,20"
              fill={template.layoutColors?.[0] ?? "rgba(255,255,255,0.3)"}
            />
            <polygon
              points="100,0 78,0 100,20"
              fill={template.layoutColors?.[0] ?? "rgba(255,255,255,0.3)"}
            />
            <polygon
              points="0,70 22,70 0,50"
              fill={template.layoutColors?.[0] ?? "rgba(255,255,255,0.3)"}
            />
            <polygon
              points="100,70 78,70 100,50"
              fill={template.layoutColors?.[0] ?? "rgba(255,255,255,0.3)"}
            />
          </svg>
        )}
        {template.layoutType === "minimal-lines" && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
            style={{ zIndex: 0 }}
          >
            <line
              x1="0"
              y1="14"
              x2="100"
              y2="14"
              stroke={template.layoutColors?.[0] ?? "rgba(255,255,255,0.4)"}
              strokeWidth="1.5"
            />
            <line
              x1="0"
              y1="56"
              x2="100"
              y2="56"
              stroke={template.layoutColors?.[0] ?? "rgba(255,255,255,0.4)"}
              strokeWidth="1.5"
            />
            <line
              x1="8"
              y1="0"
              x2="8"
              y2="70"
              stroke={template.layoutColors?.[0] ?? "rgba(255,255,255,0.4)"}
              strokeWidth="2.5"
            />
          </svg>
        )}
        {/* Decorative corner ornaments for luxe/floral styles */}
        {template.decorStyle === "luxe" && (
          <>
            <svg
              aria-hidden="true"
              className="absolute top-1 left-1 w-8 h-8 opacity-40"
              viewBox="0 0 40 40"
            >
              <path
                d="M 2 2 L 15 2 M 2 2 L 2 15"
                stroke="#d4af37"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="2" cy="2" r="2" fill="#d4af37" />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute top-1 right-1 w-8 h-8 opacity-40"
              viewBox="0 0 40 40"
            >
              <path
                d="M 38 2 L 25 2 M 38 2 L 38 15"
                stroke="#d4af37"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="38" cy="2" r="2" fill="#d4af37" />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute bottom-1 left-1 w-8 h-8 opacity-40"
              viewBox="0 0 40 40"
            >
              <path
                d="M 2 38 L 15 38 M 2 38 L 2 25"
                stroke="#d4af37"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="2" cy="38" r="2" fill="#d4af37" />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute bottom-1 right-1 w-8 h-8 opacity-40"
              viewBox="0 0 40 40"
            >
              <path
                d="M 38 38 L 25 38 M 38 38 L 38 25"
                stroke="#d4af37"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="38" cy="38" r="2" fill="#d4af37" />
            </svg>
          </>
        )}
        {template.decorStyle === "floral" && (
          <>
            <svg
              aria-hidden="true"
              className="absolute top-0 left-0 w-16 h-16 opacity-20"
              viewBox="0 0 60 60"
            >
              <path
                d="M10 30 Q15 10 30 10 Q15 10 30 30 Q15 50 10 30"
                fill="#c9a882"
              />
              <path
                d="M50 30 Q45 10 30 10 Q45 10 30 30 Q45 50 50 30"
                fill="#c9a882"
              />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute bottom-0 right-0 w-16 h-16 opacity-20"
              viewBox="0 0 60 60"
            >
              <path
                d="M10 30 Q15 10 30 10 Q15 10 30 30 Q15 50 10 30"
                fill="#c9a882"
              />
              <path
                d="M50 30 Q45 10 30 10 Q45 10 30 30 Q45 50 50 30"
                fill="#c9a882"
              />
            </svg>
          </>
        )}
        {template.decorStyle === "sparkle" && (
          <>
            <svg
              aria-hidden="true"
              className="absolute top-2 left-2 w-5 h-5 opacity-60"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
                fill="#d4af37"
              />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute top-2 right-2 w-5 h-5 opacity-60"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
                fill="#d4af37"
              />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute bottom-2 left-2 w-5 h-5 opacity-60"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
                fill="#d4af37"
              />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute bottom-2 right-2 w-5 h-5 opacity-60"
              viewBox="0 0 20 20"
            >
              <path
                d="M10 2 L11 8 L17 10 L11 12 L10 18 L9 12 L3 10 L9 8 Z"
                fill="#d4af37"
              />
            </svg>
          </>
        )}
        {template.decorStyle === "ribbon" && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
            viewBox="0 0 100 70"
            preserveAspectRatio="none"
          >
            <path
              d="M -5 0 L 30 70"
              stroke="#d4af37"
              strokeWidth="8"
              fill="none"
            />
            <path
              d="M 5 0 L 40 70"
              stroke="#d4af37"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M 70 0 L 105 70"
              stroke="#d4af37"
              strokeWidth="8"
              fill="none"
            />
            <path
              d="M 60 0 L 95 70"
              stroke="#d4af37"
              strokeWidth="4"
              fill="none"
            />
          </svg>
        )}
        {template.decorStyle === "botanical" && (
          <>
            <svg
              aria-hidden="true"
              className="absolute top-0 left-0 w-20 h-20 opacity-25 pointer-events-none"
              viewBox="0 0 80 80"
            >
              <path
                d="M 5 75 C 5 55 20 40 40 30 C 25 45 15 60 5 75 Z"
                fill="#16a34a"
              />
              <path
                d="M 5 75 C 15 55 35 40 55 35 C 38 50 20 62 5 75 Z"
                fill="#22c55e"
              />
              <path
                d="M 5 60 C 10 50 20 42 30 38"
                stroke="#15803d"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute bottom-0 right-0 w-20 h-20 opacity-25 pointer-events-none"
              viewBox="0 0 80 80"
              style={{ transform: "rotate(180deg)" }}
            >
              <path
                d="M 5 75 C 5 55 20 40 40 30 C 25 45 15 60 5 75 Z"
                fill="#16a34a"
              />
              <path
                d="M 5 75 C 15 55 35 40 55 35 C 38 50 20 62 5 75 Z"
                fill="#22c55e"
              />
              <path
                d="M 5 60 C 10 50 20 42 30 38"
                stroke="#15803d"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </>
        )}
        {template.decorStyle === "navratri" && (
          <>
            <svg
              aria-hidden="true"
              className="absolute right-0 top-0 w-3/5 h-full opacity-30 pointer-events-none"
              viewBox="0 0 100 140"
              preserveAspectRatio="none"
            >
              <rect x="40" y="0" width="60" height="140" fill="#991b1b" />
            </svg>
            <svg
              aria-hidden="true"
              className="absolute right-0 bottom-0 w-2/5 h-2/3 opacity-25 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#7f1d1d"
                strokeWidth="3"
              />
              <circle
                cx="80"
                cy="80"
                r="55"
                fill="none"
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <circle
                cx="80"
                cy="80"
                r="40"
                fill="none"
                stroke="#7f1d1d"
                strokeWidth="1"
              />
              <line
                key="nl-0"
                x1={135.0}
                y1={80.0}
                x2={148.0}
                y2={80.0}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-1"
                x1={130.81}
                y1={101.05}
                x2={142.82}
                y2={106.02}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-2"
                x1={118.89}
                y1={118.89}
                x2={128.08}
                y2={128.08}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-3"
                x1={101.05}
                y1={130.81}
                x2={106.02}
                y2={142.82}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-4"
                x1={80.0}
                y1={135.0}
                x2={80.0}
                y2={148.0}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-5"
                x1={58.95}
                y1={130.81}
                x2={53.98}
                y2={142.82}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-6"
                x1={41.11}
                y1={118.89}
                x2={31.92}
                y2={128.08}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-7"
                x1={29.19}
                y1={101.05}
                x2={17.18}
                y2={106.02}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-8"
                x1={25.0}
                y1={80.0}
                x2={12.0}
                y2={80.0}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-9"
                x1={29.19}
                y1={58.95}
                x2={17.18}
                y2={53.98}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-10"
                x1={41.11}
                y1={41.11}
                x2={31.92}
                y2={31.92}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-11"
                x1={58.95}
                y1={29.19}
                x2={53.98}
                y2={17.18}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-12"
                x1={80.0}
                y1={25.0}
                x2={80.0}
                y2={12.0}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-13"
                x1={101.05}
                y1={29.19}
                x2={106.02}
                y2={17.18}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-14"
                x1={118.89}
                y1={41.11}
                x2={128.08}
                y2={31.92}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
              <line
                key="nl-15"
                x1={130.81}
                y1={58.95}
                x2={142.82}
                y2={53.98}
                stroke="#7f1d1d"
                strokeWidth="1.5"
              />
            </svg>
          </>
        )}
        {template.overlayImage && (
          <img
            src={template.overlayImage}
            alt=""
            className="absolute pointer-events-none"
            style={{
              right: "2%",
              bottom: "0",
              height: "85%",
              width: "auto",
              objectFit: "contain",
              objectPosition: "bottom",
              zIndex: 2,
            }}
          />
        )}
        <CategoryDecor category={template.category} />
        {/* Text previews */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3">
          {template.previewElements.map((el, i) => (
            <div
              key={`${el.text}-${i}`}
              style={{
                fontSize: Math.round(el.fontSize * 0.38),
                color: el.color,
                fontWeight: el.bold ? "bold" : "normal",
                fontStyle: el.italic ? "italic" : "normal",
                textAlign: "center",
                lineHeight: 1.3,
                marginBottom: 2,
                textShadow: "0 1px 3px rgba(0,0,0,0.18)",
                maxWidth: "92%",
              }}
            >
              {el.text}
            </div>
          ))}
        </div>
      </div>
      {/* Label */}
      <div className="p-3 bg-card border-t border-border/20">
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {template.name}
            </p>
            <p className="text-xs text-muted-foreground">{template.category}</p>
          </div>
        </div>
      </div>
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          Use Template
        </span>
      </div>
    </button>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<"gallery" | "editor">("gallery");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("text");
  const [graphicsCategory, setGraphicsCategory] = useState("Celebrations");

  // Text controls
  const [newText, setNewText] = useState("Your message here");
  const [textFontSize, setTextFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#1a1a1a");
  const [textFontFamily, setTextFontFamily] = useState("sans-serif");
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);

  const categories = [
    "All",
    ...Array.from(new Set(TEMPLATES.map((t) => t.category))),
  ];

  const filteredTemplates = TEMPLATES.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.previewElements.some((el) => el.text.toLowerCase().includes(q));
    const matchesCat =
      selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openEditor = (template: Template) => {
    setCard({
      id: genId(),
      templateId: template.id,
      category: template.category,
      background: template.background,
      backgroundType: template.backgroundType,
      patternStyle: template.patternStyle,
      patternColor: undefined,
      overlayImage: template.overlayImage,
      elements: template.previewElements.map((el) => ({
        id: genId(),
        type: "text",
        content: el.text,
        x: el.x,
        y: el.y,
        fontSize: el.fontSize,
        color: el.color,
        fontFamily: "sans-serif",
        bold: el.bold ?? false,
        italic: el.italic ?? false,
      })),
    });
    setSelectedId(null);
    setView("editor");
  };

  const addText = () => {
    if (!newText.trim()) return;
    setCard((prev) =>
      prev
        ? {
            ...prev,
            elements: [
              ...prev.elements,
              {
                id: genId(),
                type: "text",
                content: newText,
                x: 50,
                y: 50,
                fontSize: textFontSize,
                color: textColor,
                fontFamily: textFontFamily,
                bold: textBold,
                italic: textItalic,
              },
            ],
          }
        : prev,
    );
    toast.success("Text added!");
  };

  const updateElement = useCallback(
    (id: string, updates: Partial<CardElement>) => {
      setCard((prev) =>
        prev
          ? {
              ...prev,
              elements: prev.elements.map((el) =>
                el.id === id ? ({ ...el, ...updates } as CardElement) : el,
              ),
            }
          : prev,
      );
    },
    [],
  );

  const selectedEl = card?.elements.find((e) => e.id === selectedId) ?? null;
  const selectedTextEl = selectedEl?.type === "text" ? selectedEl : null;

  const deleteSelected = () => {
    if (!selectedId) return;
    setCard((prev) =>
      prev
        ? {
            ...prev,
            elements: prev.elements.filter((e) => e.id !== selectedId),
          }
        : prev,
    );
    setSelectedId(null);
  };

  const handleDrag = useCallback((id: string, dx: number, dy: number) => {
    setCard((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id
            ? {
                ...el,
                x: Math.max(5, Math.min(95, el.x + dx)),
                y: Math.max(5, Math.min(95, el.y + dy)),
              }
            : el,
        ),
      };
    });
  }, []);

  const downloadCard = useCallback(() => {
    if (!card) return;
    const W = 800;
    const H = 560;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    if (card.backgroundType === "gradient") {
      const match = card.background.match(/linear-gradient\(([^,]+),(.+)\)/);
      if (match) {
        const stops = match[2].split(",").map((s) => s.trim());
        const angle = Number.parseFloat(match[1].replace("deg", "")) || 135;
        const rad = (angle - 90) * (Math.PI / 180);
        const cx = W / 2;
        const cy = H / 2;
        const len = Math.sqrt(W * W + H * H);
        const x0 = cx - (Math.cos(rad) * len) / 2;
        const y0 = cy - (Math.sin(rad) * len) / 2;
        const x1 = cx + (Math.cos(rad) * len) / 2;
        const y1 = cy + (Math.sin(rad) * len) / 2;
        const grad = ctx.createLinearGradient(x0, y0, x1, y1);
        for (const [i, stop] of stops.entries()) {
          const pctMatch = stop.match(/([\d.]+)%/);
          const colorMatch = stop.match(/(#[a-fA-F0-9]{3,8}|rgba?\([^)]+\))/);
          if (colorMatch) {
            const pos = pctMatch
              ? Number.parseFloat(pctMatch[1]) / 100
              : i / (stops.length - 1);
            grad.addColorStop(pos, colorMatch[1]);
          }
        }
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "#ffffff";
      }
    } else {
      ctx.fillStyle = card.background || "#ffffff";
    }
    ctx.fillRect(0, 0, W, H);

    // Elements
    for (const el of card.elements) {
      if (el.type === "text") {
        const fw = el.bold ? "bold" : "normal";
        const fs = el.italic ? "italic" : "normal";
        ctx.font = `${fs} ${fw} ${el.fontSize * 1.4}px ${el.fontFamily}`;
        ctx.fillStyle = el.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 4;
        ctx.fillText(el.content, (el.x / 100) * W, (el.y / 100) * H);
        ctx.shadowBlur = 0;
      } else if (el.type === "shape") {
        const cx = (el.x / 100) * W;
        const cy = (el.y / 100) * H;
        const sw = (el.width / 100) * W;
        const sh = (el.height / 100) * H;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.fillStyle = el.fillColor;
        const def = SHAPE_DEFS.find((s) => s.id === el.shapeType);
        if (def?.primitive === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, sw / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (
          def?.primitive === "rect" ||
          def?.primitive === "rect-wide"
        ) {
          ctx.fillRect(-sw / 2, -sh / 2, sw, sh);
        } else if (def?.path) {
          // Scale SVG path from 100x100 viewBox to actual size
          ctx.scale(sw / 100, sh / 100);
          ctx.translate(-50, -50);
          const p = new Path2D(def.path);
          ctx.fill(p);
        }
        ctx.restore();
      }
    }

    const link = document.createElement("a");
    link.download = "cardcraft-card.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Card downloaded!");
  }, [card]);

  // ── Gallery View ──────────────────────────────────────────────────────────────
  if (view === "gallery") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.22 285), oklch(0.55 0.22 300))",
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
                CardCraft
              </span>
              <span className="text-muted-foreground text-sm hidden sm:block font-medium">
                — Card Studio
              </span>
            </div>
            <Button
              data-ocid="gallery.open_modal_button"
              variant="outline"
              size="sm"
              onClick={() => openEditor(TEMPLATES[TEMPLATES.length - 1])}
              className="gap-2 border-border text-foreground hover:bg-secondary hover:text-foreground"
            >
              <Plus className="w-4 h-4" /> Blank Card
            </Button>
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
          {/* Hero */}
          <section className="relative text-center mb-16 py-16 rounded-2xl overflow-hidden hero-gradient animate-fade-in">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-sm px-3 py-1 text-xs font-semibold tracking-widest uppercase text-primary mb-6">
                <Sparkles className="w-3 h-3" /> Card Studio
              </div>
              <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-5 leading-[1.1] tracking-tight">
                Design Cards
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.72 0.22 285), oklch(0.78 0.18 200))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Worth Sending
                </span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto leading-relaxed">
                Pick a template, personalize with your own text & shapes, and
                download your card in seconds.
              </p>
            </div>
          </section>

          {/* Search + Category Filter */}
          <div className="mb-10 space-y-4">
            <div className="relative max-w-md mx-auto">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
                  searchQuery ? "text-violet-500" : "text-muted-foreground"
                }`}
              />
              <input
                data-ocid="gallery.search_input"
                type="text"
                placeholder="Search templates or festivals…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all ${
                  searchQuery
                    ? "text-violet-500 font-medium"
                    : "text-foreground"
                }`}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  data-ocid="gallery.tab"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-sm text-sm font-medium tracking-wide transition-all border ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Template Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            data-ocid="gallery.list"
          >
            {filteredTemplates.length === 0 ? (
              <div
                className="col-span-full text-center py-20"
                data-ocid="gallery.empty_state"
              >
                <p className="text-muted-foreground text-lg">
                  No templates found for "{searchQuery}"
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Try searching for Birthday, Diwali, Wedding…
                </p>
              </div>
            ) : (
              filteredTemplates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onClick={() => openEditor(t)}
                />
              ))
            )}
          </div>
        </main>

        <footer className="border-t border-border mt-16 py-6 text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
        <Toaster />
      </div>
    );
  }

  // ── Editor View ───────────────────────────────────────────────────────────────
  if (!card) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border">
        <div className="px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              data-ocid="editor.back_button"
              variant="ghost"
              size="sm"
              onClick={() => setView("gallery")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Templates
            </Button>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.62 0.22 285), oklch(0.55 0.22 300))",
                }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading text-lg font-bold text-foreground hidden sm:block">
                CardCraft
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedId && (
              <Button
                data-ocid="editor.delete_button"
                variant="ghost"
                size="sm"
                onClick={deleteSelected}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}
            <Button
              data-ocid="editor.download_button"
              size="sm"
              onClick={downloadCard}
              className="gap-2 font-semibold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.62 0.22 285), oklch(0.55 0.22 300))",
                color: "white",
                border: "none",
              }}
            >
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-border bg-sidebar flex flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-1 min-h-0"
          >
            <TabsList className="grid grid-cols-3 m-3 mb-0 bg-background/50">
              <TabsTrigger
                value="text"
                data-ocid="editor.text.tab"
                className="gap-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Type className="w-3.5 h-3.5" /> Text
              </TabsTrigger>
              <TabsTrigger
                value="background"
                data-ocid="editor.background.tab"
                className="gap-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Palette className="w-3.5 h-3.5" /> BG
              </TabsTrigger>
              <TabsTrigger
                value="graphics"
                data-ocid="editor.graphics.tab"
                className="gap-1 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Image className="w-3.5 h-3.5" /> Graphics
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1">
              {/* ─ Text Tab ─ */}
              <TabsContent value="text" className="mt-0 p-4 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Add Text
                  </Label>
                  <textarea
                    data-ocid="editor.textarea"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="input-glow w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground resize-none placeholder:text-muted-foreground transition-all"
                    rows={2}
                    placeholder="Enter your message…"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Font Size
                  </Label>
                  <div className="flex items-center gap-3">
                    <Slider
                      data-ocid="editor.font_size.toggle"
                      value={[textFontSize]}
                      onValueChange={([v]) => setTextFontSize(v)}
                      min={12}
                      max={60}
                      step={2}
                      className="flex-1"
                    />
                    <span className="text-sm w-8 text-right font-mono text-muted-foreground">
                      {textFontSize}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Font Style
                  </Label>
                  <select
                    data-ocid="editor.font.select"
                    value={textFontFamily}
                    onChange={(e) => setTextFontFamily(e.target.value)}
                    className="input-glow w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground focus:outline-none transition-all"
                  >
                    {TEXT_FONTS.map((f, i) => (
                      <option key={f} value={f} className="bg-card">
                        {FONT_LABELS[i]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-violet-500">
                    Color
                  </Label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {TEXT_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setTextColor(c)}
                        style={{ background: c }}
                        className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                          textColor === c
                            ? "border-primary scale-110 ring-2 ring-primary/30"
                            : "border-border"
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                  <Input
                    data-ocid="editor.color.input"
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-9 w-full cursor-pointer bg-background/60 border-border"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    data-ocid="editor.bold.toggle"
                    variant={textBold ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextBold((v) => !v)}
                    className={`flex-1 font-bold ${
                      textBold
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    B
                  </Button>
                  <Button
                    data-ocid="editor.italic.toggle"
                    variant={textItalic ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTextItalic((v) => !v)}
                    className={`flex-1 italic ${
                      textItalic
                        ? "bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    <em>I</em>
                  </Button>
                </div>

                <Button
                  data-ocid="editor.add_text.primary_button"
                  onClick={addText}
                  className="w-full gap-2 font-semibold"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.62 0.22 285), oklch(0.55 0.22 300))",
                    color: "white",
                    border: "none",
                  }}
                >
                  <Plus className="w-4 h-4" /> Add Text
                </Button>

                {selectedTextEl && (
                  <div className="mt-2 pt-4 border-t border-border space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Edit Selected
                    </Label>
                    <textarea
                      data-ocid="editor.edit_text.textarea"
                      value={selectedTextEl.content}
                      onChange={(e) =>
                        updateElement(selectedTextEl.id, {
                          content: e.target.value,
                        })
                      }
                      className="input-glow w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground resize-none transition-all"
                      rows={2}
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground font-medium">
                        Size
                      </span>
                      <Slider
                        value={[selectedTextEl.fontSize]}
                        onValueChange={([v]) =>
                          updateElement(selectedTextEl.id, { fontSize: v })
                        }
                        min={10}
                        max={72}
                        step={2}
                        className="flex-1"
                      />
                    </div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {TEXT_COLORS.map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() =>
                            updateElement(selectedTextEl.id, { color: c })
                          }
                          style={{ background: c }}
                          className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                            selectedTextEl.color === c
                              ? "border-primary scale-110"
                              : "border-border"
                          }`}
                          title={c}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={selectedTextEl.bold ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateElement(selectedTextEl.id, {
                            bold: !selectedTextEl.bold,
                          })
                        }
                        className={`flex-1 font-bold ${
                          selectedTextEl.bold
                            ? "bg-primary text-primary-foreground"
                            : "border-border text-foreground"
                        }`}
                      >
                        B
                      </Button>
                      <Button
                        variant={selectedTextEl.italic ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateElement(selectedTextEl.id, {
                            italic: !selectedTextEl.italic,
                          })
                        }
                        className={`flex-1 italic ${
                          selectedTextEl.italic
                            ? "bg-primary text-primary-foreground"
                            : "border-border text-foreground"
                        }`}
                      >
                        <em>I</em>
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="background" className="mt-0 p-4 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Solid Colors
                  </Label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {BACKGROUND_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() =>
                          setCard((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  background: c,
                                  backgroundType: "solid",
                                }
                              : prev,
                          )
                        }
                        style={{ background: c }}
                        className={`w-9 h-9 rounded-lg border-2 transition-transform hover:scale-110 ${
                          card.background === c
                            ? "border-primary scale-110 ring-2 ring-primary/30"
                            : "border-border"
                        }`}
                        title={c}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      data-ocid="editor.bg_color.input"
                      type="color"
                      value={
                        card.backgroundType === "solid"
                          ? card.background
                          : "#ffffff"
                      }
                      onChange={(e) =>
                        setCard((prev) =>
                          prev
                            ? {
                                ...prev,
                                background: e.target.value,
                                backgroundType: "solid",
                              }
                            : prev,
                        )
                      }
                      className="h-9 flex-1 cursor-pointer bg-background/60 border-border"
                    />
                    <span className="text-xs text-muted-foreground">
                      Custom
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Gradients
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {BACKGROUND_GRADIENTS.map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() =>
                          setCard((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  background: g.value,
                                  backgroundType: "gradient",
                                }
                              : prev,
                          )
                        }
                        style={{ background: g.value }}
                        className={`h-12 rounded-lg border-2 transition-transform hover:scale-105 ${
                          card.background === g.value
                            ? "border-primary scale-105 ring-2 ring-primary/30"
                            : "border-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Patterns
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCard((prev) =>
                          prev ? { ...prev, patternStyle: undefined } : prev,
                        )
                      }
                      className={`h-12 rounded-lg border-2 text-xs font-medium transition-transform hover:scale-105 flex items-center justify-center ${
                        !card.patternStyle
                          ? "border-primary scale-105 ring-2 ring-primary/30 bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      None
                    </button>
                    {CARD_PATTERNS.map((p) => {
                      const pc = card.patternColor || "rgba(0,0,0,0.18)";
                      const previewStyle = {
                        backgroundImage: p.css(pc),
                        backgroundSize: PATTERN_BG_SIZES[p.id],
                        backgroundPosition: PATTERN_BG_POSITIONS[p.id],
                        backgroundColor: "#e0e0e0",
                      };
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() =>
                            setCard((prev) =>
                              prev ? { ...prev, patternStyle: p.id } : prev,
                            )
                          }
                          style={previewStyle}
                          className={`h-12 rounded-lg border-2 transition-transform hover:scale-105 flex flex-col items-center justify-center gap-0.5 ${
                            card.patternStyle === p.id
                              ? "border-primary scale-105 ring-2 ring-primary/30"
                              : "border-border"
                          }`}
                          title={p.label}
                        >
                          <span className="text-xs font-bold drop-shadow bg-black/20 px-1 rounded text-white">
                            {p.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {card.patternStyle && (
                    <div className="flex gap-2 items-center mt-2">
                      <Label className="text-xs text-muted-foreground whitespace-nowrap">
                        Pattern Color
                      </Label>
                      <Input
                        data-ocid="editor.pattern_color.input"
                        type="color"
                        value={
                          card.patternColor?.startsWith("#")
                            ? card.patternColor
                            : "#000000"
                        }
                        onChange={(e) => {
                          const hex = e.target.value;
                          setCard((prev) =>
                            prev ? { ...prev, patternColor: hex } : prev,
                          );
                        }}
                        className="h-9 flex-1 cursor-pointer bg-background/60 border-border"
                      />
                      <Input
                        data-ocid="editor.pattern_opacity.input"
                        type="range"
                        min={10}
                        max={100}
                        defaultValue={30}
                        onChange={(e) => {
                          const pct = Number(e.target.value);
                          const hex = card.patternColor?.startsWith("#")
                            ? card.patternColor
                            : "#000000";
                          const r = Number.parseInt(hex.slice(1, 3), 16);
                          const g = Number.parseInt(hex.slice(3, 5), 16);
                          const b = Number.parseInt(hex.slice(5, 7), 16);
                          const rgba = `rgba(${r},${g},${b},${(pct / 100).toFixed(2)})`;
                          setCard((prev) =>
                            prev ? { ...prev, patternColor: rgba } : prev,
                          );
                        }}
                        className="h-9 flex-1 cursor-pointer"
                      />
                      <span className="text-xs text-muted-foreground">
                        Opacity
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ─ Graphics Tab ─ */}
              <TabsContent value="graphics" className="mt-0 p-4 space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Graphics
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Click to add to card
                  </p>
                </div>
                {/* Category filters */}
                <div className="flex gap-1.5 flex-wrap">
                  {GRAPHICS_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      data-ocid="editor.graphics.tab"
                      onClick={() => setGraphicsCategory(cat)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        graphicsCategory === cat
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* SVG Graphics grid */}
                <div className="grid grid-cols-4 gap-2">
                  {GRAPHICS.filter((g) => g.category === graphicsCategory).map(
                    (g, i) => (
                      <button
                        key={g.id}
                        type="button"
                        data-ocid={`editor.graphics.item.${i + 1}`}
                        title={g.label}
                        onClick={() => {
                          if (!card) return;
                          const newEl: ShapeElement = {
                            id: crypto.randomUUID(),
                            type: "shape",
                            shapeType: `graphic:${g.id}:${g.svgPath}`,
                            x: 50,
                            y: 50,
                            width: 15,
                            height: 15,
                            fillColor: g.color,
                            rotation: 0,
                          };
                          setCard((prev) =>
                            prev
                              ? { ...prev, elements: [...prev.elements, newEl] }
                              : prev,
                          );
                          setSelectedId(newEl.id);
                          toast.success("Graphic added!");
                        }}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card hover:bg-primary/10 hover:border-primary/50 hover:scale-110 transition-all p-2 aspect-square"
                      >
                        <svg
                          role="img"
                          aria-label={g.label}
                          viewBox="0 0 100 100"
                          width="28"
                          height="28"
                          style={{ overflow: "visible" }}
                        >
                          <path
                            d={g.svgPath}
                            fill={g.color}
                            stroke={g.color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-[8px] text-muted-foreground font-medium leading-none truncate w-full text-center">
                          {g.label}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 canvas-grid flex items-center justify-center p-8 overflow-auto">
          <div
            className="relative"
            style={{
              width: 560,
              height: 392,
              boxShadow:
                "0 0 0 1px oklch(0.28 0.02 260), 0 25px 60px rgba(0,0,0,0.6), 0 0 40px oklch(0.62 0.22 285 / 0.08)",
              borderRadius: 12,
              overflow: "hidden",
              background: card.background,
              flexShrink: 0,
            }}
            onClick={() => setSelectedId(null)}
            onKeyDown={(e) => e.key === "Escape" && setSelectedId(null)}
            role="presentation"
          >
            {card.patternStyle &&
              (() => {
                const p = CARD_PATTERNS.find((x) => x.id === card.patternStyle);
                const pc = card.patternColor || "rgba(0,0,0,0.18)";
                if (!p) return null;
                return (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: p.css(pc),
                      backgroundSize: PATTERN_BG_SIZES[card.patternStyle!],
                      backgroundPosition:
                        PATTERN_BG_POSITIONS[card.patternStyle!],
                    }}
                  />
                );
              })()}
            <CategoryDecor category={card.category} />
            {card.overlayImage && (
              <img
                src={card.overlayImage}
                alt=""
                className="absolute bottom-0 right-0 w-1/2 object-contain pointer-events-none"
                style={{ zIndex: 5 }}
              />
            )}
            {card.elements.map((el) => (
              <CardPreviewElement
                key={el.id}
                el={el}
                selected={el.id === selectedId}
                onSelect={setSelectedId}
                onDrag={handleDrag}
              />
            ))}
            {card.elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white/40 text-sm font-medium pointer-events-none">
                  Add text or shapes from the sidebar
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}

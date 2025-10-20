"use client";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  HomeIcon,
  ImagePlus,
  Key,
  LayoutDashboard,
  User,
} from "lucide-react";
import React, { useState } from "react";

const suggestions = [
  {
    label: "Dashboard",
    prompt:
      "Create a analytics dashboard to track customers and revenue data for a Saas",
    icon: LayoutDashboard,
  },
  {
    label: "SignUp Form",
    prompt:
      "Create a modern sign up form with email/password fields, Google and Github login options, and terms checkbox",
    icon: Key,
  },
  {
    label: "Hero",
    prompt:
      "Create a modern header and centered hero section for productivity SaaS. Include a badge for feature accouncement, a title with a subtle gradient effect, subtitle, CTA, small social proof and an image",
    icon: HomeIcon,
  },
  {
    label: "User Profile Card",
    prompt:
      "Create a modern user profile card component for a social media website",
    icon: User,
  },
];

function Hero() {
  const [userInput, setUserInput] = useState<string>();
  return (
    <div className="flex flex-col items-center h-[80vh] justify-center">
      {/* Header & Description*/}
      <h2 className="font-bold text-6xl">What should we Design?</h2>
      <p className="mt-2 text-xl text-gray-500">
        Generate,Edit and Explore design with AI, Export code as well
      </p>

      {/* Input Box */}
      <div className="w-full max-w-2xl p-5 border mt-5 rounded-2xl">
        <textarea
          placeholder="Describe your page design"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          className="w-full h-24 focus:outline-none focus:ring-0 resize-none"
        />
        <div className="flex justify-between items-center">
          <Button variant={"ghost"}>
            {" "}
            <ImagePlus />{" "}
          </Button>
          <Button>
            {" "}
            <ArrowUp />{" "}
          </Button>
        </div>
      </div>

      {/* Suggestion List */}
      <div className="mt-4 flex gap-3">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant={"outline"}
            onClick={() => setUserInput(suggestion.prompt)}
          >
            <suggestion.icon />
            {suggestion.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Hero;

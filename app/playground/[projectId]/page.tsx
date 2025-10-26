"use client";
import React, { useEffect, useState } from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import ElementSettingsSection from "../_components/ElementSettingsSection";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

export type Frame = {
  projectId: string;
  frameId: string;
  designCode: string;
  chatMessages: Messages[];
};

export type Messages = {
  role: string;
  content: string;
};

const Prompt = `
userInput: {userInput}
Based on the user input, generate a complete HTML Tailwind CSS code using
Flowbite UI components. Use a modern design with blue as the primary color
theme. Do not add HTML head or title tag, just body make it fully responsive.
Requirements:
- All primary components must match the theme color.
- Add proper padding and margin for each element.
- Components should not be connected to one another;
each element should be independent.
- Design must be fully responsive for all screen sizes.
- Use placeholders for all images for light mode:
https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg 
and for dark mode use:
https://www.cibaky.com/wp-content/uploads/2015/12/placeholder-3.jpg
For image , add alt tag with image prompt for that image
- Do not include broken links.
- Libraray already install so do not installed or add in script
- Header menu options should be spread out and not connected.

use the following component where appropriate:
- fa fa icons
- **Flowbite** for UI components like buttons, modals, forms, tables, 
tabs, and alerts, cards, dialog, dropdown, etc
- Chart.js for charts & graphs
- Swiper.js for sliders/carousels
- tooltip & Popover library (Tippy.js)

Additional requirements:
- Ensure proper spacing, alignment, and hierarchy for all elements.
- Include interactive components like modals, dropdowns , and accordions
where suitable.
- Ensure charts are visually appealing and match the theme color.
- Do not add any extra text before or after the HTML code.
- Output a complete, ready-to-use HTML page.
Do not give any raw text before start and end pont the ai response.
`;

function PlayGround() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");
  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [generatedCode, setGeneratedCode] = useState<any>("");

  useEffect(() => {
    frameId && GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    const result = await axios.get(
      "/api/frames?frameId=" + frameId + "&projectId=" + projectId
    );
    console.log(result.data);
    setFrameDetail(result.data);
    if (result.data?.chatMessages?.length == 1) {
      const userMsg = result.data?.chatMessages[0].content;
      SendMessage(userMsg);
    }
  };

  const SendMessage = async (userInput: string) => {
    setLoading(true);

    //Add user message to chat
    setMessages((prev: any) => [...prev, { role: "user", content: userInput }]);

    const result = await fetch("/api/ai-model", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          { role: "user", content: Prompt?.replace("{userInput}", userInput) },
        ],
      }),
    });

    const reader = result.body?.getReader();
    const decoder = new TextDecoder();

    let aiResponse = "";
    let isCode = false;

    while (true) {
      //@ts-ignore
      const { done, value } = await reader?.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      aiResponse += chunk;

      //Check if AI Start sending Code
      if (!isCode && aiResponse.includes("```html")) {
        isCode = true;
        const index = aiResponse.indexOf("```html") + 7;
        const initialCodeChunk = aiResponse.slice(index);
        setGeneratedCode((prev: any) => prev + initialCodeChunk);
      } else if (isCode) {
        setGeneratedCode((prev: any) => prev + chunk);
      }
    }

    //After Streaming End
    if (!isCode) {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: aiResponse },
      ]);
    } else {
      setMessages((prev: any) => [
        ...prev,
        { role: "assistant", content: "Your code is ready!" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log(generatedCode);
    //console.log("Code end");
  }, [generatedCode]);

  return (
    <div>
      <PlaygroundHeader />

      <div className="flex">
        {/* ChatSection */}
        <ChatSection
          messages={messages ?? []}
          onSend={(input: string) => SendMessage(input)}
          loading={loading}
        />

        {/* WebDesign */}
        <WebsiteDesign />

        {/* Settings Section */}
        {/* <ElementSettingsSection /> */}
      </div>
    </div>
  );
}

export default PlayGround;

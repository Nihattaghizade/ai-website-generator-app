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

function PlayGround() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");
  const [frameDetail, setFrameDetail] = useState<Frame>();
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Messages[]>();
  const [generatedCode, setGeneratedCode] = useState<any>();

  useEffect(() => {
    frameId && GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    const result = await axios.get(
      "/api/frames?frameId=" + frameId + "&projectId=" + projectId
    );
    console.log(result.data);
    setFrameDetail(result.data);
  };

  const SendMessage = async (userInput: string) => {
    setLoading(true);

    //Add user message to chat
    setMessages((prev: any) => [...prev, { role: "user", content: userInput }]);

    const result = await fetch("/api/ai-model", {
      method: "POST",
      body: JSON.stringify({
        messages: [{ role: "user", content: userInput }],
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
        { role: "assistant", content: "Your code is ready" },
      ]);
    }
    setLoading(false);
  };

  return (
    <div>
      <PlaygroundHeader />

      <div className="flex">
        {/* ChatSection */}
        <ChatSection
          messages={messages ?? []}
          onSend={(input: string) => SendMessage(input)}
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

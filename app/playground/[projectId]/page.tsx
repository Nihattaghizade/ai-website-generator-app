"use client";
import React, { useEffect } from "react";
import PlaygroundHeader from "../_components/PlaygroundHeader";
import ChatSection from "../_components/ChatSection";
import WebsiteDesign from "../_components/WebsiteDesign";
import ElementSettingsSection from "../_components/ElementSettingsSection";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";

function PlayGround() {
  const { projectId } = useParams();
  const params = useSearchParams();
  const frameId = params.get("frameId");

  useEffect(() => {
    frameId && GetFrameDetails();
  }, [frameId]);

  const GetFrameDetails = async () => {
    const result = await axios.get(
      "/api/frames?frameId=" + frameId + "&projectId=" + projectId
    );
    console.log(result.data);
  };

  return (
    <div>
      <PlaygroundHeader />

      <div className="flex">
        {/* ChatSection */}
        <ChatSection />

        {/* WebDesign */}
        <WebsiteDesign />

        {/* Settings Section */}
        <ElementSettingsSection />
      </div>
    </div>
  );
}

export default PlayGround;

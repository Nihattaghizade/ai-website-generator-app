import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.5-flash-preview-09-2025",
        messages,
        stream: true,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "My Next.js App",
        },
        responseType: "stream",
      }
    );

    const stream = response.data;

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        stream.on("data", (chunk: any) => {
          const payloads = chunk.toString().split("\n\n");
          for (const payload of payloads) {
            if (payload.includes(["DONE"])) {
              controller.close();
              return;
            }
            if (payload.startsWith("data:")) {
              try {
                const data = JSON.parse(payload.replace("data:", ""));
                const text = data.choices[0]?.delta?.content;
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              } catch (err) {
                console.error("Error parsing stream", err);
              }
            }
          }
        });

        stream.on("end", () => {
          controller.close();
        });

        stream.on("error", (err: any) => {
          console.error("Stream error", err);
          controller.error(err);
        });
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// import axios from "axios";
// import { NextRequest, NextResponse } from "next/server";

// // Function to check OpenRouter credits
// async function checkCredits(apiKey: string) {
//   try {
//     const response = await axios.get("https://openrouter.ai/api/v1/credits", {
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//       },
//     });

//     const { data } = response.data;
//     const totalCredits = data.total_credits;
//     const totalUsage = data.total_usage;
//     const remainingCredits = totalCredits - totalUsage;

//     console.log("=== OpenRouter Credits Status ===");
//     console.log(`Total Credits: $${totalCredits.toFixed(2)}`);
//     console.log(`Total Usage: $${totalUsage.toFixed(2)}`);
//     console.log(`Remaining Credits: $${remainingCredits.toFixed(2)}`);
//     console.log("================================");

//     return {
//       totalCredits,
//       totalUsage,
//       remainingCredits,
//       hasCredits: remainingCredits > 0,
//     };
//   } catch (error) {
//     console.error("Failed to fetch credits:", error);
//     return null;
//   }
// }

// // Function to check rate limits for specific API key
// async function checkRateLimits(apiKey: string) {
//   try {
//     const response = await axios.get("https://openrouter.ai/api/v1/key", {
//       headers: {
//         Authorization: `Bearer ${apiKey}`,
//       },
//     });

//     const { data } = response.data;

//     console.log("=== OpenRouter Rate Limits ===");
//     console.log(`Key Label: ${data.label}`);
//     console.log(`Usage Limit: ${data.limit || "Unlimited"}`);
//     console.log(`Current Usage: $${data.usage}`);
//     console.log(`Remaining Limit: ${data.limit_remaining || "N/A"}`);
//     console.log(`Is Free Tier: ${data.is_free_tier}`);
//     console.log(
//       `Rate Limit: ${data.rate_limit.requests} requests per ${data.rate_limit.interval}`
//     );
//     console.log("==============================");

//     return data;
//   } catch (error) {
//     console.error("Failed to fetch rate limits:", error);
//     return null;
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { messages } = await req.json();
//     const apiKey = process.env.OPENROUTER_API_KEY!;

//     // Check credits and rate limits before making the request
//     console.log("\n🔍 Checking OpenRouter account status...\n");

//     const creditsInfo = await checkCredits(apiKey);
//     const rateLimitInfo = await checkRateLimits(apiKey);

//     // Warn if credits are low
//     if (creditsInfo && creditsInfo.remainingCredits < 1) {
//       console.warn(
//         "⚠️  WARNING: Low credits! Remaining: $" +
//           creditsInfo.remainingCredits.toFixed(2)
//       );
//       console.warn("⚠️  Add credits at: https://openrouter.ai/credits");
//     }

//     // Check if we have sufficient credits
//     if (creditsInfo && creditsInfo.remainingCredits <= 0) {
//       return NextResponse.json(
//         {
//           error:
//             "Insufficient credits. Please add credits to your OpenRouter account.",
//           remainingCredits: creditsInfo.remainingCredits,
//         },
//         { status: 402 }
//       );
//     }

//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: "google/gemini-2.0-flash-exp:free", // Using free model
//         messages,
//         stream: true,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${apiKey}`,
//           "Content-Type": "application/json",
//           "HTTP-Referer": "http://localhost:3000",
//           "X-Title": "My Next.js App",
//         },
//         responseType: "stream",
//       }
//     );

//     const stream = response.data;
//     const encoder = new TextEncoder();

//     const readable = new ReadableStream({
//       async start(controller) {
//         stream.on("data", (chunk: any) => {
//           const payloads = chunk.toString().split("\n\n");
//           for (const payload of payloads) {
//             if (payload.includes("[DONE]")) {
//               controller.close();
//               return;
//             }
//             if (payload.startsWith("data:")) {
//               try {
//                 const data = JSON.parse(payload.replace("data:", "").trim());
//                 const text = data.choices[0]?.delta?.content;
//                 if (text) {
//                   controller.enqueue(encoder.encode(text));
//                 }
//               } catch (err) {
//                 console.error("Error parsing stream", err);
//               }
//             }
//           }
//         });

//         stream.on("end", () => {
//           console.log("✅ Stream completed successfully");
//           controller.close();
//         });

//         stream.on("error", (err: any) => {
//           console.error("❌ Stream error", err);
//           controller.error(err);
//         });
//       },
//     });

//     return new NextResponse(readable, {
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Transfer-Encoding": "chunked",
//       },
//     });
//   } catch (error: any) {
//     console.error("❌ API error:", error);

//     // Handle 402 Payment Required error specifically
//     if (error.response?.status === 402) {
//       return NextResponse.json(
//         {
//           error:
//             "Payment Required: Insufficient credits or exceeded rate limits",
//           details: "Visit https://openrouter.ai/credits to add credits",
//           statusCode: 402,
//         },
//         { status: 402 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Something went wrong", details: error.message },
//       { status: 500 }
//     );
//   }
// }

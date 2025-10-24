import axios from "axios";

export async function Post(req) {
    const {messages}=await req.json();

    const response=await axios.post('https://openrouter,ai/api/v1/chat/completions',
        {
            model:'google/gemini-2.5-flash-preview-09-2025',
            messages,
            stream:true
        },
        {
            headers:{
                Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "My Next.js App",
            },
            responseType: 'stream'
        }
    )

    const stream = response.data

    const encoder=new TextEncoder()

    const readable=new ReadableStream({
        
    })
}
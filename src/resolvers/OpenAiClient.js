import {fetch} from "@forge/api";

// https://platform.openai.com/docs/api-reference/chat
export async function chat(messages) {
    const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${getOpenAPIKey()}`,
            'Content-Type': 'application/json',
        },
        redirect: 'follow',
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages
        })
    });

    if (response?.status === 200) {
        const chatCompletion = await response.json();
        const firstChoice = chatCompletion?.choices?.[0]
        const messageContent = firstChoice?.message?.content;
        if (messageContent) {
            return messageContent;
        } else {
            console.warn(`Chat completion response did not include any assistance choices.`);
            return null;
        }
    } else {
        const text = await response.text();
        console.warn(`OpenAI error response: ${text}`);
        return null;
    }
}

function getOpenAPIKey() {
    return process.env.OPEN_API_KEY;
}
import { GoogleGenAI, Type } from "@google/genai";
import { Platform, TagResults, PopularityCategory } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generatePrompt = (description: string, platforms: Platform[]): string => {
  return `Act as a highly skilled, social media trend analyst with expertise in viral content. Your task is to generate hashtags that will maximize views and engagement.

Analyze the following content description:
"${description}"

For each of the selected platforms (${platforms.join(', ')}), generate a list of 15 hashtags. These hashtags must be a strategic mix of broad, popular, and niche topics relevant to the content.

Crucially, for each tag, you must classify its popularity and reach into one of four distinct categories:
- "Viral": For tags with massive, cross-platform appeal, often in the hundreds of millions or billions of posts/views.
- "High": For broadly popular tags with very high traffic, typically in the tens of millions.
- "Medium": For established and popular tags that are more specific than "High" tier tags but still have significant reach (hundreds of thousands to low millions).
- "Niche": For highly targeted tags specific to a community or sub-topic, excellent for reaching a dedicated audience.

Return ONLY a valid JSON object. The keys must be the platform names (${platforms.map(p => `"${p}"`).join(', ')}). Each value must be an array of 15 objects, where each object has two keys: "tag" (the hashtag string without the '#' symbol) and "category" (one of "Viral", "High", "Medium", or "Niche").`;
};


const getResponseSchema = (platforms: Platform[]) => {
    const properties: { [key in Platform]?: object } = {};
    platforms.forEach(platform => {
        properties[platform] = {
            type: Type.ARRAY,
            description: `An array of 15 popular tags for ${platform}, each with a popularity category.`,
            items: {
                type: Type.OBJECT,
                properties: {
                    tag: {
                        type: Type.STRING,
                        description: "The hashtag text, without the '#' symbol."
                    },
                    category: {
                        type: Type.STRING,
                        description: "The popularity category: 'Viral', 'High', 'Medium', or 'Niche'."
                    }
                },
                required: ['tag', 'category']
            }
        };
    });

    return {
        type: Type.OBJECT,
        properties,
    };
};

export const generateTags = async (description: string, platforms: Platform[]): Promise<TagResults> => {
    if (!description || platforms.length === 0) {
        return {};
    }

    try {
        const prompt = generatePrompt(description, platforms);
        const schema = getResponseSchema(platforms);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.7,
            },
        });
        
        const text = response.text.trim();
        const parsedJson = JSON.parse(text);

        const result: TagResults = {};
        for (const platform of platforms) {
            if (parsedJson[platform] && Array.isArray(parsedJson[platform])) {
                result[platform] = parsedJson[platform];
            }
        }
        return result;

    } catch (error) {
        console.error("Error generating tags with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate tags: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating tags.");
    }
};
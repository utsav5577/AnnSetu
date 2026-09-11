import { GoogleGenAI } from '@google/genai';

export interface ExtractedPosterInfo {
  name?: string;
  venue?: string;
  address?: string;
  city?: string;
  locality?: string;
  eventDate?: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  organizerName?: string;
  foodType?: string;
  facilities?: string[];
  contactPhone?: string;
  rawNotes?: string;
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  try {
    aiClient = new GoogleGenAI({ apiKey });
    return aiClient;
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

export async function parseBhandaraPosterWithGemini(
  base64Image: string, 
  mimeType: string = 'image/jpeg'
): Promise<{ success: boolean; data?: ExtractedPosterInfo; error?: string }> {
  const client = getAiClient();
  if (!client) {
    return {
      success: false,
      error: 'GEMINI_API_KEY is not configured on the server. Please enter details manually.'
    };
  }

  try {
    // Strip data url prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');

    const prompt = `You are an expert AI assistant for AnnSetu, an Indian community Bhandara discovery platform.
Analyze this image (which is an invitation card, banner, poster, or pamflet for a community Bhandara / Langar / Annadanam / Mahaprasad in India).

Extract all recognizable event details into a clean JSON object with these exact keys:
{
  "name": "Title or main heading of the Bhandara event (e.g. Shri Krishna Janmashtami Maha Bhandara)",
  "venue": "Name of temple, dharmshala, or grounds",
  "address": "Full street address or landmark mentioned",
  "city": "City name if identifiable (e.g. Delhi NCR, Varanasi, Lucknow, Ayodhya, Haridwar, Mathura, Jaipur)",
  "locality": "Locality/neighborhood (e.g. Connaught Place, Godowlia, Rohini, Assi Ghat)",
  "eventDate": "Event date in YYYY-MM-DD format (infer year 2026 if not stated)",
  "startTime": "Start time in HH:mm 24-hour format (e.g. 12:00, 13:30)",
  "endTime": "End time in HH:mm 24-hour format (e.g. 16:00)",
  "organizerName": "Name of the organizing samiti, trust, mandal, or devotees",
  "foodType": "Type of prasad mentioned (e.g. Puri Sabzi & Halwa, Khichdi Prasad, Kadhi Chawal, Kheer Prasad, Complete Mahaprasad)",
  "contactPhone": "Phone number or mobile number if printed",
  "facilities": ["List of any facilities mentioned like Drinking Water, Sitting Arrangement, Senior Queue, Prasad Packing"],
  "rawNotes": "Any additional important instructions (e.g., please carry your own container, footwear parking, etc.)"
}

If any field cannot be determined from the image, leave it null or omit it. Return ONLY the raw JSON object with no markdown fences.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg'
              }
            },
            {
              text: prompt
            }
          ]
        }
      ]
    });

    const responseText = response.text || '';
    const cleanJsonText = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed: ExtractedPosterInfo = JSON.parse(cleanJsonText);
    return {
      success: true,
      data: parsed
    };
  } catch (err: any) {
    console.error('Error during Gemini poster OCR:', err);
    return {
      success: false,
      error: err?.message || 'Failed to extract text from poster.'
    };
  }
}

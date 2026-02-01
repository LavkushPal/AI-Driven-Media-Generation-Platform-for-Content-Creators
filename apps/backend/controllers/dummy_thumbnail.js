import fs from "fs";
import path from "path";

/**
 * Returns a fake Gemini image-generation response
 * structure identical to @google/genai output.
 */
export function getDummyGeminiImageResponse() {
  // load any local image as base64 (placeholder thumbnail)
  const dummyImagePath = path.join(process.cwd(), "/controllers/dummy.jpg");

  const base64Image = fs.readFileSync(dummyImagePath).toString("base64");

  return {
    candidates: [
      {
        content: {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpg",
                data: base64Image
              }
            }
          ]
        }
      }
    ]
  };
}

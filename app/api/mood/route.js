import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { mood } = body;

    if (!mood || !mood.trim()) {
      return NextResponse.json(
        { error: "Mood is required" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      // Smart mood-based fallback movie recommendations when key is not configured
      const lower = mood.toLowerCase();
      let fallbackMovie = "Inception";
      if (lower.includes("funny") || lower.includes("laugh") || lower.includes("comedy")) {
        fallbackMovie = "The Grand Budapest Hotel";
      } else if (lower.includes("romantic") || lower.includes("love")) {
        fallbackMovie = "La La Land";
      } else if (lower.includes("emotional") || lower.includes("sad") || lower.includes("cry")) {
        fallbackMovie = "Good Will Hunting";
      } else if (lower.includes("adventur") || lower.includes("action") || lower.includes("thrill")) {
        fallbackMovie = "Interstellar";
      } else if (lower.includes("scary") || lower.includes("horror") || lower.includes("spooky")) {
        fallbackMovie = "The Shining";
      } else if (lower.includes("relax") || lower.includes("chill") || lower.includes("peace")) {
        fallbackMovie = "Spirited Away";
      }

      return NextResponse.json({ movieTitle: fallbackMovie });
    }

    const prompt = `
You are a movie recommendation assistant.

The user will describe their mood.

Recommend exactly ONE real movie title.

Rules:
- Return only one movie title.
- No explanation.
- No rating.
- No year.
- No markdown.
- The movie must be real.

User mood:
${mood}
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Gemini API request failed" },
        { status: 500 }
      );
    }

    const movieTitle =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!movieTitle) {
      return NextResponse.json(
        { error: "Gemini did not return a movie title" },
        { status: 500 }
      );
    }

    return NextResponse.json({ movieTitle });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
}

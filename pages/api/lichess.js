export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fen } = req.body;

  if (!fen) {
    return res.status(400).json({ error: "FEN position required" });
  }

  try {
    // Try Lichess cloud evaluation API
    const response = await fetch(
      `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(
        fen
      )}&multiPv=1`,
      {
        timeout: 5000,
      }
    );

    if (response.ok) {
      const data = await response.json();

      if (data.pvs && data.pvs.length > 0 && data.pvs[0].moves) {
        const bestMove = data.pvs[0].moves.split(" ")[0];
        return res.status(200).json({
          success: true,
          move: bestMove,
          source: "lichess",
          evaluation: data.pvs[0].cp || 0,
        });
      }
    }
  } catch (error) {
    console.warn("Lichess API failed:", error.message);
  }

  // Fallback - no move suggestion
  return res.status(200).json({
    success: false,
    source: "fallback",
    message: "API unavailable, using local strategy",
  });
}

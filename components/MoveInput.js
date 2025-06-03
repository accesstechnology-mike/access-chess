import { useState, useRef, useEffect } from "react";

export default function MoveInput({
  onMoveSubmit,
  onShowMoves,
  onShowHelp,
  onReadBoard,
  isPlayerTurn,
  disabled = false,
}) {
  const [move, setMove] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const inputRef = useRef(null);

  // Focus input when it's player's turn
  useEffect(() => {
    if (isPlayerTurn && !disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPlayerTurn, disabled]);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ message: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!move.trim()) {
      showFeedback("Please enter a move.", "error");
      return;
    }

    if (disabled || !isPlayerTurn) {
      showFeedback("Please wait for your turn.", "error");
      return;
    }

    // Handle special commands
    const command = move.toLowerCase().trim();

    if (command === "help") {
      setMove("");
      onShowHelp();
      return;
    }

    if (command === "moves") {
      setMove("");
      onShowMoves();
      return;
    }

    if (command === "board") {
      setMove("");
      onReadBoard();
      return;
    }

    // Submit the move
    onMoveSubmit(move);
    setMove("");
  };

  const handleKeyDown = (e) => {
    // Handle special keyboard shortcuts
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "m":
          e.preventDefault();
          inputRef.current?.focus();
          break;
        case "l":
          e.preventDefault();
          onShowMoves();
          break;
        case "h":
          e.preventDefault();
          onShowHelp();
          break;
        case "r":
          e.preventDefault();
          onReadBoard();
          break;
      }
    }
  };

  const showFeedback = (message, type = "info") => {
    setFeedback({ message, type });
  };

  // Update feedback from parent component
  useEffect(() => {
    const handleFeedback = (event) => {
      if (event.detail) {
        showFeedback(event.detail.message, event.detail.type);
      }
    };

    window.addEventListener("chess-feedback", handleFeedback);
    return () => window.removeEventListener("chess-feedback", handleFeedback);
  }, []);

  return (
    <section
      className="move-input-section"
      role="region"
      aria-labelledby="move-heading"
    >
      <h2 id="move-heading">Make Your Move</h2>

      <form onSubmit={handleSubmit} className="move-form">
        <label htmlFor="move-input" className="move-label">
          Enter your move (e.g., e4, Nf3, O-O):
        </label>

        <div className="input-row">
          <input
            ref={inputRef}
            type="text"
            id="move-input"
            value={move}
            onChange={(e) => setMove(e.target.value)}
            onKeyDown={handleKeyDown}
            className="move-input"
            placeholder="Type your move here..."
            aria-describedby="move-help move-feedback"
            autoComplete="off"
            spellCheck="false"
            disabled={disabled || !isPlayerTurn}
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={disabled || !isPlayerTurn || !move.trim()}
          >
            Make Move
          </button>
        </div>

        <div id="move-help" className="help-text">
          Examples: e4, Nf3, O-O, Qxd5. Special commands: help, moves, board.
          Keyboard shortcuts: Alt+M (focus), Alt+L (moves), Alt+H (help), Alt+R
          (board).
        </div>
      </form>

      {feedback.message && (
        <div
          id="move-feedback"
          className={`feedback ${feedback.type}`}
          role="status"
          aria-live="polite"
          tabIndex={0}
        >
          {feedback.message}
        </div>
      )}

      {!isPlayerTurn && !disabled && (
        <div className="turn-notice" role="status" aria-live="polite">
          Computer is thinking...
        </div>
      )}
    </section>
  );
}

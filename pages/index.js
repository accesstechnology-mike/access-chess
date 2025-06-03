import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import ChessBoard from "../components/ChessBoard";
import MoveInput from "../components/MoveInput";
import { ChessGameEngine } from "../lib/chess-engine";

export default function Home() {
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showMoves, setShowMoves] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [boardDescription, setBoardDescription] = useState("");

  // Initialize game
  useEffect(() => {
    const newGame = new ChessGameEngine();
    setGame(newGame);
    updateGameState(newGame);
  }, []);

  const updateGameState = (gameInstance) => {
    const status = gameInstance.getGameStatus();
    setGameState({
      board: gameInstance.getBoardState(),
      status,
      moveHistory: gameInstance.moveHistory,
      lastMove: gameInstance.lastMove,
    });
    setIsPlayerTurn(status.turn === "white" && !status.gameOver);
  };

  const showFeedback = useCallback((message, type = "info") => {
    window.dispatchEvent(
      new CustomEvent("chess-feedback", {
        detail: { message, type },
      })
    );
  }, []);

  const handleMoveSubmit = async (moveInput) => {
    if (!game || loading || !isPlayerTurn) return;

    setLoading(true);

    try {
      // Make player move
      const result = game.makeMove(moveInput);

      if (result.success) {
        showFeedback(`You played: ${result.move}`, "success");
        updateGameState(game);

        // Check if game is over
        const status = game.getGameStatus();
        if (status.gameOver) {
          if (status.isCheckmate) {
            showFeedback(
              `Checkmate! ${status.turn === "white" ? "Black" : "White"} wins!`,
              "success"
            );
          } else if (status.isStalemate) {
            showFeedback("Stalemate - Draw!", "success");
          } else if (status.isDraw) {
            showFeedback("Draw!", "success");
          }
          setLoading(false);
          return;
        }

        // Make computer move after a brief delay
        setTimeout(async () => {
          await makeComputerMove();
        }, 800);
      } else {
        showFeedback(`Invalid move: ${result.error}`, "error");
        setLoading(false);
      }
    } catch (error) {
      showFeedback("Error making move. Please try again.", "error");
      setLoading(false);
    }
  };

  const makeComputerMove = async () => {
    if (!game) return;

    try {
      // Try to get move from Lichess API
      const fen = game.getGameStatus().fen;
      const apiResponse = await fetch("/api/lichess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen }),
      });

      let computerMove = null;

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData.success && apiData.move) {
          // Convert UCI move to chess.js format and make move
          const result = game.makeMove(apiData.move);
          if (result.success) {
            computerMove = result.move;
          }
        }
      }

      // Fallback to local strategy if API failed or move was invalid
      if (!computerMove) {
        const result = game.makeComputerMove();
        if (result.success) {
          computerMove = result.move;
        }
      }

      if (computerMove) {
        showFeedback(`Computer played: ${computerMove}`, "success");
        updateGameState(game);

        // Check if game is over after computer move
        const status = game.getGameStatus();
        if (status.gameOver) {
          if (status.isCheckmate) {
            showFeedback(
              `Checkmate! ${status.turn === "white" ? "Black" : "White"} wins!`,
              "success"
            );
          } else if (status.isStalemate) {
            showFeedback("Stalemate - Draw!", "success");
          } else if (status.isDraw) {
            showFeedback("Draw!", "success");
          }
        }
      } else {
        showFeedback("Computer cannot move!", "error");
      }
    } catch (error) {
      console.error("Computer move error:", error);
      showFeedback("Computer move failed. Please continue.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    if (confirm("Start a new game? This will reset the current game.")) {
      const newGame = new ChessGameEngine();
      setGame(newGame);
      updateGameState(newGame);
      setShowMoves(false);
      setShowHelp(false);
      showFeedback("New game started. You are White.", "success");
    }
  };

  const handleShowMoves = () => {
    setShowMoves(!showMoves);
    setShowHelp(false);
  };

  const handleShowHelp = () => {
    setShowHelp(!showHelp);
    setShowMoves(false);
  };

  const handleReadBoard = () => {
    // Focus on the board description
    setTimeout(() => {
      const boardElement = document.querySelector(".board-description");
      if (boardElement) {
        boardElement.focus();
      }
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "n":
          e.preventDefault();
          handleNewGame();
          break;
        case "escape":
          setShowMoves(false);
          setShowHelp(false);
          break;
      }
    }

    if (e.key === "Escape") {
      setShowMoves(false);
      setShowHelp(false);
    }
  };

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!gameState) {
    return (
      <div className="loading-container">
        <div role="status" aria-live="polite">
          Loading chess game...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Accessible Chess Game - Keyboard Only</title>
        <meta
          name="description"
          content="Fully accessible chess game for keyboard-only users. Play against computer using text input."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container">
        <header>
          <h1 tabIndex={0}>♟️ Accessible Chess Game</h1>
          <p className="subtitle" tabIndex={0}>
            Keyboard-Only Player vs Computer
          </p>
        </header>

        <main>
          {/* Game Status */}
          <section
            className="game-status"
            role="region"
            aria-labelledby="status-heading"
          >
            <h2 id="status-heading" className="sr-only">
              Game Status
            </h2>
            <div className="status-grid">
              <div
                className="status-item"
                tabIndex={0}
                role="status"
                aria-live="polite"
              >
                Current turn:{" "}
                {gameState.status.turn === "white"
                  ? "White (You)"
                  : "Black (Computer)"}
              </div>
              {gameState.status.inCheck && (
                <div className="status-item check" tabIndex={0} role="alert">
                  CHECK!
                </div>
              )}
              {gameState.status.gameOver && (
                <div
                  className="status-item game-over"
                  tabIndex={0}
                  role="alert"
                >
                  {gameState.status.isCheckmate &&
                    `Checkmate! ${
                      gameState.status.turn === "white" ? "Black" : "White"
                    } wins!`}
                  {gameState.status.isStalemate && "Stalemate - Draw!"}
                  {gameState.status.isDraw &&
                    !gameState.status.isStalemate &&
                    "Draw!"}
                </div>
              )}
            </div>
          </section>

          <div className="game-layout">
            <div className="game-left">
              {/* Move Input */}
              <MoveInput
                onMoveSubmit={handleMoveSubmit}
                onShowMoves={handleShowMoves}
                onShowHelp={handleShowHelp}
                onReadBoard={handleReadBoard}
                isPlayerTurn={isPlayerTurn}
                disabled={loading}
              />

              {/* Game Controls */}
              <section
                className="game-controls"
                role="region"
                aria-labelledby="controls-heading"
              >
                <h2 id="controls-heading">Game Controls</h2>
                <div className="controls-grid">
                  <button
                    onClick={handleShowMoves}
                    className="btn btn-secondary"
                    aria-pressed={showMoves}
                  >
                    {showMoves ? "Hide" : "Show"} Legal Moves
                  </button>
                  <button
                    onClick={handleShowHelp}
                    className="btn btn-secondary"
                    aria-pressed={showHelp}
                  >
                    {showHelp ? "Hide" : "Show"} Help
                  </button>
                  <button onClick={handleNewGame} className="btn btn-secondary">
                    New Game
                  </button>
                  <button
                    onClick={handleReadBoard}
                    className="btn btn-secondary"
                  >
                    Read Board
                  </button>
                </div>
              </section>

              {/* Legal Moves */}
              {showMoves && (
                <section
                  className="info-section"
                  role="region"
                  aria-labelledby="moves-heading"
                >
                  <h3 id="moves-heading">Legal Moves</h3>
                  <div className="moves-list" tabIndex={0}>
                    {game?.getLegalMoves().length > 0 ? (
                      <>
                        <p>
                          Legal moves ({game.getLegalMoves().length} total):
                        </p>
                        <div className="moves-grid">
                          {game.getLegalMoves().map((move, index) => (
                            <span key={index} className="move-item">
                              {move}
                            </span>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p>No legal moves available.</p>
                    )}
                  </div>
                </section>
              )}

              {/* Help Section */}
              {showHelp && (
                <section
                  className="info-section"
                  role="region"
                  aria-labelledby="help-heading"
                >
                  <h3 id="help-heading">Move Format Help</h3>
                  <div className="help-content" tabIndex={0}>
                    <h4>Move Formats:</h4>
                    <ul>
                      <li>Standard notation: e4, Nf3, O-O, Qxd5</li>
                      <li>UCI notation: e2e4, g1f3, e1g1 (castling)</li>
                      <li>Long notation: e2-e4, Ng1-f3</li>
                    </ul>

                    <h4>Examples:</h4>
                    <ul>
                      <li>e4 - Move pawn to e4</li>
                      <li>Nf3 - Move knight to f3</li>
                      <li>O-O - Castle kingside</li>
                      <li>Qxd5 - Queen captures on d5</li>
                      <li>e8=Q - Pawn promotion to queen</li>
                    </ul>

                    <h4>Keyboard Shortcuts:</h4>
                    <ul>
                      <li>Alt+M - Focus move input</li>
                      <li>Alt+L - Show/hide legal moves</li>
                      <li>Alt+H - Show/hide help</li>
                      <li>Alt+R - Read board position</li>
                      <li>Alt+N - Start new game</li>
                      <li>Escape - Close info panels</li>
                    </ul>
                  </div>
                </section>
              )}
            </div>

            <div className="game-right">
              {/* Chess Board */}
              <section
                className="board-section"
                role="region"
                aria-labelledby="board-heading"
              >
                <h2 id="board-heading">Chess Board</h2>
                <ChessBoard
                  board={gameState.board}
                  gameStatus={gameState.status}
                  onBoardDescriptionUpdate={setBoardDescription}
                />

                {/* Board Description for Screen Readers */}
                <div
                  className="board-description"
                  tabIndex={0}
                  aria-live="polite"
                  role="region"
                  aria-label="Board position description"
                >
                  {boardDescription}
                </div>
              </section>

              {/* Move History */}
              <section
                className="move-history-section"
                role="region"
                aria-labelledby="history-heading"
              >
                <h3 id="history-heading">Move History</h3>
                <div className="move-history" tabIndex={0}>
                  {game?.getMoveHistoryText() || "Game started. White to move."}
                </div>
              </section>
            </div>
          </div>
        </main>

        <footer>
          <p tabIndex={0}>
            Fully accessible chess game. Navigate with Tab, make moves by
            typing.
            <br />
            <small>
              Keyboard shortcuts: Alt+M (focus), Alt+L (moves), Alt+H (help),
              Alt+R (board), Alt+N (new game)
            </small>
          </p>
        </footer>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-content">
            <div className="loading-spinner" aria-hidden="true"></div>
            <p>Computer is thinking...</p>
          </div>
        </div>
      )}
    </>
  );
}

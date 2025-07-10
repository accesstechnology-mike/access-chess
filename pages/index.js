import { useState, useEffect } from "react";
import Head from "next/head";
import ChessBoard from "../components/ChessBoard";
import { ChessGameEngine } from "../lib/chess-engine";

export default function Home() {
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [difficulty, setDifficulty] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Initialize game with difficulty
  const startGame = (selectedDifficulty) => {
    const newGame = new ChessGameEngine();
    newGame.setDifficulty(selectedDifficulty);
    setGame(newGame);
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    updateGameState(newGame);
  };

  const updateGameState = (gameInstance) => {
    const status = gameInstance.getGameStatus();
    setGameState({
      board: gameInstance.getBoardState(),
      status,
      legalMoves: gameInstance.getLegalMoves(),
    });
    setIsPlayerTurn(status.turn === "white" && !status.gameOver);
  };

  const getSimplifiedNotation = (move) => {
    // Handle castling
    if (move === "O-O" || move === "O-O-O") {
      return { pieceType: "K", notation: move };
    }

    // Clean away check, checkmate, and promotion details for simplicity
    const cleanMove = move.replace(/[+#=].*/, "");

    // Handle pawn moves (e.g., "e4", "dxe5")
    if (cleanMove[0] === cleanMove[0].toLowerCase()) {
      return { pieceType: "P", notation: cleanMove.slice(-2) };
    }

    // Handle piece moves (e.g., "Nf3", "Bxf3", "Rad1")
    const pieceType = cleanMove[0];
    const notation = cleanMove.substring(1).replace("x", "");
    return { pieceType, notation };
  };

  const getPieceImageSrc = (pieceType) => {
    const pieceMap = {
      K: "wK",
      Q: "wQ",
      R: "wR",
      B: "wB",
      N: "wN",
      P: "wP",
    };
    const imageName = pieceMap[pieceType] || "wP"; // Default to pawn
    return `/pieces/${imageName}.svg`;
  };

  const handleMoveClick = async (move) => {
    if (!game || loading || !isPlayerTurn) return;

    setLoading(true);

    try {
      // Make player move
      const result = game.makeMove(move);

      if (result.success) {
        updateGameState(game);

        // Check if game is over
        const status = game.getGameStatus();
        if (status.gameOver) {
          setLoading(false);
          return;
        }

        // Make computer move after a brief delay
        setTimeout(async () => {
          await makeComputerMove();
        }, 800);
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const makeComputerMove = async () => {
    if (!game) return;

    try {
      const result = game.makeComputerMove();
      if (result.success) {
        updateGameState(game);
      }
    } catch (error) {
      console.error("Computer move error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewGame = () => {
    setGameStarted(false);
    setGame(null);
    setGameState(null);
    setDifficulty(null);
  };

  const handleUndoClick = () => {
    if (!game || !isPlayerTurn) return;

    const result = game.undoMove();
    if (result.success) {
      updateGameState(game);
    }
  };

  // Difficulty selection screen
  if (!gameStarted) {
    return (
      <>
        <Head>
          <title>access: chess</title>
          <meta name="description" content="Accessible chess game" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="start-screen">
          <header>
            <h1>♟️ access: chess</h1>
            <p>Choose your difficulty level</p>
          </header>

          <main className="difficulty-selection">
            <button
              onClick={() => startGame('easy')}
              className="difficulty-btn easy"
              aria-label="Start easy game"
            >
              <span className="difficulty-emoji">😊</span>
              <span className="difficulty-text">Easy</span>
            </button>

            <button
              onClick={() => startGame('medium')}
              className="difficulty-btn medium"
              aria-label="Start medium difficulty game"
            >
              <span className="difficulty-emoji">🤔</span>
              <span className="difficulty-text">Medium</span>
            </button>

            <button
              onClick={() => startGame('hard')}
              className="difficulty-btn hard"
              aria-label="Start hard game"
            >
              <span className="difficulty-emoji">🔥</span>
              <span className="difficulty-text">Hard</span>
            </button>
          </main>
        </div>
      </>
    );
  }

  if (!gameState) {
    return (
      <div className="loading-screen">
        <div role="status" aria-live="polite">
          Setting up your chess game...
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Simple Chess Game</title>
        <meta name="description" content="Simple, accessible chess game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="game-layout">
        {/* Slim Sidebar */}
        <aside className="game-sidebar">
          <div className="sidebar-header">
            <h1>♟️ Chess</h1>
            <div className="game-status">
              {gameState.status.gameOver ? (
                <div className="game-over">
                  {gameState.status.isCheckmate && "Game Over!"}
                  {gameState.status.isStalemate && "Draw!"}
                  {gameState.status.isDraw && !gameState.status.isStalemate && "Draw!"}
                </div>
              ) : (
                <div className="game-active">
                  {loading ? "🤔 Thinking..." : (gameState.status.inCheck ? "⚠️ Check!" : "")}
                </div>
              )}
            </div>
            <div className="difficulty-info">
              <span className="difficulty-badge">{difficulty}</span>
            </div>
            <button onClick={handleNewGame} className="new-game-btn">
              New Game
            </button>
            <button
              onClick={handleUndoClick}
              className="new-game-btn"
              disabled={!isPlayerTurn || (gameState && gameState.status.turn !== 'white') || !game || game.moveHistory.length < 2}
            >
              Undo Move
            </button>
          </div>
        </aside>

        {/* Chess Board */}
        <main className="board-main">
          <ChessBoard
            board={gameState.board}
            gameStatus={gameState.status}
          />
        </main>

        {/* Move Buttons */}
        <section className="moves-section">
          <h2>Available Moves</h2>
          {isPlayerTurn && !gameState.status.gameOver ? (
            <div className="moves-grid">
              {gameState.legalMoves.map((move, index) => {
                const { pieceType, notation } = getSimplifiedNotation(move);
                const pieceImageSrc = getPieceImageSrc(pieceType);
                const altText =
                  {
                    K: "King",
                    Q: "Queen",
                    R: "Rook",
                    B: "Bishop",
                    N: "Knight",
                    P: "Pawn",
                  }[pieceType] || "Piece";

                return (
                  <button
                    key={index}
                    onClick={() => handleMoveClick(move)}
                    className="move-btn"
                    disabled={loading}
                    aria-label={`Make move ${move}`}
                  >
                    <img
                      src={pieceImageSrc}
                      alt={altText}
                      className="move-piece"
                    />
                    <span className="move-notation">{notation}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="no-moves">
              {gameState.status.gameOver ? "Game finished" : "Computer's turn"}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

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

  // Get piece symbol for a move
  const getMoveSymbol = (move) => {
    // Handle castling
    if (move === "O-O" || move === "O-O-O") {
      return "♚"; // King symbol for castling
    }
    
    // Extract piece from move notation
    const firstChar = move[0];
    if (firstChar === firstChar.toUpperCase() && isNaN(firstChar)) {
      const pieceSymbols = {
        'K': '♚', // King
        'Q': '♛', // Queen  
        'R': '♜', // Rook
        'B': '♝', // Bishop
        'N': '♞', // Knight
      };
      return pieceSymbols[firstChar] || '♟'; // Default to pawn
    }
    return '♟'; // Pawn moves don't have a piece letter prefix
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

  // Difficulty selection screen
  if (!gameStarted) {
    return (
      <>
        <Head>
          <title>Simple Chess Game</title>
          <meta name="description" content="Simple, accessible chess game" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className="start-screen">
          <header>
            <h1>♟️ Chess Game</h1>
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
                  {loading ? "🤔 Thinking..." : (gameState.status.inCheck ? "⚠️ Check!" : "♟️ Playing")}
                </div>
              )}
            </div>
            <div className="difficulty-info">
              <span className="difficulty-badge">{difficulty}</span>
            </div>
            <button onClick={handleNewGame} className="new-game-btn">
              New Game
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
              {gameState.legalMoves.map((move, index) => (
                <button
                  key={index}
                  onClick={() => handleMoveClick(move)}
                  className="move-btn"
                  disabled={loading}
                  aria-label={`Make move ${move}`}
                >
                  <span className="move-piece">{getMoveSymbol(move)}</span>
                  <span className="move-notation">{move}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="no-moves">
              {gameState.status.gameOver ? "Game finished" : "Computer's turn"}
            </div>
          )}
        </section>

        {loading && (
          <div className="loading-overlay" role="status" aria-live="polite">
            <div className="loading-spinner"></div>
            <p>Computer is thinking...</p>
          </div>
        )}
      </div>
    </>
  );
}

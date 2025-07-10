import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import ChessBoard from "../components/ChessBoard";
import { ChessGameEngine } from "../lib/chess-engine";

export default function GamePage() {
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [suggestedMove, setSuggestedMove] = useState(null);
  const { difficulty } = router.query;

  useEffect(() => {
    if (difficulty) {
      const newGame = new ChessGameEngine();
      newGame.setDifficulty(difficulty === 'beginner' ? 'easy' : difficulty);
      setGame(newGame);
      updateGameState(newGame);
    }
  }, [difficulty]);

  useEffect(() => {
    if (difficulty === 'beginner' && game && isPlayerTurn) {
      const bestMove = game.getBestMove();
      setSuggestedMove(bestMove);
    } else {
      setSuggestedMove(null);
    }
  }, [difficulty, game, isPlayerTurn, gameState]);

  const updateGameState = (gameInstance) => {
    const status = gameInstance.getGameStatus();
    setGameState({
      board: gameInstance.getBoardState(),
      status,
      legalMoves: gameInstance.getLegalMoves(),
    });
    setIsPlayerTurn(status.turn === "white" && !status.gameOver);
  };

  const getFullMoveDescription = (move) => {
    if (move === "O-O") return "Castle kingside";
    if (move === "O-O-O") return "Castle queenside";

    let description = "";
    const pieceType = move.match(/^[KQRBN]/);
    const pieceName = {
      K: "King",
      Q: "Queen",
      R: "Rook",
      B: "Bishop",
      N: "Knight",
    }[pieceType ? pieceType[0] : "P"] || "Pawn";

    description = pieceName;

    if (move.includes("x")) {
      description += ` captures on ${move.slice(-2)}`;
    } else {
      const targetSquare = move.replace(/[KQRBN]/, "").slice(-2);
      description += ` to ${targetSquare}`;
    }

    if (move.includes("+")) description += ", check";
    if (move.includes("#")) description += ", checkmate";

    return description;
  };

  const getSimplifiedNotation = (move) => {
    if (move === "O-O" || move === "O-O-O") return { pieceType: "K", notation: move };
    const cleanMove = move.replace(/[+#=].*/, "");
    if (cleanMove[0] === cleanMove[0].toLowerCase()) {
      return { pieceType: "P", notation: cleanMove.slice(-2) };
    }
    const pieceType = cleanMove[0];
    const notation = cleanMove.substring(1).replace("x", "");
    return { pieceType, notation };
  };

  const getPieceImageSrc = (pieceType) => {
    const pieceMap = { K: "wK", Q: "wQ", R: "wR", B: "wB", N: "wN", P: "wP" };
    return `/pieces/${pieceMap[pieceType] || "wP"}.svg`;
  };

  const handleMoveClick = async (move) => {
    if (!game || loading || !isPlayerTurn) return;
    setLoading(true);
    const result = game.makeMove(move);
    if (result.success) {
      updateGameState(game);
      const status = game.getGameStatus();
      if (!status.gameOver) {
        setTimeout(async () => {
          await makeComputerMove();
        }, 500);
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const makeComputerMove = async () => {
    if (!game) return;
    game.makeComputerMove();
    updateGameState(game);
    setLoading(false);
  };

  const handleNewGame = () => router.push("/");

  const handleUndoClick = () => {
    if (!game || !isPlayerTurn) return;
    const result = game.undoMove();
    if (result.success) updateGameState(game);
  };
  
  if (!gameState) {
    return <div className="loading-screen">Setting up your chess game...</div>;
  }

  return (
    <>
      <Head>
        <title>access: chess Game</title>
        <meta name="description" content="An accessible chess game." />
      </Head>
      <div className="compact-game-layout">
        <header className="game-header">
          <h1>access: chess</h1>
          <div className="game-controls">
            <span className="difficulty-badge">{difficulty}</span>
            <button onClick={handleNewGame} className="control-btn">New Game</button>
            <button
              onClick={handleUndoClick}
              className="control-btn"
              disabled={!isPlayerTurn || game.moveHistory.length < 2}
            >
              Undo
            </button>
          </div>
        </header>
        
        <main className="board-container">
          <ChessBoard
            board={gameState.board}
            gameStatus={gameState.status}
            lastMove={gameState.status.lastMove}
          />
        </main>

        <section className="moves-container">
          <h2>
            {gameState.status.gameOver
              ? "Game Over"
              : isPlayerTurn
              ? ""
              : "Computer's Turn"}
            {gameState.status.inCheck && " (Check!)"}
          </h2>
          <div className="moves-grid">
            {isPlayerTurn && !gameState.status.gameOver ? (
              gameState.legalMoves.map((move, index) => {
                const { pieceType, notation } = getSimplifiedNotation(move);
                const isSuggested = move === suggestedMove;
                const description = getFullMoveDescription(move);
                const ariaLabel = isSuggested ? `*${description}*` : description;
                return (
                  <button
                    key={index}
                    onClick={() => handleMoveClick(move)}
                    className={`move-btn ${isSuggested ? "suggested-move" : ""}`}
                    aria-label={ariaLabel}
                  >
                    <img src={getPieceImageSrc(pieceType)} alt="" className="move-piece-img" />
                    <span className="move-notation">{notation}</span>
                  </button>
                );
              })
            ) : (
              <div className="no-moves-msg">
                {gameState.status.isCheckmate && "Checkmate!"}
                {gameState.status.isStalemate && "Stalemate!"}
                {gameState.status.isDraw && "Draw!"}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

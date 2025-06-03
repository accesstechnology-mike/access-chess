import { useEffect, useRef } from "react";

export default function ChessBoard({
  board,
  gameStatus,
  onBoardDescriptionUpdate,
}) {
  const boardRef = useRef(null);

  // Update board description for screen readers
  useEffect(() => {
    if (board && onBoardDescriptionUpdate) {
      const description = generateBoardDescription(board);
      onBoardDescriptionUpdate(description);
    }
  }, [board, onBoardDescriptionUpdate]);

  const generateBoardDescription = (boardArray) => {
    let description = "Chess board position:\n";

    boardArray.forEach((row, rankIndex) => {
      const rank = 8 - rankIndex;
      description += `Rank ${rank}: `;

      const pieces = [];
      row.forEach((square, fileIndex) => {
        const file = String.fromCharCode(97 + fileIndex);
        if (square.piece) {
          const colorName = square.color === "w" ? "white" : "black";
          const pieceName = getPieceName(square.piece);
          pieces.push(`${colorName} ${pieceName} on ${file}${rank}`);
        }
      });

      if (pieces.length > 0) {
        description += pieces.join(", ");
      } else {
        description += "empty";
      }
      description += "\n";
    });

    return description;
  };

  const getPieceName = (pieceSymbol) => {
    const pieceNames = {
      "♟": "pawn",
      "♜": "rook",
      "♞": "knight",
      "♝": "bishop",
      "♛": "queen",
      "♚": "king",
    };
    return pieceNames[pieceSymbol] || "piece";
  };

  const getSquareClass = (square, rankIndex, fileIndex) => {
    const baseClass = "chess-square";
    const lightSquare = square.isLight ? "light" : "dark";
    return `${baseClass} ${lightSquare}`;
  };

  const getPieceClass = (square) => {
    if (!square.piece) return "";
    const colorClass = square.color === "w" ? "white" : "black";
    return `chess-piece ${colorClass}`;
  };

  const getSquareAriaLabel = (square, rankIndex, fileIndex) => {
    const file = String.fromCharCode(97 + fileIndex);
    const rank = 8 - rankIndex;

    if (square.piece) {
      const colorName = square.color === "w" ? "white" : "black";
      const pieceName = getPieceName(square.piece);
      return `${colorName} ${pieceName} on ${file}${rank}`;
    } else {
      return `Empty square ${file}${rank}`;
    }
  };

  if (!board) {
    return (
      <div className="board-loading" role="status" aria-live="polite">
        <p>Loading chess board...</p>
      </div>
    );
  }

  return (
    <div className="chess-board-container">
      <div
        ref={boardRef}
        className="chess-board"
        role="table"
        aria-label="Chess board"
        tabIndex={0}
      >
        {/* File labels (a-h) */}
        <div className="file-labels" role="row">
          <div className="corner-label"></div>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="file-label" role="columnheader">
              {String.fromCharCode(97 + i)}
            </div>
          ))}
        </div>

        {/* Board squares with rank labels */}
        {board.map((row, rankIndex) => {
          const rank = 8 - rankIndex;
          return (
            <div key={rankIndex} className="board-row" role="row">
              <div className="rank-label" role="rowheader">
                {rank}
              </div>
              {row.map((square, fileIndex) => (
                <div
                  key={fileIndex}
                  className={getSquareClass(square, rankIndex, fileIndex)}
                  role="cell"
                  aria-label={getSquareAriaLabel(square, rankIndex, fileIndex)}
                  data-square={square.square}
                >
                  {square.piece && (
                    <span className={getPieceClass(square)} aria-hidden="true">
                      {square.piece}
                    </span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Game status announcement */}
      <div
        className="game-status-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {gameStatus?.inCheck && <span>Check! </span>}
        {gameStatus?.isCheckmate && <span>Checkmate! </span>}
        {gameStatus?.isStalemate && <span>Stalemate! </span>}
        {gameStatus?.isDraw && <span>Draw! </span>}
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

export default function ChessBoard({ board, gameStatus, lastMove }) {
  const boardRef = useRef(null);

  const getPieceName = (piece) => {
    const pieceNames = {
      p: "pawn",
      r: "rook",
      n: "knight",
      b: "bishop",
      q: "queen",
      k: "king",
    };
    return pieceNames[piece.type] || "piece";
  };

  const getPieceImage = (piece) => {
    if (!piece) return null;
    const pieceName = `${piece.color}${piece.type.toUpperCase()}`;
    return `/pieces/${pieceName}.svg`;
  };

  const getSquareClass = (square, rankIndex, fileIndex) => {
    const baseClass = "chess-square";
    const lightSquare = square.isLight ? "light" : "dark";
    let moveHighlightClass = "";
    if (lastMove) {
      if (square.square === lastMove.from) {
        moveHighlightClass = "move-from";
      } else if (square.square === lastMove.to) {
        moveHighlightClass = "move-to";
      }
    }
    return `${baseClass} ${lightSquare} ${moveHighlightClass}`;
  };

  const getSquareAriaLabel = (square, rankIndex, fileIndex) => {
    const file = String.fromCharCode(97 + fileIndex);
    const rank = 8 - rankIndex;
    const location = `${file}${rank}`;

    if (square.piece) {
      const colorName = square.color === "w" ? "White" : "Black";
      const pieceName = getPieceName(square.piece);
      return `${colorName} ${pieceName} on ${location}`;
    } else {
      return `Empty square ${location}`;
    }
  };

  const getSquareLabel = (rankIndex, fileIndex) => {
    const file = String.fromCharCode(97 + fileIndex);
    const rank = 8 - rankIndex;
    return `${file}${rank}`;
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
      >
        {/* File labels (a-h) */}
        <div className="file-labels">
          <div className="corner-label" aria-hidden="true"></div>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="file-label" aria-hidden="true">
              {String.fromCharCode(97 + i)}
            </div>
          ))}
        </div>

        {/* Board squares with rank labels */}
        {board.map((row, rankIndex) => {
          const rank = 8 - rankIndex;
          return (
            <div key={rankIndex} className="board-row">
              <div className="rank-label" aria-hidden="true">
                {rank}
              </div>
              {row.map((square, fileIndex) => (
                <div
                  key={fileIndex}
                  className={getSquareClass(square, rankIndex, fileIndex)}
                  role="gridcell"
                  aria-label={getSquareAriaLabel(square, rankIndex, fileIndex)}
                  data-square={square.square}
                >
                  {square.piece && (
                    <img
                      src={getPieceImage(square.piece)}
                      alt=""
                      className="piece-symbol"
                    />
                  )}
                  <span className="square-label" aria-hidden="true">
                    {getSquareLabel(rankIndex, fileIndex)}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Game status for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">
        {gameStatus?.inCheck && "Check! "}
        {gameStatus?.isCheckmate && "Checkmate! "}
        {gameStatus?.isStalemate && "Stalemate! "}
        {gameStatus?.isDraw && "Draw! "}
        Current turn: {gameStatus?.turn === "white" ? "White" : "Black"}
      </div>
    </div>
  );
}

import { Chess } from "chess.js";

export class ChessGameEngine {
  constructor() {
    this.chess = new Chess();
    this.moveHistory = [];
    this.lastMove = null;
  }

  // Get current board state for display
  getBoardState() {
    const board = this.chess.board();
    const boardArray = [];

    for (let rank = 7; rank >= 0; rank--) {
      const row = [];
      for (let file = 0; file < 8; file++) {
        const square = board[rank][file];
        const squareName = String.fromCharCode(97 + file) + (rank + 1);

        const squareInfo = {
          piece: square ? this.getPieceSymbol(square) : null,
          color: square ? square.color : null,
          square: squareName,
          isLight: (file + rank) % 2 === 0,
        };
        row.push(squareInfo);
      }
      boardArray.push(row);
    }
    return boardArray;
  }

  // Get Unicode chess piece symbols
  getPieceSymbol(piece) {
    const symbols = {
      p: "♟",
      r: "♜",
      n: "♞",
      b: "♝",
      q: "♛",
      k: "♚",
    };
    return symbols[piece.type] || "?";
  }

  // Get piece name for screen readers
  getPieceName(piece) {
    const names = {
      p: "pawn",
      r: "rook",
      n: "knight",
      b: "bishop",
      q: "queen",
      k: "king",
    };
    return names[piece.type] || "piece";
  }

  // Get current game status
  getGameStatus() {
    return {
      turn: this.chess.turn() === "w" ? "white" : "black",
      inCheck: this.chess.inCheck(),
      isCheckmate: this.chess.isCheckmate(),
      isStalemate: this.chess.isStalemate(),
      isInsufficientMaterial: this.chess.isInsufficientMaterial(),
      isDraw: this.chess.isDraw(),
      gameOver: this.chess.isGameOver(),
      fen: this.chess.fen(),
    };
  }

  // Get legal moves
  getLegalMoves() {
    return this.chess.moves();
  }

  // Make a move
  makeMove(moveInput) {
    try {
      const move = this.chess.move(moveInput.trim());
      if (move) {
        this.lastMove = move.san;
        this.moveHistory.push({
          move: move.san,
          player: move.color === "w" ? "White" : "Black",
          fen: this.chess.fen(),
        });
        return { success: true, move: move.san };
      }
      return { success: false, error: "Invalid move" };
    } catch (error) {
      return { success: false, error: "Invalid move format" };
    }
  }

  // Get computer move using simple strategy
  getComputerMove() {
    const moves = this.chess.moves();
    if (moves.length === 0) return null;

    // Simple strategy: prioritize captures, then checks, then random
    const captures = moves.filter((move) => move.includes("x"));
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    const checks = moves.filter((move) => move.includes("+"));
    if (checks.length > 0) {
      return checks[Math.floor(Math.random() * checks.length)];
    }

    // Random move
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Make computer move
  makeComputerMove() {
    const computerMove = this.getComputerMove();
    if (computerMove) {
      return this.makeMove(computerMove);
    }
    return { success: false, error: "No legal moves available" };
  }

  // Get board description for screen readers
  getBoardDescription() {
    const board = this.chess.board();
    let description = "Board position:\n";

    for (let rank = 7; rank >= 0; rank--) {
      const rankNumber = rank + 1;
      description += `Rank ${rankNumber}: `;

      const pieces = [];
      for (let file = 0; file < 8; file++) {
        const square = board[rank][file];
        if (square) {
          const fileName = String.fromCharCode(97 + file);
          const colorName = square.color === "w" ? "white" : "black";
          const pieceName = this.getPieceName(square);
          pieces.push(`${colorName} ${pieceName} on ${fileName}${rankNumber}`);
        }
      }

      if (pieces.length > 0) {
        description += pieces.join(", ");
      } else {
        description += "empty";
      }
      description += "\n";
    }

    return description;
  }

  // Reset game
  reset() {
    this.chess.reset();
    this.moveHistory = [];
    this.lastMove = null;
  }

  // Get move history as text
  getMoveHistoryText() {
    if (this.moveHistory.length === 0) {
      return "Game started. White to move.";
    }

    let text = "Move history:\n";
    this.moveHistory.forEach((entry, index) => {
      const moveNumber = Math.floor(index / 2) + 1;
      text += `${moveNumber}. ${entry.player}: ${entry.move}\n`;
    });
    return text;
  }
}

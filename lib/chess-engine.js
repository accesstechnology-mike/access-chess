import { Chess } from "chess.js";

export class ChessGameEngine {
  constructor() {
    this.chess = new Chess();
    this.moveHistory = [];
    this.lastMove = null;
    this.difficulty = 'medium'; // default difficulty
  }

  // Set difficulty level
  setDifficulty(level) {
    this.difficulty = level;
  }

  // Get current board state for display
  getBoardState() {
    const board = this.chess.board();
    const boardArray = [];

    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      const row = [];
      const rank = 8 - rankIndex;
      for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
        const square = board[rankIndex][fileIndex];
        const squareName = String.fromCharCode(97 + fileIndex) + rank;

        const squareInfo = {
          piece: square,
          color: square ? square.color : null,
          square: squareName,
          isLight: (fileIndex + rankIndex) % 2 === 0,
        };
        row.push(squareInfo);
      }
      boardArray.push(row);
    }
    return boardArray;
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
      lastMove: this.lastMove,
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
        this.lastMove = { from: move.from, to: move.to };
        this.moveHistory.push({
          move: move.san,
          from: move.from,
          to: move.to,
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

  // Undo the last two moves (player and computer)
  undoMove() {
    // chess.js history is per-move, so undo twice
    this.chess.undo();
    const playerMove = this.chess.undo();

    if (playerMove) {
      this.moveHistory.pop();
      this.moveHistory.pop();
      const lastHistoryEntry =
        this.moveHistory.length > 0
          ? this.moveHistory[this.moveHistory.length - 1]
          : null;
      this.lastMove = lastHistoryEntry
        ? { from: lastHistoryEntry.from, to: lastHistoryEntry.to }
        : null;
      return { success: true };
    }
    return { success: false, error: "No moves to undo" };
  }

  // Get the best move suggestion
  getBestMove() {
    const moves = this.chess.moves();
    if (moves.length === 0) return null;
    return this.getHardMove(moves);
  }

  // Get computer move using strategy based on difficulty
  getComputerMove() {
    const moves = this.chess.moves();
    if (moves.length === 0) return null;

    switch (this.difficulty) {
      case 'easy':
        return this.getEasyMove(moves);
      case 'medium':
        return this.getMediumMove(moves);
      case 'hard':
        return this.getHardMove(moves);
      default:
        return this.getMediumMove(moves);
    }
  }

  // Easy AI: Random moves with occasional blunders
  getEasyMove(moves) {
    // 30% chance to make a completely random move (simulating blunders)
    if (Math.random() < 0.3) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // Otherwise, prefer captures but not too strategically
    const captures = moves.filter((move) => move.includes("x"));
    if (captures.length > 0 && Math.random() < 0.7) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Medium AI: Basic tactical awareness
  getMediumMove(moves) {
    // Prioritize checkmate if available
    for (const move of moves) {
      const testChess = new Chess(this.chess.fen());
      testChess.move(move);
      if (testChess.isCheckmate()) {
        return move;
      }
    }

    // Avoid moves that lead to immediate checkmate
    const safeMoves = moves.filter(move => {
      const testChess = new Chess(this.chess.fen());
      testChess.move(move);
      const opponentMoves = testChess.moves();
      return !opponentMoves.some(opMove => {
        const testChess2 = new Chess(testChess.fen());
        testChess2.move(opMove);
        return testChess2.isCheckmate();
      });
    });

    const movesToConsider = safeMoves.length > 0 ? safeMoves : moves;

    // Prioritize captures, then checks
    const captures = movesToConsider.filter((move) => move.includes("x"));
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }

    const checks = movesToConsider.filter((move) => move.includes("+"));
    if (checks.length > 0) {
      return checks[Math.floor(Math.random() * checks.length)];
    }

    return movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
  }

  // Hard AI: More strategic play
  getHardMove(moves) {
    // Prioritize checkmate
    for (const move of moves) {
      const testChess = new Chess(this.chess.fen());
      testChess.move(move);
      if (testChess.isCheckmate()) {
        return move;
      }
    }

    // Avoid moves that lead to immediate material loss
    const safeMoves = moves.filter(move => {
      const testChess = new Chess(this.chess.fen());
      testChess.move(move);
      
      // Check if this move leads to immediate checkmate for opponent
      const opponentMoves = testChess.moves();
      const leadsToCheckmate = opponentMoves.some(opMove => {
        const testChess2 = new Chess(testChess.fen());
        testChess2.move(opMove);
        return testChess2.isCheckmate();
      });

      return !leadsToCheckmate;
    });

    const movesToConsider = safeMoves.length > 0 ? safeMoves : moves;

    // Evaluate moves for material gain
    const moveEvaluations = movesToConsider.map(move => {
      let score = 0;
      
      // Prioritize captures
      if (move.includes("x")) {
        score += 10;
        // Bonus for capturing higher value pieces
        if (move.includes("Q")) score += 9;
        else if (move.includes("R")) score += 5;
        else if (move.includes("B") || move.includes("N")) score += 3;
        else score += 1; // pawn
      }

      // Bonus for checks
      if (move.includes("+")) score += 5;

      // Small random factor to avoid predictability
      score += Math.random() * 2;

      return { move, score };
    });

    // Sort by score and pick from top moves
    moveEvaluations.sort((a, b) => b.score - a.score);
    const topMoves = moveEvaluations.slice(0, Math.max(1, Math.floor(moveEvaluations.length * 0.3)));
    
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
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

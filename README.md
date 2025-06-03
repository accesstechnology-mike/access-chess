# ♟️ Accessible Chess Game

A fully accessible chess game designed specifically for users who can only use keyboard input. Features comprehensive screen reader support, multiple move input formats, and plays against a computer opponent.

**🎯 Perfect for users with motor disabilities who rely on keyboard-only navigation and screen readers.**

## ✨ Accessibility Features

- **100% Keyboard Navigation** - Tab through all interface elements
- **Screen Reader Optimized** - Comprehensive ARIA labels and live regions
- **Multiple Input Formats** - Standard notation (e4), UCI (e2e4), long form (e2-e4)
- **Keyboard Shortcuts** - Quick access to game functions
- **High Contrast Support** - Respects system preferences
- **Focus Management** - Clear focus indicators and logical tab order
- **Semantic HTML** - Proper heading structure and landmarks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone and setup:**

```bash
git clone <repository-url>
cd chess
npm install
```

2. **Run development server:**

```bash
npm run dev
```

3. **Open in browser:**
   Navigate to `http://localhost:3000`

## 🎮 How to Play

### Making Moves

Type moves in the input field using any of these formats:

- **Standard:** `e4`, `Nf3`, `O-O`, `Qxd5+`
- **UCI:** `e2e4`, `g1f3`, `e1g1`
- **Long:** `e2-e4`, `Ng1-f3`

### Special Commands

Type these commands in the move input:

- `help` - Show move format help
- `moves` - Display legal moves
- `board` - Read current board position

### Keyboard Shortcuts

- **Alt+M** - Focus move input
- **Alt+L** - Show/hide legal moves
- **Alt+H** - Show/hide help
- **Alt+R** - Read board position
- **Alt+N** - Start new game
- **Escape** - Close info panels

## 🛠️ Technology Stack

- **Next.js 14** - React framework with App Router
- **Chess.js** - Chess game logic and move validation
- **TypeScript** - Type safety and better development experience
- **CSS3** - Custom accessible styling with high contrast support
- **Lichess API** - Computer opponent intelligence (with fallback)

## 📁 Project Structure

```
chess/
├── components/           # React components
│   ├── ChessBoard.js    # Accessible board display
│   └── MoveInput.js     # Move input with shortcuts
├── lib/                 # Game logic
│   └── chess-engine.js  # Chess game engine
├── pages/               # Next.js pages
│   ├── api/             # API routes
│   │   └── lichess.js   # Computer move API
│   ├── _app.js          # App component
│   └── index.js         # Main game page
├── styles/              # CSS styles
│   └── globals.css      # Accessible styling
├── package.json         # Dependencies
└── README.md           # This file
```

## 🌐 Deployment

### Vercel (Recommended)

This app is optimized for Vercel deployment:

1. **Connect repository to Vercel**
2. **Deploy automatically** - Zero configuration needed
3. **Environment variables** - None required for basic functionality

### Other Platforms

Works on any Node.js hosting platform:

```bash
npm run build
npm start
```

## ♿ Accessibility Guidelines

This game follows WCAG 2.1 AA standards:

### Screen Reader Support

- All game elements have descriptive ARIA labels
- Live regions announce game state changes
- Board position is fully described in text
- Move history is accessible as structured text

### Keyboard Navigation

- Logical tab order through all interactive elements
- Visible focus indicators on all focusable elements
- Keyboard shortcuts for common actions
- No mouse/touch required for any functionality

### Visual Design

- High contrast color scheme
- Clear typography with adequate font sizes
- Respects user's system preferences (high contrast, reduced motion)
- Scalable interface that works at 200% zoom

## 🎯 Game Features

### Player vs Computer

- You play as White, computer plays as Black
- Computer uses Lichess API when available
- Fallback to local strategy if API unavailable
- Real-time move validation and feedback

### Move Input Flexibility

- Standard algebraic notation (preferred by chess players)
- UCI notation (common in chess engines)
- Long algebraic notation (more descriptive)
- Error messages help correct invalid moves

### Game Information

- Current board position (visual and text)
- Move history with full game record
- Legal moves display
- Game status (check, checkmate, stalemate, draw)

## 🐛 Troubleshooting

### Common Issues

**Game not loading:**

- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

**Computer not moving:**

- Computer may be using fallback AI if Lichess API is unavailable
- This is normal and the game will continue

**Screen reader not announcing moves:**

- Ensure ARIA live regions are supported in your screen reader
- Try different screen reader software if issues persist

### Browser Compatibility

- Chrome 90+ (recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 Development

### Adding Features

The codebase is modular and extensible:

- Add new move input formats in `MoveInput.js`
- Extend computer AI in `chess-engine.js`
- Enhance accessibility in component ARIA labels
- Improve styling in `globals.css`

### Testing Accessibility

- Use NVDA, JAWS, or VoiceOver to test screen reader compatibility
- Navigate using only Tab, Enter, and arrow keys
- Test with browser zoom at 200%
- Verify high contrast mode support

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please focus on:

- Improving accessibility features
- Enhancing screen reader compatibility
- Adding new move input formats
- Optimizing keyboard navigation
- Better computer AI strategies

## 💬 Support

For accessibility issues or game problems, please open an issue in the repository with:

- Your assistive technology setup
- Browser and operating system
- Specific accessibility barriers encountered
- Steps to reproduce any issues

---

**Built with ♿ accessibility first, ♟️ chess second.**

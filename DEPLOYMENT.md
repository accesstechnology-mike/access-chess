# Deployment Guide

## 🚀 Local Development

### Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
python3 app.py

# Open browser to http://localhost:5000
```

### Using the Startup Script

```bash
# Make executable (one time)
chmod +x start_chess_webapp.sh

# Start the application
./start_chess_webapp.sh
```

## 🌐 Production Deployment

### Prerequisites

- Python 3.7+
- Modern web browser for users
- Internet connection (recommended for stronger AI)

### Option 1: Gunicorn (Recommended)

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# With logging
gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - --error-logfile - app:app
```

### Option 2: Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

```bash
# Build and run
docker build -t accessible-chess .
docker run -p 5000:5000 accessible-chess
```

### Option 3: Apache/Nginx + WSGI

```python
# wsgi.py
from app import app

if __name__ == "__main__":
    app.run()
```

## 🔧 Configuration

### Environment Variables

```bash
# Optional: Set secret key for sessions
export SECRET_KEY="your-secret-key-here"

# Optional: Set Flask environment
export FLASK_ENV=production
```

### Security Considerations

- Set a strong `SECRET_KEY` for production
- Use HTTPS in production
- Consider rate limiting for API endpoints
- Review CORS settings for your domain

## 📋 System Requirements

### Server Requirements

- **RAM**: 512MB minimum, 1GB recommended
- **CPU**: 1 core minimum
- **Storage**: 100MB for application
- **Network**: Outbound internet for Lichess API (optional)

### Browser Compatibility

- **Chrome**: Version 60+
- **Firefox**: Version 55+
- **Safari**: Version 11+
- **Edge**: Version 79+

### Accessibility Requirements

- JavaScript enabled
- Cookies enabled for session management
- Screen reader compatibility (JAWS, NVDA, VoiceOver, etc.)

## 🔍 Monitoring & Logs

### Health Check Endpoint

```bash
# Check if application is running
curl http://localhost:5000/

# Should return the main chess game page
```

### Log Levels

- **INFO**: Game events, moves, API calls
- **WARNING**: API failures, fallback AI usage
- **ERROR**: Application errors, invalid requests

### Performance Monitoring

- Monitor response times for move submissions
- Track API success/failure rates
- Watch for memory usage with multiple sessions

## 🛠️ Troubleshooting

### Common Issues

#### Application Won't Start

```bash
# Check Python version
python3 --version  # Should be 3.7+

# Verify dependencies
pip list | grep -E "(flask|chess|requests)"

# Check for port conflicts
netstat -tulpn | grep :5000
```

#### Chess Engine Errors

```bash
# Test chess functionality
python3 -c "import chess; print(chess.Board())"

# Test move parsing
python3 -c "import chess; b=chess.Board(); print(b.parse_san('e4'))"
```

#### API Connection Issues

```bash
# Test Lichess API
curl "https://lichess.org/api/cloud-eval?fen=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201"
```

#### Browser Compatibility

- Enable JavaScript in browser settings
- Clear browser cache and cookies
- Try in incognito/private mode
- Check browser console for errors

### Performance Optimization

#### Server-Side

- Use Redis for session storage in production
- Implement connection pooling for database
- Cache API responses from Lichess
- Use CDN for static assets

#### Client-Side

- Enable gzip compression
- Minify CSS/JavaScript for production
- Implement service worker for offline play
- Use browser caching for static assets

## 🔒 Security Best Practices

### Application Security

- Keep dependencies updated
- Use environment variables for secrets
- Implement CSRF protection for forms
- Sanitize all user inputs

### Web Security

- Use HTTPS in production
- Set security headers (CSP, HSTS, etc.)
- Implement rate limiting
- Regular security audits

### Accessibility Security

- Ensure all features work without JavaScript
- Provide alternative text for all images
- Test with multiple screen readers
- Validate keyboard navigation paths

## 📊 Analytics & Usage

### Game Metrics

- Number of games played
- Average game length
- Most common opening moves
- Win/loss/draw statistics

### Performance Metrics

- Average response time
- API success rate
- User session duration
- Browser/device statistics

### Accessibility Metrics

- Screen reader usage
- Keyboard-only navigation
- High contrast mode usage
- Response time for assistive technologies

## 🚀 Scaling Considerations

### Horizontal Scaling

- Use load balancer for multiple instances
- Implement session affinity or shared storage
- Consider microservices architecture
- Use container orchestration (Kubernetes)

### Database Scaling

- Move to PostgreSQL/MySQL for persistence
- Implement connection pooling
- Use read replicas for game history
- Consider caching layer (Redis)

### Performance Scaling

- CDN for static assets
- API rate limiting and caching
- Background job processing
- Database query optimization

This deployment guide covers development to production scenarios while maintaining the accessibility-first approach of the chess application.

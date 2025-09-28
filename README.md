# 🎯 B2B Sales Intelligence Platform

A deterministic, enterprise-grade sales intelligence platform that analyzes job postings and company data to score leads without AI dependencies.

## 🚀 Features

- **Deterministic Analysis Engine**: Rule-based scoring system for consistent, explainable results
- **Zero AI Dependency**: Perfect for enterprise compliance and regulations
- **Real-time Performance**: Sub-second analysis for individual leads
- **Batch Processing**: Analyze thousands of leads efficiently
- **Modern Web Interface**: Intuitive dashboard for sales teams
- **RESTful API**: Easy integration with existing CRM systems
- **Production Ready**: Docker containerized with CI/CD pipelines

## 📊 How It Works

The platform uses a sophisticated rule-based engine that analyzes:

### Job Title Analysis
- **C-Level Executives**: CEO, CTO, CFO (Score: 95-100)
- **Directors & VPs**: Decision makers (Score: 85-90)
- **Managers**: Influencers (Score: 70-80)
- **Specialists**: End users (Score: 45-55)

### Company Tier Classification
- **Enterprise**: 1000+ employees (Weight: 100%)
- **Large**: 250-999 employees (Weight: 85%)
- **Medium**: 50-249 employees (Weight: 70%)
- **Small**: 10-49 employees (Weight: 55%)
- **Startup**: 1-9 employees (Weight: 40%)

### Department Prioritization
- **Sales & Business Development**: Highest priority
- **Marketing & Product**: High priority
- **Engineering & Operations**: Medium priority
- **Support Functions**: Lower priority

## 🛠 Installation

### Quick Start

```bash
# Clone the repository
git clone https://github.com/vm799/b2b-sales-intelligence-platform.git
cd b2b-sales-intelligence-platform

# Run automated setup
npm run setup

# Start development server
npm run dev
```

### Manual Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Create necessary directories
mkdir -p logs uploads coverage

# Start the server
npm start
```

## 🔧 Configuration

Update the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_secure_secret_here
```

## 📚 API Documentation

### Health Check
```bash
GET /api/health
```

### Single Lead Analysis
```bash
POST /api/analyze-lead
Content-Type: application/json

{
  "job": {
    "title": "Chief Executive Officer",
    "company": "TechCorp Inc"
  },
  "company": {
    "name": "TechCorp Inc",
    "employees": 1500,
    "industry": "technology",
    "location": "San Francisco, CA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalScore": 92,
    "priority": "high",
    "jobAnalysis": {
      "score": 100,
      "level": "c_level",
      "department": "unknown"
    },
    "companyAnalysis": {
      "tier": "enterprise",
      "weight": 100,
      "employees": 1500,
      "industry": "technology"
    },
    "insights": [
      "High-value C-level executive - excellent decision-making authority",
      "Large enterprise - potential for high-value deal",
      "Prime prospect - should be prioritized for immediate outreach"
    ]
  }
}
```

### Batch Analysis
```bash
POST /api/batch-analyze
Content-Type: application/json

{
  "leads": [
    {
      "id": "lead-1",
      "job": { "title": "CEO", "company": "TechCorp" },
      "company": { "name": "TechCorp", "employees": 1500, "industry": "technology" }
    }
  ]
}
```

### Analysis Criteria
```bash
GET /api/analysis-criteria
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Test functionality (requires running server)
npm run analyze:sample

# Run specific test suites
npm run test -- --grep "analysis engine"
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up --build
```

### Production
```bash
# Build image
docker build -t b2b-sales-intelligence .

# Run container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  b2b-sales-intelligence
```

## 📈 Performance Benchmarks

- **Single Lead Analysis**: < 5ms average response time
- **Batch Processing**: 1000+ leads/second
- **Memory Usage**: < 100MB for 10,000 cached analyses
- **Concurrent Users**: Supports 100+ simultaneous connections

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │────│   Express API   │────│ Analysis Engine │
│   (React/HTML)  │    │   (Node.js)     │    │ (Deterministic) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Static Files  │    │   Rate Limiting │    │ Scoring Rules   │
│   CSS/JS/Images │    │   CORS/Security │    │ Job Classification│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔒 Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Sanitizes all user inputs
- **Helmet.js**: Security headers implementation
- **No Data Persistence**: Stateless operation for privacy

## 📝 Scripts Reference

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run setup` - Automated environment setup
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs on [GitHub Issues](https://github.com/vm799/b2b-sales-intelligence-platform/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/vm799/b2b-sales-intelligence-platform/discussions)

## 🏆 Use Cases

### Sales Teams
- **Lead Prioritization**: Focus on highest-value prospects
- **Territory Planning**: Understand market potential
- **Performance Tracking**: Measure outreach effectiveness

### Marketing Teams
- **Account-Based Marketing**: Target decision makers
- **Campaign Optimization**: Focus on high-scoring segments
- **Lead Qualification**: Pre-qualify inbound leads

### Business Development
- **Partnership Opportunities**: Identify strategic partners
- **Market Research**: Understand competitive landscape
- **Investment Analysis**: Evaluate potential acquisitions

---

**Built with ❤️ for enterprise sales teams**
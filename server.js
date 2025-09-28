const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Deterministic Job Analysis Engine
class JobAnalysisEngine {
  constructor() {
    this.jobTitleWeights = {
      'ceo': 100, 'chief executive officer': 100,
      'cto': 95, 'chief technology officer': 95,
      'cfo': 95, 'chief financial officer': 95,
      'vp': 90, 'vice president': 90,
      'director': 85, 'senior director': 87,
      'manager': 70, 'senior manager': 75,
      'lead': 65, 'senior lead': 68,
      'specialist': 50, 'senior specialist': 55,
      'analyst': 45, 'senior analyst': 50,
      'coordinator': 40, 'associate': 35,
      'assistant': 30, 'intern': 20
    };

    this.departmentWeights = {
      'sales': 95, 'business development': 90,
      'marketing': 85, 'product': 80,
      'engineering': 75, 'technology': 75,
      'operations': 70, 'finance': 65,
      'hr': 60, 'human resources': 60,
      'legal': 55, 'admin': 40
    };

    this.companyTiers = {
      'enterprise': { weight: 100, employee_range: [1000, Infinity] },
      'large': { weight: 85, employee_range: [250, 999] },
      'medium': { weight: 70, employee_range: [50, 249] },
      'small': { weight: 55, employee_range: [10, 49] },
      'startup': { weight: 40, employee_range: [1, 9] }
    };
  }

  analyzeJobTitle(title) {
    if (!title) return { score: 0, level: 'unknown', department: 'unknown' };
    
    const normalizedTitle = title.toLowerCase();
    let bestScore = 0;
    let level = 'individual_contributor';
    let department = 'unknown';

    // Determine job level
    for (const [keyword, weight] of Object.entries(this.jobTitleWeights)) {
      if (normalizedTitle.includes(keyword)) {
        if (weight > bestScore) {
          bestScore = weight;
          if (weight >= 90) level = 'c_level';
          else if (weight >= 80) level = 'director';
          else if (weight >= 65) level = 'manager';
          else if (weight >= 45) level = 'specialist';
          else level = 'individual_contributor';
        }
      }
    }

    // Determine department
    for (const [dept, weight] of Object.entries(this.departmentWeights)) {
      if (normalizedTitle.includes(dept)) {
        department = dept;
        break;
      }
    }

    return { score: bestScore, level, department };
  }

  analyzeCompany(companyData) {
    const { name, employees, industry, location } = companyData;
    let tier = 'startup';
    let weight = 40;

    for (const [tierName, tierData] of Object.entries(this.companyTiers)) {
      const [min, max] = tierData.employee_range;
      if (employees >= min && employees <= max) {
        tier = tierName;
        weight = tierData.weight;
        break;
      }
    }

    return {
      tier,
      weight,
      employees,
      industry: industry || 'unknown',
      location: location || 'unknown'
    };
  }

  calculateLeadScore(jobData, companyData) {
    const jobAnalysis = this.analyzeJobTitle(jobData.title);
    const companyAnalysis = this.analyzeCompany(companyData);
    
    // Base score from job title
    let score = jobAnalysis.score;
    
    // Company size multiplier
    score = score * (companyAnalysis.weight / 100);
    
    // Department bonus for sales-related roles
    if (jobAnalysis.department === 'sales' || jobAnalysis.department === 'business development') {
      score *= 1.2;
    }
    
    // Industry modifiers (can be customized based on target industries)
    const industryMultipliers = {
      'technology': 1.1,
      'software': 1.1,
      'saas': 1.15,
      'finance': 1.05,
      'healthcare': 1.05,
      'manufacturing': 0.95,
      'retail': 0.9
    };
    
    const industryKey = companyAnalysis.industry.toLowerCase();
    const industryMultiplier = industryMultipliers[industryKey] || 1.0;
    score *= industryMultiplier;
    
    // Cap the score at 100
    score = Math.min(score, 100);
    
    return {
      totalScore: Math.round(score),
      jobAnalysis,
      companyAnalysis,
      priority: this.getPriorityLevel(score)
    };
  }

  getPriorityLevel(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'low';
    return 'very_low';
  }

  generateInsights(analysis) {
    const insights = [];
    
    if (analysis.jobAnalysis.level === 'c_level') {
      insights.push('High-value C-level executive - excellent decision-making authority');
    }
    
    if (analysis.jobAnalysis.department === 'sales') {
      insights.push('Sales professional - likely understands value of sales tools');
    }
    
    if (analysis.companyAnalysis.tier === 'enterprise') {
      insights.push('Large enterprise - potential for high-value deal');
    }
    
    if (analysis.totalScore >= 80) {
      insights.push('Prime prospect - should be prioritized for immediate outreach');
    }
    
    return insights;
  }
}

// Initialize the analysis engine
const analysisEngine = new JobAnalysisEngine();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.post('/api/analyze-lead', (req, res) => {
  try {
    const { job, company } = req.body;
    
    if (!job || !company) {
      return res.status(400).json({
        error: 'Missing required fields: job and company data'
      });
    }
    
    const analysis = analysisEngine.calculateLeadScore(job, company);
    const insights = analysisEngine.generateInsights(analysis);
    
    res.json({
      success: true,
      data: {
        ...analysis,
        insights,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Internal server error during analysis'
    });
  }
});

app.post('/api/batch-analyze', (req, res) => {
  try {
    const { leads } = req.body;
    
    if (!Array.isArray(leads)) {
      return res.status(400).json({
        error: 'Leads must be an array'
      });
    }
    
    const results = leads.map((lead, index) => {
      try {
        const analysis = analysisEngine.calculateLeadScore(lead.job, lead.company);
        const insights = analysisEngine.generateInsights(analysis);
        
        return {
          id: lead.id || index,
          success: true,
          analysis: {
            ...analysis,
            insights
          }
        };
      } catch (error) {
        return {
          id: lead.id || index,
          success: false,
          error: error.message
        };
      }
    });
    
    res.json({
      success: true,
      processed: results.length,
      results
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      error: 'Internal server error during batch analysis'
    });
  }
});

app.get('/api/analysis-criteria', (req, res) => {
  res.json({
    success: true,
    data: {
      jobTitleWeights: analysisEngine.jobTitleWeights,
      departmentWeights: analysisEngine.departmentWeights,
      companyTiers: analysisEngine.companyTiers
    }
  });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 B2B Sales Intelligence Platform running on port ${PORT}`);
  console.log(`📊 Analysis engine initialized with ${Object.keys(analysisEngine.jobTitleWeights).length} job title patterns`);
  console.log(`🏢 Company tier analysis supports ${Object.keys(analysisEngine.companyTiers).length} tiers`);
});

module.exports = app;
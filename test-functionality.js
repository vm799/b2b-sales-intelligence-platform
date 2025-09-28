const axios = require('axios');

// Test the B2B Sales Intelligence Platform functionality
class PlatformTester {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.testResults = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    console.log(logMessage);
    
    this.testResults.push({
      timestamp,
      type,
      message,
      success: type === 'success'
    });
  }

  async runAllTests() {
    this.log('🚀 Starting B2B Sales Intelligence Platform Tests');
    this.log('================================================');
    
    // Test sample data
    const testLeads = [
      {
        id: 'test-1',
        job: {
          title: 'Chief Executive Officer',
          company: 'TechCorp Inc'
        },
        company: {
          name: 'TechCorp Inc',
          employees: 1500,
          industry: 'Technology',
          location: 'San Francisco, CA'
        }
      },
      {
        id: 'test-2',
        job: {
          title: 'Sales Director',
          company: 'StartupXYZ'
        },
        company: {
          name: 'StartupXYZ',
          employees: 25,
          industry: 'SaaS',
          location: 'Austin, TX'
        }
      },
      {
        id: 'test-3',
        job: {
          title: 'Marketing Manager',
          company: 'MegaCorp'
        },
        company: {
          name: 'MegaCorp',
          employees: 5000,
          industry: 'Manufacturing',
          location: 'Detroit, MI'
        }
      },
      {
        id: 'test-4',
        job: {
          title: 'Junior Developer',
          company: 'DevShop'
        },
        company: {
          name: 'DevShop',
          employees: 8,
          industry: 'Software',
          location: 'Portland, OR'
        }
      }
    ];

    try {
      // Test 1: Health Check
      await this.testHealthCheck();
      
      // Test 2: Single Lead Analysis
      await this.testSingleLeadAnalysis(testLeads[0]);
      
      // Test 3: Batch Lead Analysis
      await this.testBatchAnalysis(testLeads);
      
      // Test 4: Analysis Criteria Endpoint
      await this.testAnalysisCriteria();
      
      // Test 5: Error Handling
      await this.testErrorHandling();
      
      // Test 6: Performance Test
      await this.testPerformance(testLeads);
      
      this.log('================================================');
      this.printSummary();
      
    } catch (error) {
      this.log(`Fatal error during testing: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async testHealthCheck() {
    this.log('Testing health check endpoint...');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/health`);
      
      if (response.status === 200 && response.data.status === 'healthy') {
        this.log('✅ Health check passed', 'success');
        this.log(`   Status: ${response.data.status}`);
        this.log(`   Version: ${response.data.version}`);
      } else {
        this.log('❌ Health check failed - unexpected response', 'error');
      }
    } catch (error) {
      this.log(`❌ Health check failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testSingleLeadAnalysis(lead) {
    this.log('Testing single lead analysis...');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/analyze-lead`, lead);
      
      if (response.status === 200 && response.data.success) {
        const analysis = response.data.data;
        this.log('✅ Single lead analysis passed', 'success');
        this.log(`   Lead: ${lead.job.title} at ${lead.company.name}`);
        this.log(`   Score: ${analysis.totalScore}`);
        this.log(`   Priority: ${analysis.priority}`);
        this.log(`   Job Level: ${analysis.jobAnalysis.level}`);
        this.log(`   Company Tier: ${analysis.companyAnalysis.tier}`);
        this.log(`   Insights: ${analysis.insights.length} generated`);
        
        // Validate analysis structure
        this.validateAnalysisStructure(analysis);
        
      } else {
        this.log('❌ Single lead analysis failed - unexpected response', 'error');
      }
    } catch (error) {
      this.log(`❌ Single lead analysis failed: ${error.message}`, 'error');
    }
  }

  async testBatchAnalysis(leads) {
    this.log('Testing batch lead analysis...');
    
    try {
      const response = await axios.post(`${this.baseURL}/api/batch-analyze`, { leads });
      
      if (response.status === 200 && response.data.success) {
        const results = response.data.results;
        this.log('✅ Batch analysis passed', 'success');
        this.log(`   Processed: ${response.data.processed} leads`);
        
        // Analyze results
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        this.log(`   Successful analyses: ${successful}`);
        this.log(`   Failed analyses: ${failed}`);
        
        // Show sample results
        results.slice(0, 2).forEach((result, index) => {
          if (result.success) {
            this.log(`   Lead ${index + 1} Score: ${result.analysis.totalScore} (${result.analysis.priority})`);
          }
        });
        
      } else {
        this.log('❌ Batch analysis failed - unexpected response', 'error');
      }
    } catch (error) {
      this.log(`❌ Batch analysis failed: ${error.message}`, 'error');
    }
  }

  async testAnalysisCriteria() {
    this.log('Testing analysis criteria endpoint...');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/analysis-criteria`);
      
      if (response.status === 200 && response.data.success) {
        const criteria = response.data.data;
        this.log('✅ Analysis criteria endpoint passed', 'success');
        this.log(`   Job title patterns: ${Object.keys(criteria.jobTitleWeights).length}`);
        this.log(`   Department types: ${Object.keys(criteria.departmentWeights).length}`);
        this.log(`   Company tiers: ${Object.keys(criteria.companyTiers).length}`);
      } else {
        this.log('❌ Analysis criteria failed - unexpected response', 'error');
      }
    } catch (error) {
      this.log(`❌ Analysis criteria failed: ${error.message}`, 'error');
    }
  }

  async testErrorHandling() {
    this.log('Testing error handling...');
    
    try {
      // Test with invalid data
      const response = await axios.post(`${this.baseURL}/api/analyze-lead`, {});
      this.log('❌ Error handling failed - should have returned 400', 'error');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('✅ Error handling passed - correctly returned 400 for invalid data', 'success');
      } else {
        this.log(`❌ Error handling failed: ${error.message}`, 'error');
      }
    }
    
    try {
      // Test with non-existent endpoint
      const response = await axios.get(`${this.baseURL}/api/non-existent`);
      this.log('❌ 404 handling failed - should have returned 404', 'error');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.log('✅ 404 handling passed - correctly returned 404 for non-existent endpoint', 'success');
      } else {
        this.log(`❌ 404 handling failed: ${error.message}`, 'error');
      }
    }
  }

  async testPerformance(leads) {
    this.log('Testing performance...');
    
    try {
      const startTime = Date.now();
      
      // Run batch analysis multiple times
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(axios.post(`${this.baseURL}/api/batch-analyze`, { leads }));
      }
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      const avgTime = duration / 5;
      const leadsPerSecond = (leads.length * 5) / (duration / 1000);
      
      this.log('✅ Performance test completed', 'success');
      this.log(`   Total time: ${duration}ms`);
      this.log(`   Average batch time: ${avgTime.toFixed(2)}ms`);
      this.log(`   Leads per second: ${leadsPerSecond.toFixed(2)}`);
      
      if (avgTime < 100) {
        this.log('   🚀 Excellent performance (< 100ms per batch)', 'success');
      } else if (avgTime < 500) {
        this.log('   ✅ Good performance (< 500ms per batch)', 'success');
      } else {
        this.log('   ⚠️ Performance could be improved (> 500ms per batch)', 'warning');
      }
      
    } catch (error) {
      this.log(`❌ Performance test failed: ${error.message}`, 'error');
    }
  }

  validateAnalysisStructure(analysis) {
    const requiredFields = [
      'totalScore',
      'jobAnalysis',
      'companyAnalysis',
      'priority',
      'insights'
    ];
    
    for (const field of requiredFields) {
      if (!(field in analysis)) {
        this.log(`❌ Missing required field: ${field}`, 'error');
        return false;
      }
    }
    
    // Validate score range
    if (analysis.totalScore < 0 || analysis.totalScore > 100) {
      this.log(`❌ Invalid score range: ${analysis.totalScore}`, 'error');
      return false;
    }
    
    // Validate priority levels
    const validPriorities = ['high', 'medium', 'low', 'very_low'];
    if (!validPriorities.includes(analysis.priority)) {
      this.log(`❌ Invalid priority level: ${analysis.priority}`, 'error');
      return false;
    }
    
    this.log('✅ Analysis structure validation passed', 'success');
    return true;
  }

  printSummary() {
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;
    
    this.log('📊 TEST SUMMARY');
    this.log(`Total test steps: ${totalTests}`);
    this.log(`Successful: ${successfulTests}`);
    this.log(`Failed: ${failedTests}`);
    this.log(`Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests === 0) {
      this.log('🎉 All tests passed! Platform is ready for use.', 'success');
    } else {
      this.log(`⚠️ ${failedTests} test(s) failed. Please review the issues above.`, 'warning');
    }
  }
}

// Command line execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const baseURL = args[0] || 'http://localhost:3000';
  
  console.log(`Starting tests against: ${baseURL}`);
  console.log('Make sure the server is running before executing tests.\n');
  
  const tester = new PlatformTester(baseURL);
  
  tester.runAllTests().catch(error => {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = PlatformTester;
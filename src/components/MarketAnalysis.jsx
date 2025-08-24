import React, { useState } from 'react';
import { getMarketData, getGeminiAnalysis } from '../services/marketAnalysisApi';
import { Bar, Line } from 'react-chartjs-2';
import {
  MarketSharePieChart,
  TrafficLineChart,
  DemographicsBarChart,
  PerformanceMetricsChart,
  DailyTrafficChart
} from './charts/MarketCharts';

const MarketAnalysis = () => {
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('strengths');
  
  // New state for tab-specific AI analysis data
  const [aiAnalysisData, setAiAnalysisData] = useState({
    strengths: [],
    improvements: [],
    recommendations: [],
    risks: []
  });
  const [tabLoading, setTabLoading] = useState({
    strengths: false,
    improvements: false,
    recommendations: false,
    risks: false
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  const handleAnalysis = async (e) => {
    e.preventDefault();
    if (!website.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError('');
    setMarketData(null);
    setGeminiAnalysis('');
    setAiAnalysisData({
      strengths: [],
      improvements: [],
      recommendations: [],
      risks: []
    });

    try {
      // Get market data
      const data = await getMarketData(website);
      setMarketData(data);

      // Get Gemini AI analysis for all tabs
      await fetchAllTabAnalysis(website, data);
      
      // Set timestamp for successful analysis
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to analyze website. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTabAnalysis = async (website, marketData) => {
    try {
      // Fetch analysis for all tabs in parallel
      const [strengths, improvements, recommendations, risks] = await Promise.all([
        fetchTabAnalysis(website, marketData, 'strengths'),
        fetchTabAnalysis(website, marketData, 'improvements'),
        fetchTabAnalysis(website, marketData, 'recommendations'),
        fetchTabAnalysis(website, marketData, 'risks')
      ]);

      setAiAnalysisData({
        strengths,
        improvements,
        recommendations,
        risks
      });
    } catch (error) {
      console.error('Error fetching tab analysis:', error);
      // Set fallback data if API fails
      setAiAnalysisData({
        strengths: ['Analysis failed. Please try again.'],
        improvements: ['Analysis failed. Please try again.'],
        recommendations: ['Analysis failed. Please try again.'],
        risks: ['Analysis failed. Please try again.']
      });
    }
  };

  const fetchTabAnalysis = async (website, marketData, tabType) => {
    setTabLoading(prev => ({ ...prev, [tabType]: true }));
    
    try {
      const prompt = getPromptForTab(website, marketData, tabType);
      const analysis = await getGeminiAnalysis(website, marketData, prompt);
      
      // Parse the analysis response into bullet points
      const bulletPoints = parseAnalysisToBulletPoints(analysis, tabType);
      return bulletPoints;
    } catch (error) {
      console.error(`Error fetching ${tabType} analysis:`, error);
      return [`Failed to load ${tabType} analysis. Please try again.`];
    } finally {
      setTabLoading(prev => ({ ...prev, [tabType]: false }));
    }
  };

  const getPromptForTab = (website, marketData, tabType) => {
    const baseData = `
Website: ${website}
Market Share: ${marketData.marketShare.toFixed(2)}%
Monthly Traffic: ${marketData.trafficData.monthly[marketData.trafficData.monthly.length - 1].visitors.toLocaleString()} visitors
Load Time: ${marketData.performance.loadTime.toFixed(2)}s
SEO Score: ${marketData.performance.seoScore.toFixed(0)}/100
Bounce Rate: ${marketData.performance.bounceRate.toFixed(1)}%
Conversion Rate: ${marketData.performance.conversionRate.toFixed(2)}%
`;

    switch (tabType) {
      case 'strengths':
        return `${baseData}
Analyze the above market data and identify the key strengths and competitive advantages of this website. 
Focus on what makes this website successful in the market.
Provide 5-7 specific, actionable strengths based on the data.
Format as bullet points only.`;
      
      case 'improvements':
        return `${baseData}
Analyze the above market data and identify areas where this website can improve.
Focus on performance gaps, missed opportunities, and areas for optimization.
Provide 5-7 specific, actionable improvement areas based on the data.
Format as bullet points only.`;
      
      case 'recommendations':
        return `${baseData}
Based on the market data analysis, provide strategic recommendations for this website.
Focus on actionable strategies, growth opportunities, and competitive positioning.
Provide 5-7 specific, actionable strategic recommendations.
Format as bullet points only.`;
      
      case 'risks':
        return `${baseData}
Analyze the market data and identify potential risks and threats to this website.
Consider market competition, technology changes, economic factors, and business risks.
Provide 5-7 specific risk factors with brief explanations.
Format as bullet points only.`;
      
      default:
        return baseData;
    }
  };

  const parseAnalysisToBulletPoints = (analysis, tabType) => {
    try {
      // Split the analysis by lines and filter out empty lines
      const lines = analysis.split('\n').filter(line => line.trim());
      
      // Look for bullet points or numbered lists
      const bulletPoints = lines
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.startsWith('-') || 
                 trimmed.startsWith('•') || 
                 trimmed.startsWith('*') ||
                 /^\d+\./.test(trimmed) ||
                 trimmed.length > 20; // Lines that are likely content
        })
        .map(line => {
          // Clean up the line by removing bullet markers and extra spaces
          return line.replace(/^[-•*\s\d.]+/, '').trim();
        })
        .filter(line => line.length > 10); // Filter out very short lines
      
      // Filter out introductory/explanatory text that typically appears first
      const filteredPoints = bulletPoints.filter((point, index) => {
        const lowerPoint = point.toLowerCase();
        
        // Remove points that are explaining what the analysis is about
        if (index === 0) {
          // Skip the first point if it's introductory
          if (lowerPoint.includes('analysis for') || 
              lowerPoint.includes('key strengths analysis') ||
              lowerPoint.includes('areas for improvement') ||
              lowerPoint.includes('strategic recommendations') ||
              lowerPoint.includes('risk factors') ||
              lowerPoint.includes('market analysis') ||
              lowerPoint.includes('website holds') ||
              lowerPoint.includes('positioning it as') ||
              lowerPoint.includes('market position')) {
            return false;
          }
        }
        
        // Remove points that are too generic or explanatory
        if (lowerPoint.includes('this website') && lowerPoint.includes('market share')) return false;
        if (lowerPoint.includes('strong monthly traffic')) return false;
        if (lowerPoint.includes('good seo performance')) return false;
        if (lowerPoint.includes('competitive load time')) return false;
        if (lowerPoint.includes('bounce rate') && lowerPoint.includes('could be optimized')) return false;
        if (lowerPoint.includes('conversion rate') && lowerPoint.includes('room for growth')) return false;
        
        return true;
      });
      
      // If we have good filtered points, return them
      if (filteredPoints.length >= 3) {
        return filteredPoints.slice(0, 7); // Limit to 7 points
      }
      
      // If filtering removed too many points, fall back to original but skip first
      if (bulletPoints.length >= 3) {
        return bulletPoints.slice(1, 8); // Skip first point, take up to 7
      }
      
      // Fallback: split by sentences if bullet parsing fails
      const sentences = analysis.split(/[.!?]+/).filter(s => s.trim().length > 20);
      return sentences.slice(1, 6).map(s => s.trim()); // Skip first sentence
      
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return [`Analysis for ${tabType} is available but could not be parsed properly.`];
    }
  };

  const renderTabContent = () => {
    const currentData = aiAnalysisData[activeTab];
    const isLoading = tabLoading[activeTab];
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Analyzing {activeTab}...</span>
        </div>
      );
    }

    if (!currentData || currentData.length === 0) {
      if (marketData) {
        return (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-lg font-medium text-gray-600 mb-2">No Analysis Data Available</p>
            <p className="text-gray-500 mb-4">Click "Refresh All" to generate AI-powered analysis for all tabs.</p>
            <button
              onClick={() => handleAnalysis({ preventDefault: () => {} })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Generate Analysis
            </button>
          </div>
        );
      } else {
        return (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-lg font-medium text-gray-600 mb-2">Ready to Analyze</p>
            <p className="text-gray-500">Enter a website URL above and click "Analyze" to get started.</p>
          </div>
        );
      }
    }

    const getTabIcon = (tabType) => {
      switch (tabType) {
        case 'strengths':
          return (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          );
        case 'improvements':
        case 'risks':
          return (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          );
        case 'recommendations':
          return (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          );
        default:
          return null;
      }
    };

    const getTabTitle = (tabType) => {
      switch (tabType) {
        case 'strengths': return 'Key Strengths';
        case 'improvements': return 'Areas of Improvement';
        case 'recommendations': return 'Strategic Recommendations';
        case 'risks': return 'Risk Factors';
        default: return tabType;
      }
    };

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-blue-700 mb-4">{getTabTitle(activeTab)}</h4>
        <div className="grid gap-3">
          {currentData.map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                {getTabIcon(activeTab)}
              </div>
              <p className="text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const refreshTabAnalysis = async (tabType) => {
    setTabLoading(prev => ({ ...prev, [tabType]: true }));
    try {
      const prompt = getPromptForTab(website, marketData, tabType);
      const analysis = await getGeminiAnalysis(website, marketData, prompt);
      const bulletPoints = parseAnalysisToBulletPoints(analysis, tabType);
      setAiAnalysisData(prev => ({ ...prev, [tabType]: bulletPoints }));
      setLastUpdated(new Date());
    } catch (error) {
      console.error(`Error refreshing ${tabType} analysis:`, error);
      setAiAnalysisData(prev => ({ ...prev, [tabType]: [`Failed to refresh ${tabType} analysis. Please try again.`] }));
    } finally {
      setTabLoading(prev => ({ ...prev, [tabType]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      

      {/* Search Section */}
      <div className="w-full px-2 sm:px-4 lg:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Analyze Website Market Performance
          </h2>
          
          <form onSubmit={handleAnalysis} className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section - Full Screen Grid Layout */}
        {marketData && (
          <div className="w-full space-y-4">
            {/* Top Row - 3 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
              {/* Top Left Card: Total Cases with Bar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {marketData.trafficData.monthly[marketData.trafficData.monthly.length - 1].visitors.toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-600">Total Cases</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {Math.round(marketData.trafficData.monthly[marketData.trafficData.monthly.length - 1].visitors * 0.6).toLocaleString()} 6%↑
                    </div>
                  </div>
                </div>
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: ['HR Diversity', 'Integrity', 'Morale', 'Auditing', '3R'],
                      datasets: [{
                        data: [12900, 12400, 11300, 10900, 12800],
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: '#3B82F6',
                        borderWidth: 0,
                        borderRadius: 8
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Top Middle Card: Avg. Inspection Score */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">WASTE MANAGEMENT Avg. Inspection Score</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-blue-600">97.94%</div>
                  <div className="text-sm text-gray-600">5.6% to get 100%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '97.94%' }}></div>
                </div>
                <div className="text-sm text-gray-600 text-center">Apps + Photos</div>
              </div>

              {/* Top Right Card: Bar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="h-64">
                  <Bar 
                    data={{
                      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                      datasets: [
                        {
                          label: 'NTC Count',
                          data: [12300, 11800, 13200, 12800],
                          backgroundColor: 'rgba(59, 130, 246, 0.8)',
                          borderColor: '#3B82F6',
                          borderWidth: 0,
                          borderRadius: 8
                        },
                        {
                          label: 'LTI Count',
                          data: [9800, 10200, 9600, 10400],
                          backgroundColor: 'rgba(29, 78, 216, 0.8)',
                          borderColor: '#1D4ED8',
                          borderWidth: 0,
                          borderRadius: 8
                        },
                        {
                          label: 'Pen. Count',
                          data: [8700, 9200, 8900, 9400],
                          backgroundColor: 'rgba(96, 165, 250, 0.8)',
                          borderColor: '#60A5FA',
                          borderWidth: 0,
                          borderRadius: 8
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                        x: { grid: { display: false } }
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Middle Row - 2 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              {/* Middle Left Card: Work Accidents Frequency Rate */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">WORK ACCIDENTS FREQUENCY Rate 2022</h3>
                  <div className="text-sm text-gray-600">
                    {Math.round(marketData.trafficData.monthly[marketData.trafficData.monthly.length - 1].visitors * 0.6).toLocaleString()} 0%↑
                  </div>
                </div>
                <div className="h-80">
                  <Line 
                    data={{
                      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
                      datasets: [{
                        data: [28000, 32000, 29000, 35000, 31000, 38000, 34200, 36000, 33000, 37000, 35000],
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                        x: { grid: { color: 'rgba(0, 0, 0, 0.05)' } }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Middle Right Card: Market Share Pie Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Competitor Market Share Distribution</h3>
                <div className="h-80">
                  <MarketSharePieChart competitors={marketData.competitors} />
                </div>
              </div>
            </div>

            {/* Bottom Row - 2 Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              {/* Bottom Left Card: Risk Register */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">RISK REGISTER</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Insignificance</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Minor</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Moderate</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Major</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Extreme</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Total Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Rare</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center bg-blue-100 text-blue-600 font-bold rounded-lg">1</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">1-8%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Unlikely</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center bg-blue-200 text-blue-700 font-bold rounded-lg">1</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">3-23%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Possible</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">1</td>
                        <td className="py-3 px-4 text-center bg-blue-300 text-blue-800 font-bold rounded-lg">2</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">3-38%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Likely</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center bg-blue-400 text-blue-900 font-bold rounded-lg">1</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">4-23%</td>
                      </tr>
                      <tr className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium text-gray-900">Almost Certain</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-gray-600">0</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">5-8%</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="py-3 px-4 font-bold text-gray-900">Total Count</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">1-8%</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">2-23%</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">0-0%</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">3-31%</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-medium">12-100%</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-bold">12-100%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Right Card: Traffic Channels */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Traffic Channels</h3>
                <p className="text-sm text-gray-600 mb-6">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium.</p>
                <div className="grid grid-cols-8 gap-1 h-48">
                  {Array.from({ length: 48 }, (_, i) => {
                    const intensity = Math.random();
                    const blueShade = intensity > 0.7 ? 'bg-blue-600' : 
                                    intensity > 0.5 ? 'bg-blue-500' : 
                                    intensity > 0.3 ? 'bg-blue-400' : 
                                    intensity > 0.1 ? 'bg-blue-300' : 'bg-gray-100';
                    return (
                      <div 
                        key={i} 
                        className={`${blueShade} rounded-sm transition-all duration-200 hover:scale-110`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Additional Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
              <PerformanceMetricsChart performance={marketData.performance} />
              <DailyTrafficChart dailyData={marketData.trafficData.daily} />
            </div>

            {/* AI-Powered Market Analysis with Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">AI-Powered Market Analysis</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAnalysis({ preventDefault: () => {} })}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh All</span>
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                {[
                  { key: 'strengths', label: 'Key Strengths' },
                  { key: 'improvements', label: 'Areas of Improvement' },
                  { key: 'recommendations', label: 'Strategic Recommendations' },
                  { key: 'risks', label: 'Risk Factors' }
                ].map((tab) => (
                  <div key={tab.key} className="flex-1 relative">
                    <button
                      onClick={() => setActiveTab(tab.key)}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <span>{tab.label}</span>
                        {tabLoading[tab.key] && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                    </button>
                    {/* Refresh button for individual tab */}
                    {aiAnalysisData[tab.key] && aiAnalysisData[tab.key].length > 0 && (
                      <button
                        onClick={() => refreshTabAnalysis(tab.key)}
                        disabled={tabLoading[tab.key]}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center disabled:opacity-50"
                        title={`Refresh ${tab.label}`}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Last Updated Timestamp */}
              {lastUpdated && (
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                  <span>Last updated: {lastUpdated.toLocaleString()}</span>
                  <span className="text-blue-600">✓ Analysis Complete</span>
                </div>
              )}

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600 mb-2">Analyzing website data...</p>
                    <p className="text-sm text-gray-500">This may take a few moments</p>
                  </div>
                ) : (
                  renderTabContent()
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketAnalysis;

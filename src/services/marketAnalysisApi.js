// Market Analysis API Service
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAUnSI5NhvOFxiy4dI04ac1mnRdfsQbpBA';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Mock market data for demonstration (replace with real API calls)
export const getMarketData = async (website) => {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data structure - replace with actual API responses
    const mockData = {
      website: website,
      marketShare: Math.random() * 100,
      competitors: [
        { name: 'Competitor A', share: Math.random() * 30 },
        { name: 'Competitor B', share: Math.random() * 25 },
        { name: 'Competitor C', share: Math.random() * 20 },
        { name: 'Competitor D', share: Math.random() * 15 },
        { name: 'Others', share: Math.random() * 10 }
      ],
      trafficData: {
        monthly: [
          { month: 'Jan', visitors: Math.floor(Math.random() * 100000) + 50000 },
          { month: 'Feb', visitors: Math.floor(Math.random() * 100000) + 50000 },
          { month: 'Mar', visitors: Math.floor(Math.random() * 100000) + 50000 },
          { month: 'Apr', visitors: Math.floor(Math.random() * 100000) + 50000 },
          { month: 'May', visitors: Math.floor(Math.random() * 100000) + 50000 },
          { month: 'Jun', visitors: Math.floor(Math.random() * 100000) + 50000 }
        ],
        daily: Array.from({ length: 30 }, (_, i) => ({
          day: i + 1,
          visitors: Math.floor(Math.random() * 10000) + 2000
        }))
      },
      demographics: {
        ageGroups: [
          { age: '18-24', percentage: Math.random() * 30 },
          { age: '25-34', percentage: Math.random() * 35 },
          { age: '35-44', percentage: Math.random() * 25 },
          { age: '45+', percentage: Math.random() * 20 }
        ],
        locations: [
          { country: 'United States', percentage: Math.random() * 40 + 30 },
          { country: 'United Kingdom', percentage: Math.random() * 20 + 10 },
          { country: 'Canada', percentage: Math.random() * 15 + 8 },
          { country: 'Australia', percentage: Math.random() * 12 + 5 },
          { country: 'Others', percentage: Math.random() * 10 + 5 }
        ]
      },
      performance: {
        loadTime: Math.random() * 3 + 1,
        bounceRate: Math.random() * 40 + 20,
        conversionRate: Math.random() * 5 + 1,
        seoScore: Math.random() * 30 + 70
      }
    };

    return mockData;
  } catch (error) {
    console.error('Error fetching market data:', error);
    throw error;
  }
};

// Gemini AI Analysis
export const getGeminiAnalysis = async (website, marketData) => {
  try {
    const prompt = `Analyze the following market data for ${website} and provide insights:

Market Share: ${marketData.marketShare.toFixed(2)}%
Traffic: ${marketData.trafficData.monthly[marketData.trafficData.monthly.length - 1].visitors.toLocaleString()} monthly visitors
Performance: Load time ${marketData.performance.loadTime.toFixed(2)}s, SEO Score ${marketData.performance.seoScore.toFixed(0)}/100

Please provide:
1. Market position analysis
2. Key strengths and weaknesses
3. Competitive analysis
4. Growth opportunities
5. Strategic recommendations
6. Risk factors

Format the response in a structured way with clear sections.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error getting Gemini analysis:', error);
    // Fallback to mock analysis if API fails
    return `Market Analysis for ${website}:

Market Position: ${website} holds a ${marketData.marketShare.toFixed(2)}% market share, positioning it as a ${marketData.marketShare > 50 ? 'market leader' : marketData.marketShare > 25 ? 'strong competitor' : 'emerging player'} in the industry.

Key Strengths:
- Strong monthly traffic of ${marketData.trafficData.monthly[marketData.trafficData.monthly.length - 1].visitors.toLocaleString()} visitors
- Good SEO performance with a score of ${marketData.performance.seoScore.toFixed(0)}/100
- Competitive load time of ${marketData.performance.loadTime.toFixed(2)} seconds

Areas for Improvement:
- Bounce rate of ${marketData.performance.bounceRate.toFixed(1)}% could be optimized
- Conversion rate of ${marketData.performance.conversionRate.toFixed(2)}% has room for growth

Strategic Recommendations:
1. Implement A/B testing to improve conversion rates
2. Optimize user experience to reduce bounce rate
3. Focus on content marketing to increase organic traffic
4. Monitor competitor movements and adapt strategies accordingly

Risk Factors:
- Market competition is intense with multiple players
- Technology changes could impact performance metrics
- Economic factors may affect user behavior and spending`;
  }
};

// Real API endpoints (replace mock data with these)
export const getRealMarketData = async (website) => {
  // You can integrate with real APIs like:
  // - SimilarWeb API for traffic data
  // - SEMrush API for SEO analysis
  // - Google Analytics API for detailed metrics
  // - Social media APIs for engagement data
  
  try {
    // Example integration with external APIs
    const response = await fetch(`/api/market-analysis?website=${encodeURIComponent(website)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching real market data:', error);
    // Fallback to mock data
    return getMarketData(website);
  }
};

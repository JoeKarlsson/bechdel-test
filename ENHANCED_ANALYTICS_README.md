# Enhanced Analytics Feature

This feature adds advanced AI-powered analytics to the Bechdel Test application using Claude AI. It provides comprehensive analysis of gender representation in movie scripts beyond the basic Bechdel Test.

## Features

### 1. Script Optimization

- **Token Reduction**: Cleans and optimizes scripts to reduce token usage for AI analysis
- **Character Dialogue Extraction**: Efficiently extracts character dialogue from scripts
- **Scene Analysis**: Identifies key scenes for focused analysis

### 2. Advanced Analytics

#### Female Agency Analysis

- Tracks when female characters drive plot vs. react to male characters
- Analyzes female decision-making patterns
- Measures female character goal pursuit and agency

#### Stereotype Detection

- Identifies common female character tropes and stereotypes
- Detects character archetypes (damsel in distress, femme fatale, etc.)
- Analyzes problematic patterns in character representation

#### Intersectionality Analysis

- Considers race, age, class, sexuality, and other factors
- Analyzes representation diversity among female characters
- Detects tokenism vs. meaningful representation

#### Sentiment Analysis

- Analyzes emotional tone of male vs. female dialogue
- Compares emotional range and expression by gender
- Identifies stereotypical emotional patterns

#### Topic Modeling

- Analyzes what topics male vs. female characters discuss
- Identifies subject matter expertise by gender
- Measures topic diversity and conversation themes

#### Power Dynamics Analysis

- Tracks who interrupts whom
- Analyzes who asks questions vs. gives commands
- Measures speaking time and authority patterns

#### Vocabulary Analysis

- Compares word choices between genders
- Analyzes language complexity and sophistication
- Identifies emotional and professional vocabulary usage

#### Bias Detection

- AI-powered detection of subtle gender biases
- Identifies implicit biases in character descriptions
- Detects microaggressions and systemic bias patterns

#### Script Improvement Suggestions

- Provides specific recommendations for better gender representation
- Suggests character and dialogue improvements
- Offers scene and plot-level enhancement suggestions

#### Character Development Analysis

- Tracks character growth and agency over time
- Analyzes character arcs for female vs. male characters
- Measures character complexity and depth

## Installation

1. Install the required dependency:

```bash
npm install @anthropic-ai/sdk --legacy-peer-deps
```

2. Set up your Claude API key as an environment variable:

```bash
export CLAUDE_API_KEY="your-claude-api-key-here"
```

## Usage

### API Integration

The enhanced analytics are automatically triggered when a Claude API key is provided. You can pass the API key in two ways:

1. **Request Body**: Include `claudeApiKey` in the request body when uploading a script
2. **Header**: Include `X-Claude-Api-Key` header in the request

### Example API Request

```javascript
const formData = new FormData();
formData.append('script', scriptFile);
formData.append('claudeApiKey', 'your-claude-api-key');

fetch('/api/films', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Processing started:', data.processId);
  console.log('Enhanced analytics enabled:', data.enhancedAnalytics);
});
```

### Response Structure

When enhanced analytics are enabled, the response includes additional fields:

```javascript
{
  // Standard Bechdel Test results
  bechdelResults: { ... },
  
  // Enhanced analytics data
  enhancedAnalytics: {
    femaleAgency: { ... },
    stereotypes: { ... },
    intersectionality: { ... },
    sentiment: { ... },
    topics: { ... },
    powerDynamics: { ... },
    vocabulary: { ... },
    biasDetection: { ... },
    improvements: { ... },
    characterDevelopment: { ... },
    scriptOptimization: { ... }
  },
  
  // Summary metrics
  analyticsSummary: {
    overallScore: 8,
    keyMetrics: {
      femaleAgencyScore: 7,
      stereotypeScore: 3,
      diversityScore: 6,
      powerDynamicsScore: 8,
      biasScore: 2
    },
    recommendations: [ ... ]
  },
  
  // Metadata
  analysisMetadata: { ... }
}
```

## Database Schema

The enhanced analytics data is stored in the MongoDB database with the following structure:

```javascript
{
  // Existing film fields...
  
  enhancedAnalytics: {
    femaleAgency: Object,
    stereotypes: Object,
    intersectionality: Object,
    sentiment: Object,
    topics: Object,
    powerDynamics: Object,
    vocabulary: Object,
    biasDetection: Object,
    improvements: Object,
    characterDevelopment: Object,
    analysisTimestamp: String,
    scriptOptimization: {
      tokenReduction: {
        original: Number,
        cleaned: Number,
        condensed: Number,
        reductionPercentage: Number
      }
    },
    characterDialogue: [Object],
    keyScenes: [Object]
  },
  
  analyticsSummary: {
    overallScore: Number,
    keyMetrics: {
      femaleAgencyScore: Number,
      stereotypeScore: Number,
      diversityScore: Number,
      powerDynamicsScore: Number,
      biasScore: Number
    },
    recommendations: [String],
    tokenOptimization: Object
  },
  
  analysisMetadata: {
    analysisTimestamp: String,
    processId: String,
    scriptPath: String,
    characterCount: Number,
    femaleCharacterCount: Number,
    maleCharacterCount: Number
  }
}
```

## Testing

Run the test script to verify the implementation:

```bash
# Set your API key
export CLAUDE_API_KEY="your-claude-api-key"

# Run tests
node test-enhanced-analytics.js
```

## Error Handling

The enhanced analytics feature is designed to be resilient:

- If the Claude API fails, the system continues with basic Bechdel Test analysis
- API errors are logged but don't interrupt the main processing flow
- Failed analyses are marked with error flags for debugging

## Performance Considerations

- Script cleaning reduces token usage by 30-50% on average
- Claude API calls are made in parallel for different analysis types
- Results are cached in the database to avoid re-analysis
- Large scripts are automatically condensed for efficient processing

## Security

- API keys are not stored in the database
- API keys are only used for processing and then discarded
- All API communications use HTTPS
- Sensitive data is not logged

## Future Enhancements

- Batch processing for multiple scripts
- Custom analysis prompts
- Integration with other AI models
- Real-time analytics dashboard
- Comparative analysis across films
- Export functionality for analytics data

## Contributing

When contributing to this feature:

1. Ensure all new analysis types follow the established pattern
2. Add appropriate error handling and logging
3. Update tests when adding new functionality
4. Document any new API endpoints or data structures
5. Consider token usage and API costs in your implementation

## Troubleshooting

### Common Issues

1. **API Key Not Working**: Verify your Claude API key is valid and has sufficient credits
2. **Analysis Failing**: Check the console logs for specific error messages
3. **Slow Processing**: Large scripts may take several minutes to analyze
4. **Memory Issues**: Very large scripts may need to be split into smaller chunks

### Debug Mode

Enable debug logging by setting:

```bash
export DEBUG=enhanced-analytics
```

This will provide detailed logs of the analysis process.

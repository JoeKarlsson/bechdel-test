import React from 'react';
import AdvancedAnalytics from './AdvancedAnalytics';

// Sample enhanced analytics data for demonstration
const sampleEnhancedAnalytics = {
    femaleAgency: {
        agencyScore: 7,
        plotDrivingMoments: [
            "Sarah initiates the investigation into the missing evidence",
            "Maria confronts the antagonist directly",
            "Lisa makes the final decision to expose the truth"
        ],
        reactiveMoments: [
            "Sarah responds to the detective's questions",
            "Maria reacts to the news about her family"
        ],
        decisionMaking: "Female characters show strong decision-making patterns, often taking initiative in critical moments.",
        goalPursuit: "Female characters actively pursue their goals with determination and agency.",
        recommendations: "Consider giving female characters more opportunities to drive the plot forward independently."
    },
    stereotypes: {
        detectedStereotypes: ["Damsel in distress", "Supportive wife"],
        characterArchetypes: {
            "Sarah": "Strong female lead",
            "Maria": "Supportive friend",
            "Lisa": "Professional woman"
        },
        problematicPatterns: [
            "Female characters often need male validation",
            "Limited emotional range for female characters"
        ],
        stereotypeScore: 4,
        recommendations: "Work on developing more complex female characters with diverse motivations."
    },
    intersectionality: {
        diversityScore: 6,
        intersectionalAnalysis: "The film includes characters from different racial backgrounds but lacks representation in other areas.",
        representationGaps: [
            "Limited LGBTQ+ representation",
            "Age diversity could be improved"
        ],
        tokenismDetection: [
            "Single character representing entire community"
        ],
        recommendations: "Include more diverse perspectives and avoid tokenism."
    },
    sentiment: {
        maleSentimentAnalysis: "Male characters display a wide range of emotions including anger, determination, and vulnerability.",
        femaleSentimentAnalysis: "Female characters primarily show supportive and nurturing emotions.",
        sentimentComparison: "Male characters have broader emotional range compared to female characters.",
        emotionalRange: "Female characters could benefit from more diverse emotional expressions.",
        recommendations: "Give female characters more opportunities to express complex emotions."
    },
    topics: {
        maleTopics: ["Business", "Technology", "Politics", "Sports"],
        femaleTopics: ["Relationships", "Family", "Fashion", "Health"],
        topicDiversity: "Male characters discuss more professional topics while female characters focus on personal matters.",
        expertiseAreas: "Male characters are portrayed as experts in technical fields.",
        recommendations: "Balance topic distribution between genders."
    },
    powerDynamics: {
        interruptionPatterns: "Male characters interrupt female characters more frequently.",
        questionCommandAnalysis: "Male characters give more commands while female characters ask more questions.",
        speakingTimeAnalysis: "Male characters have significantly more speaking time.",
        authorityPatterns: "Authority figures are predominantly male.",
        powerDynamicsScore: 5,
        recommendations: "Create more balanced power dynamics between characters."
    },
    vocabulary: {
        maleVocabulary: "Male characters use more technical and assertive language.",
        femaleVocabulary: "Female characters use more emotional and supportive language.",
        vocabularyComparison: "Clear differences in language sophistication between genders.",
        emotionalLanguage: "Female characters use more emotional vocabulary.",
        professionalLanguage: "Male characters dominate professional terminology.",
        recommendations: "Balance vocabulary usage between genders."
    },
    biasDetection: {
        detectedBiases: [
            "Implicit assumption that women are naturally nurturing",
            "Stereotypical portrayal of female emotions"
        ],
        biasPatterns: "Subtle biases in character descriptions and dialogue.",
        microaggressions: [
            "Comments about women's appearance",
            "Assumptions about female capabilities"
        ],
        systemicBias: "Systemic bias in character development and plot progression.",
        biasScore: 6,
        recommendations: "Address implicit biases in character development."
    },
    improvements: {
        characterImprovements: "Develop more complex female characters with diverse backgrounds and motivations.",
        dialogueImprovements: "Balance dialogue distribution and give female characters more agency in conversations.",
        sceneImprovements: "Create scenes where female characters drive the action independently.",
        plotImprovements: "Include more female perspectives in the main plot.",
        overallRecommendations: "Focus on creating more balanced and diverse character representation.",
        implementationPriority: "High priority: Character development and dialogue balance."
    },
    characterDevelopment: {
        femaleCharacterArcs: "Female characters show limited growth throughout the story.",
        maleCharacterArcs: "Male characters have more complex development arcs.",
        developmentComparison: "Male characters have more opportunities for character growth.",
        growthPatterns: "Female characters' growth is often tied to male characters.",
        complexityAnalysis: "Female characters lack the complexity of their male counterparts.",
        recommendations: "Create more independent character arcs for female characters."
    },
    analysisTimestamp: new Date().toISOString()
};

const sampleCharacters = [
    { actorName: "Emma Stone", character: "Sarah", actorActress: "Actress" },
    { actorName: "Jennifer Lawrence", character: "Maria", actorActress: "Actress" },
    { actorName: "Amy Adams", character: "Lisa", actorActress: "Actress" },
    { actorName: "Ryan Gosling", character: "John", actorActress: "Actor" },
    { actorName: "Brad Pitt", character: "Mike", actorActress: "Actor" }
];

const AdvancedAnalyticsDemo = () => {
    return (
        <div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
                Advanced AI Analytics Demo
            </h1>
            <AdvancedAnalytics
                enhancedAnalytics={sampleEnhancedAnalytics}
                characters={sampleCharacters}
            />
        </div>
    );
};

export default AdvancedAnalyticsDemo;

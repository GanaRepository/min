import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Factor {
  score?: number;
  analysis: string;
}

interface Assessment42Factor {
  overallScore: number;
  status: string;
  statusMessage: string;
  allFactors: {
    // Core Writing Mechanics (1-6)
    grammarSyntax?: Factor;
    vocabularyRange?: Factor;
    spellingPunctuation?: Factor;
    sentenceStructure?: Factor;
    tenseConsistency?: Factor;
    voiceTone?: Factor;

    // Story Elements (7-12)
    plotDevelopmentPacing?: Factor;
    characterDevelopment?: Factor;
    settingWorldBuilding?: Factor;
    dialogueQuality?: Factor;
    themeRecognition?: Factor;
    conflictResolution?: Factor;

    // Creative Skills (13-18)
    originalityCreativity?: Factor;
    imageryDescriptiveWriting?: Factor;
    sensoryDetailsUsage?: Factor;
    metaphorFigurativeLanguage?: Factor;
    emotionalDepth?: Factor;
    showVsTellBalance?: Factor;

    // Structure & Organization (19-23)
    storyArcCompletion?: Factor;
    paragraphOrganization?: Factor;
    transitionsBetweenIdeas?: Factor;
    openingClosingEffectiveness?: Factor;
    logicalFlow?: Factor;

    // Advanced Elements (24-28)
    foreshadowing?: Factor;
    symbolismRecognition?: Factor;
    pointOfViewConsistency?: Factor;
    moodAtmosphereCreation?: Factor;
    culturalSensitivity?: Factor;

    // AI Detection (29-32)
    writingPatternAnalysis?: Factor;
    authenticityMarkers?: Factor;
    ageAppropriateLanguage?: Factor;
    personalVoiceRecognition?: Factor;

    // Educational Feedback (33-42)
    strengthsIdentification?: Factor;
    areasForImprovement?: Factor;
    gradeLevelAssessment?: Factor;
    readingLevelEvaluation?: Factor;
    teachersHolisticAssessment?: Factor;
    personalizedLearningPath?: Factor;
    practiceExerciseRecommendations?: Factor;
    genreExplorationSuggestions?: Factor;
    vocabularyBuildingExercises?: Factor;
    grammarFocusAreas?: Factor;
  };
  aiDetectionResult?: {
    result: string;
    confidenceLevel: number;
    analysis: string;
  };
}

interface Props {
  assessment: Assessment42Factor;
  storyId: string;
  storyTitle: string;
}

const Comprehensive42FactorAssessment: React.FC<Props> = ({
  assessment,
  storyId,
  storyTitle,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['overview'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 80) return 'bg-blue-50 border-blue-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    if (score >= 60) return 'bg-orange-50 border-orange-200';
    return 'bg-red-50 border-red-200';
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'Approved')
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'Flagged')
      return <XCircle className="h-5 w-5 text-red-600" />;
    return <AlertCircle className="h-5 w-5 text-yellow-600" />;
  };

  const FactorCard = ({ name, factor }: { name: string; factor: Factor }) => (
    <div className="bg-white rounded-lg border p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{name}</h4>
        {factor.score !== undefined && (
          <span className={`font-bold text-lg ${getScoreColor(factor.score)}`}>
            {factor.score}%
          </span>
        )}
      </div>
      <p className="text-gray-700 text-sm leading-relaxed">{factor.analysis}</p>
    </div>
  );

  const SectionHeader = ({
    title,
    isExpanded,
    onToggle,
  }: {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
  }) => (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {isExpanded ? (
        <ChevronUp className="h-5 w-5" />
      ) : (
        <ChevronDown className="h-5 w-5" />
      )}
    </button>
  );

  const factorSections = [
    {
      id: 'core-mechanics',
      title: 'Core Writing Mechanics (Factors 1-6)',
      factors: [
        { key: 'grammarSyntax', name: '1. Grammar & Syntax' },
        {
          key: 'vocabularyRange',
          name: '2. Vocabulary Range & Appropriateness',
        },
        { key: 'spellingPunctuation', name: '3. Spelling & Punctuation' },
        { key: 'sentenceStructure', name: '4. Sentence Structure Variety' },
        { key: 'tenseConsistency', name: '5. Tense Consistency' },
        { key: 'voiceTone', name: '6. Voice & Tone' },
      ],
    },
    {
      id: 'story-elements',
      title: 'Story Elements (Factors 7-12)',
      factors: [
        { key: 'plotDevelopmentPacing', name: '7. Plot Development & Pacing' },
        {
          key: 'characterDevelopment',
          name: '8. Character Development & Consistency',
        },
        { key: 'settingWorldBuilding', name: '9. Setting & World-building' },
        { key: 'dialogueQuality', name: '10. Dialogue Quality' },
        {
          key: 'themeRecognition',
          name: '11. Theme Recognition & Development',
        },
        { key: 'conflictResolution', name: '12. Conflict Resolution' },
      ],
    },
    {
      id: 'creative-skills',
      title: 'Creative & Literary Skills (Factors 13-18)',
      factors: [
        { key: 'originalityCreativity', name: '13. Originality & Creativity' },
        {
          key: 'imageryDescriptiveWriting',
          name: '14. Imagery & Descriptive Writing',
        },
        { key: 'sensoryDetailsUsage', name: '15. Sensory Details Usage' },
        {
          key: 'metaphorFigurativeLanguage',
          name: '16. Metaphor & Figurative Language',
        },
        { key: 'emotionalDepth', name: '17. Emotional Depth' },
        { key: 'showVsTellBalance', name: '18. Show vs Tell Balance' },
      ],
    },
    {
      id: 'structure-org',
      title: 'Structure & Organization (Factors 19-23)',
      factors: [
        { key: 'storyArcCompletion', name: '19. Story Arc Completion' },
        { key: 'paragraphOrganization', name: '20. Paragraph Organization' },
        {
          key: 'transitionsBetweenIdeas',
          name: '21. Transitions Between Ideas',
        },
        {
          key: 'openingClosingEffectiveness',
          name: '22. Opening & Closing Effectiveness',
        },
        { key: 'logicalFlow', name: '23. Logical Flow' },
      ],
    },
    {
      id: 'advanced-elements',
      title: 'Advanced Elements (Factors 24-28)',
      factors: [
        { key: 'foreshadowing', name: '24. Foreshadowing' },
        { key: 'symbolismRecognition', name: '25. Symbolism Recognition' },
        {
          key: 'pointOfViewConsistency',
          name: '26. Point of View Consistency',
        },
        {
          key: 'moodAtmosphereCreation',
          name: '27. Mood & Atmosphere Creation',
        },
        {
          key: 'culturalSensitivity',
          name: '28. Cultural Sensitivity & Awareness',
        },
      ],
    },
    {
      id: 'ai-detection',
      title: 'AI Detection Analysis (Factors 29-32)',
      factors: [
        { key: 'writingPatternAnalysis', name: '29. Writing Pattern Analysis' },
        { key: 'authenticityMarkers', name: '30. Authenticity Markers' },
        {
          key: 'ageAppropriateLanguage',
          name: '31. Age-Appropriate Language Use',
        },
        {
          key: 'personalVoiceRecognition',
          name: '32. Personal Voice Recognition',
        },
      ],
    },
    {
      id: 'educational-feedback',
      title: 'Educational Feedback (Factors 33-42)',
      factors: [
        {
          key: 'strengthsIdentification',
          name: '33. Strengths Identification',
        },
        { key: 'areasForImprovement', name: '34. Areas for Improvement' },
        { key: 'gradeLevelAssessment', name: '35. Grade-Level Assessment' },
        { key: 'readingLevelEvaluation', name: '36. Reading Level Evaluation' },
        {
          key: 'teachersHolisticAssessment',
          name: "37. Teacher's Holistic Assessment",
        },
        {
          key: 'personalizedLearningPath',
          name: '38. Personalized Learning Path',
        },
        {
          key: 'practiceExerciseRecommendations',
          name: '39. Practice Exercise Recommendations',
        },
        {
          key: 'genreExplorationSuggestions',
          name: '40. Genre Exploration Suggestions',
        },
        {
          key: 'vocabularyBuildingExercises',
          name: '41. Vocabulary Building Exercises',
        },
        { key: 'grammarFocusAreas', name: '42. Grammar Focus Areas' },
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Comprehensive 42-Factor Assessment
        </h1>
        <h2 className="text-xl text-gray-600 mb-4">{storyTitle}</h2>

        {/* Download Buttons */}
        <div className="flex gap-3 mb-6">
          <a
            href={`/api/stories/export/${storyId}/pdf`}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF Report
          </a>
          <a
            href={`/api/stories/export/${storyId}/word`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Word Document
          </a>
        </div>
      </div>

      {/* Overview Section */}
      <div className="mb-6">
        <SectionHeader
          title="Assessment Overview"
          isExpanded={expandedSections.has('overview')}
          onToggle={() => toggleSection('overview')}
        />

        {expandedSections.has('overview') && (
          <div className="mt-4 space-y-4">
            <div
              className={`p-6 rounded-lg border-2 ${getScoreBgColor(assessment.overallScore)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <StatusIcon status={assessment.status} />
                  <span className="text-2xl font-bold text-gray-900">
                    Overall Score
                  </span>
                </div>
                <span
                  className={`text-4xl font-bold ${getScoreColor(assessment.overallScore)}`}
                >
                  {assessment.overallScore}%
                </span>
              </div>
              <p className="text-gray-700 mb-2">
                <strong>Status:</strong> {assessment.status}
              </p>
              <p className="text-gray-700">{assessment.statusMessage}</p>
            </div>

            {/* AI Detection Result */}
            {assessment.aiDetectionResult && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Authenticity Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Detection Result</p>
                    <p
                      className={`font-bold text-lg ${
                        assessment.aiDetectionResult.result === 'Human-written'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {assessment.aiDetectionResult.result}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Confidence Level</p>
                    <p className="font-bold text-lg text-gray-900">
                      {Math.round(
                        assessment.aiDetectionResult.confidenceLevel * 100
                      )}
                      %
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-gray-700 text-sm">
                  {assessment.aiDetectionResult.analysis}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Factor Sections */}
      {factorSections.map((section) => (
        <div key={section.id} className="mb-6">
          <SectionHeader
            title={section.title}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />

          {expandedSections.has(section.id) && (
            <div className="mt-4 space-y-3">
              {section.factors.map((factor) => {
                const factorData =
                  assessment.allFactors[
                    factor.key as keyof typeof assessment.allFactors
                  ];
                if (!factorData) return null;

                return (
                  <FactorCard
                    key={factor.key}
                    name={factor.name}
                    factor={factorData}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Comprehensive42FactorAssessment;

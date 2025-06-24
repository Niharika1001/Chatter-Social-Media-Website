import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GraduationCap, Heart, Zap, AlertTriangle, BookOpen, Briefcase, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const QualificationForm: React.FC = () => {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { addSuggestion } = useAuth();

  const [formData, setFormData] = useState({
    interests: '',
    strengths: '',
    fears: '',
    fieldOfStudy: '',
    preferredJobType: '',
    additionalInfo: ''
  });

  const [interestTags, setInterestTags] = useState<string[]>([]);
  const [strengthTags, setStrengthTags] = useState<string[]>([]);
  const [fearTags, setFearTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const commonInterests = [
    'Technology', 'Arts', 'Science', 'Sports', 'Music', 'Writing', 'Design', 'Business',
    'Healthcare', 'Education', 'Environment', 'Social Work', 'Finance', 'Engineering'
  ];

  const commonStrengths = [
    'Leadership', 'Communication', 'Problem Solving', 'Creativity', 'Teamwork', 'Analysis',
    'Organization', 'Technical Skills', 'Public Speaking', 'Research', 'Innovation', 'Empathy'
  ];

  const commonFears = [
    'Public Speaking', 'Job Security', 'Work-Life Balance', 'Financial Stability', 'Competition',
    'Technology Changes', 'Networking', 'Decision Making', 'Time Management', 'Stress'
  ];

  const handleTagToggle = (tag: string, currentTags: string[], setTags: (tags: string[]) => void) => {
    if (currentTags.includes(tag)) {
      setTags(currentTags.filter(t => t !== tag));
    } else {
      setTags([...currentTags, tag]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const generateAISuggestion = async (): Promise<string> => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const apiUrl = import.meta.env.VITE_OPENROUTER_API_URL;

    if (!apiKey) {
      console.warn('OpenRouter API key not found, using mock response');
      return generateMockResponse();
    }

    const levelContext = {
      '10th': 'student completing 10th grade',
      '12th': 'student completing 12th grade',
      'graduate': 'college graduate',
      'postgraduate': 'post-graduate student'
    };

    const prompt = `As a professional career advisor, provide personalized career guidance for a ${levelContext[level as keyof typeof levelContext] || 'student'} with the following profile:

**Interests:** ${interestTags.join(', ')}
**Strengths:** ${strengthTags.join(', ')}
**Concerns:** ${fearTags.join(', ')}
${formData.fieldOfStudy ? `**Field of Study:** ${formData.fieldOfStudy}` : ''}
${formData.preferredJobType ? `**Preferred Job Type:** ${formData.preferredJobType}` : ''}

Please provide:
1. 3-5 specific career paths that align with their interests and strengths
2. How their strengths can be leveraged in these careers
3. Practical advice for addressing their concerns
4. Concrete next steps they can take
5. Skills they should develop

Format the response in a clear, encouraging, and actionable manner.`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CareerVice AI Career Advisor'
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional career advisor with expertise in guiding students and professionals toward fulfilling career paths. Provide practical, encouraging, and actionable career advice.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Unable to generate career suggestion at this time.';
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      return generateMockResponse();
    }
  };

  const generateMockResponse = (): string => {
    const levelContext = {
      '10th': 'student completing 10th grade',
      '12th': 'student completing 12th grade',
      'graduate': 'college graduate',
      'postgraduate': 'post-graduate student'
    };

    return `Based on your profile as a ${levelContext[level as keyof typeof levelContext] || 'student'}, here are personalized career suggestions:

**Career Paths to Consider:**
${interestTags.includes('Technology') ? '• Software Development, Data Science, Cybersecurity\n' : ''}
${interestTags.includes('Healthcare') ? '• Medicine, Nursing, Healthcare Administration\n' : ''}
${interestTags.includes('Business') ? '• Management, Marketing, Entrepreneurship\n' : ''}
${interestTags.includes('Arts') ? '• Graphic Design, Content Creation, Art Direction\n' : ''}

**Your Strengths Align With:**
${strengthTags.map(s => `• ${s} roles in your field of interest`).join('\n')}

**Development Areas:**
• Address concerns about ${fearTags.join(', ')} through targeted skill development
• Consider internships or mentorship in your areas of interest

**Next Steps:**
1. Explore specific roles in ${formData.fieldOfStudy || 'your field of interest'}
2. Build relevant skills through courses and projects
3. Network with professionals in your target industries
4. Consider ${formData.preferredJobType || 'various job types'} opportunities

**Personalized Advice:**
Given your interests in ${interestTags.join(', ')} and strengths in ${strengthTags.join(', ')}, focus on roles that combine these elements. Start with entry-level positions or internships to gain experience.`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const aiResponse = await generateAISuggestion();
      
      const suggestion = addSuggestion({
        level: level || '',
        interests: interestTags,
        strengths: strengthTags,
        fears: fearTags,
        fieldOfStudy: formData.fieldOfStudy,
        preferredJobType: formData.preferredJobType,
        aiResponse
      });

      navigate('/result', { state: { suggestion } });
    } catch (error) {
      console.error('Error generating suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelTitle = () => {
    const titles = {
      '10th': '10th Grade Career Form',
      '12th': '12th Grade Career Form',
      'graduate': 'Graduate Career Form',
      'postgraduate': 'Post Graduate Career Form'
    };
    return titles[level as keyof typeof titles] || 'Career Form';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">{getLevelTitle()}</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Help us understand your preferences to provide personalized career guidance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Interests Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Interests</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">Select areas that genuinely interest you:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commonInterests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleTagToggle(interest, interestTags, setInterestTags)}
                  className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                    interestTags.includes(interest)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:bg-blue-50'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Strengths Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-gray-900">Strengths</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">What are you naturally good at?</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {commonStrengths.map(strength => (
                <button
                  key={strength}
                  type="button"
                  onClick={() => handleTagToggle(strength, strengthTags, setStrengthTags)}
                  className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                    strengthTags.includes(strength)
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-600 hover:bg-green-50'
                  }`}
                >
                  {strength}
                </button>
              ))}
            </div>
          </div>

          {/* Fears/Concerns Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">Concerns</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">What aspects of work worry you?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {commonFears.map(fear => (
                <button
                  key={fear}
                  type="button"
                  onClick={() => handleTagToggle(fear, fearTags, setFearTags)}
                  className={`p-3 text-sm rounded-lg border transition-all duration-200 ${
                    fearTags.includes(fear)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500 hover:bg-orange-50'
                  }`}
                >
                  {fear}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700">
                  Field of Study (if applicable)
                </label>
              </div>
              <input
                type="text"
                id="fieldOfStudy"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="e.g., Computer Science, Biology, Commerce"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Briefcase className="h-5 w-5 text-purple-500" />
                <label htmlFor="preferredJobType" className="block text-sm font-medium text-gray-700">
                  Preferred Job Type
                </label>
              </div>
              <select
                id="preferredJobType"
                name="preferredJobType"
                value={formData.preferredJobType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select job type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="freelance">Freelance</option>
                <option value="remote">Remote</option>
                <option value="startup">Startup</option>
                <option value="corporate">Corporate</option>
                <option value="government">Government</option>
                <option value="non-profit">Non-profit</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading || interestTags.length === 0 || strengthTags.length === 0}
              className="flex items-center space-x-2 bg-primary text-white px-8 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Send className="h-5 w-5" />
              <span>{loading ? 'Generating Suggestions...' : 'Get AI Career Advice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QualificationForm;
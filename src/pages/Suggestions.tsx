import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Brain, Calendar, User, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Suggestions: React.FC = () => {
  const { getSuggestions } = useAuth();
  const suggestions = getSuggestions();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (suggestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Previous Suggestions</h1>
            </div>
            <p className="text-gray-600 mt-2">Your career advice history</p>
          </div>
          
          <div className="p-12 text-center">
            <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Suggestions Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't received any career suggestions yet. Complete a qualification form to get your first AI-powered career advice.
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5" />
              <span>Get Your First Suggestion</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Previous Suggestions</h1>
            </div>
            <p className="text-gray-600 mt-2">
              You have {suggestions.length} career suggestion{suggestions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>New Suggestion</span>
          </Link>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-primary bg-opacity-10 rounded-lg p-2">
                      <Brain className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">
                        {suggestion.level} Level Career Advice
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(suggestion.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/result"
                  state={{ suggestion }}
                  className="flex items-center space-x-1 text-primary hover:text-blue-700 transition-colors duration-200"
                >
                  <span className="text-sm font-medium">View Full</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Profile Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.interests.slice(0, 3).map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                    {suggestion.interests.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{suggestion.interests.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Strengths</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.strengths.slice(0, 3).map((strength, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {strength}
                      </span>
                    ))}
                    {suggestion.strengths.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{suggestion.strengths.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Field of Study</p>
                  <p className="text-sm text-gray-800">
                    {suggestion.fieldOfStudy || 'Not specified'}
                  </p>
                </div>
              </div>

              {/* AI Response Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-sm text-gray-600 mb-2 font-medium">AI Career Advice:</p>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {truncateText(suggestion.aiResponse, 200)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl p-6 text-white text-center">
        <h2 className="text-lg font-semibold mb-2">Ready for More Career Guidance?</h2>
        <p className="text-blue-100 mb-4">
          Get another personalized suggestion to explore different career paths
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
        >
          <Plus className="h-5 w-5" />
          <span>Get New Suggestion</span>
        </Link>
      </div>
    </div>
  );
};

export default Suggestions;
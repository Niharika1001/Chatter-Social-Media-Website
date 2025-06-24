import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, Clock, ArrowRight, GraduationCap, Briefcase, Target, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user, getLastSuggestion } = useAuth();
  const lastSuggestion = getLastSuggestion();

  const qualificationLevels = [
    { level: '10th', title: '10th Grade', description: 'For students completing 10th grade', icon: GraduationCap },
    { level: '12th', title: '12th Grade', description: 'For students completing 12th grade', icon: GraduationCap },
    { level: 'graduate', title: 'Graduate', description: 'For college graduates', icon: Briefcase },
    { level: 'postgraduate', title: 'Post Graduate', description: 'For post-graduate students', icon: Target }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.fullName || 'User'}!
            </h1>
            <p className="text-gray-600">Ready to explore your career path?</p>
          </div>
        </div>
      </div>

      {/* Last Suggestion */}
      {lastSuggestion && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Your Latest Career Suggestion</h2>
              </div>
              <div className="bg-white rounded-lg p-4 mb-4">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {lastSuggestion.aiResponse.substring(0, 200)}...
                </p>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span>Level: {lastSuggestion.level}</span>
                <span className="mx-2">•</span>
                <span>{new Date(lastSuggestion.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <Link
              to="/result"
              className="flex items-center space-x-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
            >
              <span>View Full</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Get New Suggestion */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">Get New Career Suggestion</h2>
          </div>
          <p className="text-gray-600 mt-2">
            Choose your education level to get personalized career advice from our AI advisor.
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualificationLevels.map((qual) => {
              const Icon = qual.icon;
              return (
                <Link
                  key={qual.level}
                  to={`/qualification/${qual.level}`}
                  className="group flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-gray-600 group-hover:text-primary transition-colors duration-200" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors duration-200">
                      {qual.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{qual.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/profile"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Complete Profile</h3>
              <p className="text-sm text-gray-600">Update your information</p>
            </div>
          </div>
        </Link>
        
        <Link
          to="/suggestions"
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 rounded-lg p-2">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">View History</h3>
              <p className="text-sm text-gray-600">See past suggestions</p>
            </div>
          </div>
        </Link>

        <div className="bg-gradient-to-r from-primary to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-2">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-medium">AI Powered</h3>
              <p className="text-sm opacity-90">Smart career guidance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
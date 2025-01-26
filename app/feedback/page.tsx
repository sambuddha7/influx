'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const UserFeedbackPage = () => {
  const [user] = useAuthState(auth);
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [feedbackData, setFeedbackData] = useState({
    overallSatisfaction: '',
    usabilityRating: '',
    improvements: '',
    wouldRecommend: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFeedbackData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to submit feedback.');
      return;
    }

    setIsSaving(true);
    try {
      const userFeedbackDoc = doc(collection(db, 'user-feedback'), user.uid);
      await setDoc(userFeedbackDoc, {
        ...feedbackData,
        timestamp: new Date(),
        userEmail: user.email
      });

      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
    } catch (error) {
      console.error('Error saving feedback: ', error);
      alert('Failed to submit feedback.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-200">
              User Experience Feedback
            </h1>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`
                flex items-center px-6 py-3 rounded-xl font-medium
                transition-all duration-200 
                ${isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 hover:shadow-lg'
                }
                text-white
              `}
            >
              {isSaving ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>

          <div className="dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-medium dark:text-slate-200 text-black block mb-2">
                Overall Satisfaction
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'].map(level => (
                  <label key={level} className="inline-flex items-center justify-center w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                    <input
                      type="radio"
                      name="overallSatisfaction"
                      value={level}
                      checked={feedbackData.overallSatisfaction === level}
                      onChange={handleChange}
                      className="form-radio text-blue-600 mr-2"
                    />
                    <span className="dark:text-slate-300 text-center">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="improvements" className="text-sm font-medium dark:text-slate-200 text-black">
                Suggestions for Improvement
              </label>
              <textarea
                id="improvements"
                name="improvements"
                value={feedbackData.improvements}
                onChange={handleChange}
                placeholder="What features would you like to see added or improved?"
                className="w-full px-4 py-3 rounded-lg dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-slate-200 dark:placeholder:text-slate-400 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 min-h-[120px] resize-y"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="wouldRecommend" className="text-sm font-medium dark:text-slate-200 text-black">
                Likelihood to Recommend
              </label>
              <select
                id="wouldRecommend"
                name="wouldRecommend"
                value={feedbackData.wouldRecommend}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
              >
                <option value="">Select Recommendation Likelihood</option>
                <option value="Definitely">Definitely Would Recommend</option>
                <option value="Probably">Probably Would Recommend</option>
                <option value="Unsure">Unsure</option>
                <option value="Probably Not">Probably Would Not Recommend</option>
                <option value="Definitely Not">Definitely Would Not Recommend</option>
              </select>
            </div>
          </div>

          {showAlert && (
            <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
              <div className="alert alert-success shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white">Feedback submitted successfully!</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserFeedbackPage;
'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const UserInputPage = () => {
  const [user] = useAuthState(auth);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    postAs: '',
    sampleReply: '',
    painPoints: '',
    marketingGoals: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const userDoc = doc(collection(db, 'ai-training'), user.uid);
        const docSnap = await getDoc(userDoc);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            postAs: data.postAs || '',
            sampleReply: data.sampleReply || '',
            painPoints: data.painPoints || '',
            marketingGoals: data.marketingGoals || '',
          });
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (user) {
        const userDoc = doc(collection(db, 'ai-training'), user.uid);
        await setDoc(userDoc, formData);
        alert('Data saved successfully!');
      } else {
        alert('No user is signed in.');
      }
    } catch (error) {
      console.error('Error saving data: ', error);
      alert('Failed to save data.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-lg text-gray-600 dark:text-gray-300">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-200">
              AI Training Configuration
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
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>

          <div className="dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="postAs" className="text-sm font-medium dark:text-slate-200 text-black">
                    Posting Identity
                  </label>
                  <input
                    id="postAs"
                    name="postAs"
                    value={formData.postAs}
                    onChange={handleChange}
                    placeholder="Enter role or persona"
                    className="w-full px-4 py-3 rounded-lg dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-slate-200 dark:placeholder:text-slate-400 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="sampleReply" className="text-sm font-medium dark:text-slate-200 text-black">
                    Sample Responses
                  </label>
                  <textarea
                    id="sampleReply"
                    name="sampleReply"
                    value={formData.sampleReply}
                    onChange={handleChange}
                    placeholder="Enter sample replies for AI to learn from"
                    className="w-full px-4 py-3 rounded-lg dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-slate-200 dark:placeholder:text-slate-400 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 min-h-[200px] resize-y"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="painPoints" className="text-sm font-medium dark:text-slate-200 text-black">
                    Target Pain Points
                  </label>
                  <textarea
                    id="painPoints"
                    name="painPoints"
                    value={formData.painPoints}
                    onChange={handleChange}
                    placeholder="Describe key pain points to address"
                    className="w-full px-4 py-3 rounded-lg dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-slate-200 dark:placeholder:text-slate-400 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 min-h-[120px] resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="marketingGoals" className="text-sm font-medium dark:text-slate-200 text-black">
                    Marketing Objectives
                  </label>
                  <textarea
                    id="marketingGoals"
                    name="marketingGoals"
                    value={formData.marketingGoals}
                    onChange={handleChange}
                    placeholder="Define your marketing goals and targets"
                    className="w-full px-4 py-3 rounded-lg dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 text-slate-200 dark:placeholder:text-slate-400 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 min-h-[120px] resize-y"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserInputPage;
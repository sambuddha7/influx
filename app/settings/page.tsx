'use client';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Sidebar from '@/components/Sidebar';
import Loading from '@/components/Loading';
import { Building2, Globe, FileText, MapPin, Package, Users, Mail, Save, LucideIcon } from 'lucide-react';


interface UserData {
  companyDescription: string;
  companyName: string;
  companyWebsite: string;
  countryRegion: string;
  email: string;
  product: string;
  targetAudience: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  icon: LucideIcon;
  disabled?: boolean;
  isTextArea?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = "text", 
  icon: Icon,
  disabled = false,
  isTextArea = false 
}) => (
  <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      <Icon className="w-4 h-4 mr-2 text-gray-500" />
      {label}
    </label>
    {isTextArea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        rows={3}
        disabled={disabled}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
    )}
  </div>
);

const Settings: React.FC = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userRef = doc(db, 'onboarding', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data() as UserData);
        } else {
          console.error('No user data found!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!user || !userData) return;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'onboarding', user.uid);
      await setDoc(userRef, userData, { merge: true });

      alert('User information updated successfully!');
    } catch (error) {
      console.error('Error updating user data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  if (!userData) {
    return <div>Error: Unable to load user data.</div>;
  }

  return (
    <div className="flex min-h-screen bg-inherit">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`
                flex items-center px-6 py-3 rounded-xl font-medium
                transition-all duration-200 
                ${isSaving 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }
                text-white
              `}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid gap-6">
            <FormField
              label="Company Name"
              name="companyName"
              value={userData.companyName}
              onChange={handleInputChange}
              icon={Building2}
            />

            <FormField
              label="Company Website"
              name="companyWebsite"
              value={userData.companyWebsite}
              onChange={handleInputChange}
              icon={Globe}
            />

            <FormField
              label="Company Description"
              name="companyDescription"
              value={userData.companyDescription}
              onChange={handleInputChange}
              icon={FileText}
              isTextArea
            />

            <FormField
              label="Country/Region"
              name="countryRegion"
              value={userData.countryRegion}
              onChange={handleInputChange}
              icon={MapPin}
            />

            <FormField
              label="Product"
              name="product"
              value={userData.product}
              onChange={handleInputChange}
              icon={Package}
            />

            <FormField
              label="Target Audience"
              name="targetAudience"
              value={userData.targetAudience}
              onChange={handleInputChange}
              icon={Users}
            />

            <FormField
              label="Email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              type="email"
              icon={Mail}
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

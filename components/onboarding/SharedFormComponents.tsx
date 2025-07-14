// components/onboarding/SharedFormComponents.tsx
import React from 'react';

export const FormInput = ({ label, name, value, onChange, required = false, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition duration-200"
    />
  </div>
);

export const FormTextArea = ({ label, name, value, onChange, required = false }: any) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={4}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition duration-200 resize-none"
    />
  </div>
);

export const Button = ({ onClick, className = "", children, disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-2 rounded-lg transition duration-200 ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);
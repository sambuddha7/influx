// components/onboarding/SharedFormComponents.tsx
import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}

interface FormTextAreaProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}

interface ButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export const FormInput = ({ label, name, value, onChange, required = false, type = "text" }: FormInputProps) => (
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

export const FormTextArea = ({ label, name, value, onChange, required = false }: FormTextAreaProps) => (
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

export const Button = ({ onClick, className = "", children, disabled = false }: ButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-2 rounded-lg transition duration-200 ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);
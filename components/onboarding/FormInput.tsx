// components/onboarding/FormInput.tsx
interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FormInput({ label, name, type = "text", value, required, onChange }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label} {required && '*'}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
        required={required}
      />
    </div>
  );
}
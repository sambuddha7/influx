// components/onboarding/FormTextArea.tsx
interface FormTextAreaProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function FormTextArea({ label, name, value, required, rows = 4, onChange }: FormTextAreaProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label} {required && '*'}</label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
        rows={rows}
        required={required}
      />
    </div>
  );
}
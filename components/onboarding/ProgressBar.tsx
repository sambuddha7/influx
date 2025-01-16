// components/onboarding/ProgressBar.tsx
interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
}

export function ProgressBar({ currentPage, totalPages }: ProgressBarProps) {
  return (
    <div className="text-center">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Step {currentPage} of {totalPages}
      </div>
      <div className="mt-2">
        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div 
            className="h-2 bg-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
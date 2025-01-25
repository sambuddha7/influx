export default function Layout({ children }: { children: React.ReactNode }) {
  return (
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
              <span className="bg-gray-100 dark:bg-zinc-800 text-xs font-semibold 
                  px-2 py-1 rounded-full border border-gray-200 dark:border-zinc-700 
                  text-gray-600 dark:text-gray-300">
                  Beta
              </span>
          </div>
          <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
              {children}
          </div>
      </div>
  );
}

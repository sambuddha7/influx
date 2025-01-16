


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
    
    

    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden dark:bg-dot-white/[0.2] bg-dot-black/[0.2]">
    <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
      
      {children}
    </div>
  </div>
    );
  }
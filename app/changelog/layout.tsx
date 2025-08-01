 


// export default function Layout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
//       <div className="w-full flex-none md:w-64">
//       </div>
//       <div className="flex-grow p-6 md:overflow-y-auto md:p-12">

//         {children}

//         </div>
//     </div>
//   );
// }
// app/changelog/layout.tsx
import LogoutButton from '@/components/auth/LogoutButton';

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
}
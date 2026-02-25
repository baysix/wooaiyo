import BottomNav from '@/components/layout/bottom-nav';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

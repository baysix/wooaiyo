import BottomNav from '@/components/layout/bottom-nav';
import ScrollArea from '@/components/layout/scroll-area';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      <ScrollArea>
        {children}
      </ScrollArea>
      <BottomNav />
    </div>
  );
}

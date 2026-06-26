'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNav from './BottomNav';
import ChatBot from '@/components/chat/ChatBot';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarW = collapsed ? 68 : 228;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#FAFAF8' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="main-content" style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        marginLeft: sidebarW,
        overflow: 'hidden',
        transition: 'margin-left 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <TopBar />
        <main className="page-padding" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
          {children}
        </main>
      </div>
      <BottomNav />
      <ChatBot />
    </div>
  );
}

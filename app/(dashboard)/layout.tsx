'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  Sparkles,
  Menu,
  X,
  Settings,
  ArrowLeftRight,
} from 'lucide-react';
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Wallet, label: 'Contas', href: '/contas' },
  { icon: CreditCard, label: 'Cartões', href: '/cartoes' },
  { icon: ArrowLeftRight, label: 'Transações', href: '/transacoes' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Finanças IA</h1>
          <p className="text-xs text-slate-400">OpenAI Powered</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-3 px-3 text-xs font-medium uppercase tracking-widest text-slate-500">
          Menu Principal
        </p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : ""}`} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-4 space-y-1">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white">
          <Settings className="h-5 w-5" /> Configurações
        </button>
        <div className="flex w-full items-center justify-between rounded-lg px-3 py-2.5">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-400">
             <UserButton />
             <span>Minha Conta</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans">
      <div className="md:hidden fixed top-0 w-full z-40 flex items-center justify-between border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl p-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
             <Sparkles className="h-5 w-5 text-emerald-400" />
             <span className="font-bold text-white">Finanças IA</span>
          </div>
        </div>
        <UserButton />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-slate-900 border-r border-white/10 shadow-2xl">
            <button className="absolute right-4 top-5 text-slate-400" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <aside className="hidden md:block sticky top-0 h-screen w-64 border-r border-white/10 bg-slate-900/40 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      <main className="flex-1 overflow-x-hidden pt-16 md:pt-0">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
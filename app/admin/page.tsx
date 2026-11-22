'use client';

import { useEffect, useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalDocuments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalDocuments: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const docsRes = await fetch('/api/admin/documents');

      if (docsRes.ok) {
        const docs = await docsRes.json();
        setStats({
          totalDocuments: docs.length,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/documents',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-dark-muted">Welcome to the admin panel</p>
      </div>

      {isLoading ? (
        <div className="text-dark-muted">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.link}
                  className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${card.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                  <p className="text-dark-muted text-sm mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-white">{card.value}</p>
                </Link>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/documents"
                  className="block px-4 py-3 bg-dark-hover hover:bg-blue-500/20 rounded-lg text-white transition-colors"
                >
                  + Create New Document
                </Link>
                <Link
                  href="/"
                  className="flex items-center space-x-2 px-4 py-3 bg-dark-hover hover:bg-purple-500/20 rounded-lg text-white transition-colors"
                >
                  <Eye size={18} />
                  <span>View Public Site</span>
                </Link>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">System Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-muted">Database:</span>
                  <span className="text-white">SQLite</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted">Framework:</span>
                  <span className="text-white">Next.js 14</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted">Styling:</span>
                  <span className="text-white">Tailwind CSS</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


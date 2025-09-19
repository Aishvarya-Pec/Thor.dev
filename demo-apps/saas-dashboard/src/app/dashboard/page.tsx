'use client'

import { DashboardLayout } from '@/components/dashboard/layout'
import { MetricsCards } from '@/components/dashboard/metrics-cards'
import { AnalyticsChart } from '@/components/dashboard/analytics-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TeamOverview } from '@/components/dashboard/team-overview'

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome to your SaaS dashboard</p>
        </div>
        
        <MetricsCards />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnalyticsChart />
          <RecentActivity />
        </div>
        
        <TeamOverview />
      </div>
    </DashboardLayout>
  )
}
// Mobile optimizations added by Thor.dev Chat Agent
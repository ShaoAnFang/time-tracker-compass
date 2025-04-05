
import React from 'react';
import Layout from '@/components/Layout';
import TimeAnalytics from '@/components/TimeAnalytics';

const AnalyticsPage: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Analytics</h1>
          <p className="text-muted-foreground">
            Analyze your time entries and productivity patterns
          </p>
        </div>
        
        <TimeAnalytics />
      </div>
    </Layout>
  );
};

export default AnalyticsPage;

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Award,
  Download,
  RefreshCw,
  Eye,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { reportApi } from '../../services/reportApi';
import { ReportMetric, ReportChart } from '../../types/report';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export const ReportDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [charts, setCharts] = useState<ReportChart[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await reportApi.getDashboardAnalytics();
      setMetrics(data.metrics || []);
      setCharts(data.charts || []);
      setRecentReports(data.recentReports || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const getMetricIcon = (icon?: string) => {
    const icons: Record<string, any> = {
      users: Users,
      dollar: DollarSign,
      calendar: Calendar,
      award: Award,
      file: FileText,
    };
    return icons[icon || 'file'] || FileText;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Analytics Dashboard</h2>
          <p className="text-sm text-slate-500">
            Overview of your school's performance metrics
          </p>
        </div>
        <button
          onClick={loadDashboard}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} className="inline mr-2" />
          Refresh
        </button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = getMetricIcon(metric.icon);
          return (
            <div
              key={index}
              className="rounded-lg bg-white p-4 shadow-sm border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {typeof metric.value === 'number' && metric.label.includes('Fee')
                      ? formatCurrency(metric.value)
                      : metric.value}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Icon size={20} />
                </div>
              </div>
              {metric.change !== undefined && (
                <div className="mt-2 flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp size={14} className="text-emerald-600" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown size={14} className="text-red-600" />
                  ) : null}
                  <span
                    className={`text-xs font-medium ${
                      metric.trend === 'up'
                        ? 'text-emerald-600'
                        : metric.trend === 'down'
                        ? 'text-red-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {charts.map((chart) => (
          <div
            key={chart.id}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900">{chart.title}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'bar' && (
                  <BarChart data={chart.labels.map((label, i) => ({
                    name: label,
                    ...chart.datasets.reduce((acc, dataset) => ({
                      ...acc,
                      [dataset.label]: dataset.data[i],
                    }), {}),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chart.datasets.map((dataset, i) => (
                      <Bar
                        key={i}
                        dataKey={dataset.label}
                        fill={dataset.backgroundColor?.[0] || COLORS[i % COLORS.length]}
                      />
                    ))}
                  </BarChart>
                )}
                {chart.type === 'line' && (
                  <LineChart data={chart.labels.map((label, i) => ({
                    name: label,
                    ...chart.datasets.reduce((acc, dataset) => ({
                      ...acc,
                      [dataset.label]: dataset.data[i],
                    }), {}),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {chart.datasets.map((dataset, i) => (
                      <Line
                        key={i}
                        type="monotone"
                        dataKey={dataset.label}
                        stroke={dataset.borderColor || COLORS[i % COLORS.length]}
                      />
                    ))}
                  </LineChart>
                )}
                {chart.type === 'pie' && (
                  <PieChart>
                    <Pie
                      data={chart.labels.map((label, i) => ({
                        name: label,
                        value: chart.datasets[0]?.data[i] || 0,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chart.labels.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-slate-900">Recent Reports</h3>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{report.name}</p>
                    <p className="text-xs text-slate-500">
                      {report.type} • {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                  <Eye size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
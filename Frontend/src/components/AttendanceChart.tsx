import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { attendanceApi } from "../services/attendanceApi";

interface AttendanceClassChartItem {
  className: string;
  present: number;
  absent: number;
  percentage: number;
}

export default function AttendanceChart() {
  const [data, setData] = useState<AttendanceClassChartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLiveData = async () => {
      try {
        setLoading(true);
        const today = new Date();
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const stats = await attendanceApi.getAttendanceStatistics({
          dateFrom: firstOfMonth.toISOString().split('T')[0],
          dateTo: today.toISOString().split('T')[0],
        });

        const chartData = (stats.byClass || []).map((item) => ({
          className: item.className,
          present: item.present,
          absent: item.absent,
          percentage: Number(item.percentage || 0),
        }));

        setData(chartData);
      } catch (error) {
        console.error('Failed to load live attendance chart data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLiveData();
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">
            Attendance By Class
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Live attendance overview from the database
          </p>
        </div>

        <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
          View Details
        </button>
      </div>

      <div className="h-64">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            Loading live data...
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="className"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                labelFormatter={(label) => `Class ${label}`}
              />

              <Bar
                dataKey="percentage"
                fill="#3b82f6"
                radius={[5, 5, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            No live attendance data available
          </div>
        )}
      </div>
    </div>
  );
}
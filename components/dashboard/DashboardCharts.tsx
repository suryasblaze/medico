'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DashboardChartsProps {
  visitData: any[]
  patientGrowth: any[]
  visitTypes: any[]
}

const COLORS = {
  primary: '#3b82f6',    // blue-600
  secondary: '#8b5cf6',  // purple-600
  tertiary: '#06b6d4',   // cyan-600
  success: '#10b981',    // green-600
  warning: '#f59e0b',    // amber-600
  danger: '#ef4444',     // red-600
}

const VISIT_TYPE_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
]

export function DashboardCharts({ visitData, patientGrowth, visitTypes }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Monthly Visits Bar Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Monthly Visits</CardTitle>
          <CardDescription>Patient visits over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Bar
                dataKey="visits"
                fill={COLORS.primary}
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="newPatients"
                fill={COLORS.secondary}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.primary }} />
              <span className="text-muted-foreground">Total Visits</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.secondary }} />
              <span className="text-muted-foreground">New Patients</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Growth Line Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Patient Growth</CardTitle>
          <CardDescription>Total patients registered over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={patientGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke={COLORS.tertiary}
                strokeWidth={3}
                dot={{ fill: COLORS.tertiary, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Visit Types Distribution Pie Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Visit Types Distribution</CardTitle>
          <CardDescription>Breakdown of visit categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={visitTypes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {visitTypes.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={VISIT_TYPE_COLORS[index % VISIT_TYPE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {visitTypes.map((type, index) => (
              <div key={type.name} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: VISIT_TYPE_COLORS[index % VISIT_TYPE_COLORS.length] }}
                />
                <span className="text-muted-foreground truncate">{type.name}</span>
                <span className="font-semibold ml-auto">{type.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity Bar Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Patient visits by day of the week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { day: 'Mon', visits: 12 },
                { day: 'Tue', visits: 19 },
                { day: 'Wed', visits: 15 },
                { day: 'Thu', visits: 22 },
                { day: 'Fri', visits: 18 },
                { day: 'Sat', visits: 8 },
                { day: 'Sun', visits: 4 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                stroke="#888"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px'
                }}
              />
              <Bar
                dataKey="visits"
                fill={COLORS.secondary}
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

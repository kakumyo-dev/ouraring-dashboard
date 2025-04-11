'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Employee } from '../../data/mockData';

type EmployeeAverageComparisonChartProps = {
    data: {
        employeeId: number;
        name: string;
        department: string;
        average: number;
    }[];
    title: string;
    period: 'week' | 'month' | 'all';
};

const EmployeeAverageComparisonChart = ({ data, title, period }: EmployeeAverageComparisonChartProps) => {
    // We need to transform the data for the chart
    const sortedData = [...data].sort((a, b) => a.employeeId - b.employeeId);

    // Get unique departments for colorization
    const departments = Array.from(new Set(data.map(item => item.department)));
    const departmentColors: Record<string, string> = {
        'Engineering': '#8884d8',
        'Marketing': '#82ca9d',
        'Sales': '#ffc658',
        'HR': '#ff8042',
        'Finance': '#0088fe'
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">{title} (Showing {data.length} employees)</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={sortedData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="employeeId"
                            label={{
                                value: 'Employee ID',
                                position: 'insideBottom',
                                offset: -5,
                                style: { fill: '#000000' }
                            }}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <YAxis
                            label={{
                                value: 'Average Sleep (hours)',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#000000' }
                            }}
                            domain={[4, 10]}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <Tooltip
                            formatter={(value) => [`${parseFloat(value.toString()).toFixed(2)} hours`, 'Average Sleep']}
                            labelFormatter={(label) => `Employee ID: ${label}`}
                            contentStyle={{ color: '#000000' }}
                        />
                        <Legend wrapperStyle={{ color: '#000000', paddingTop: '10px' }} />
                        <Line
                            type="monotone"
                            dataKey="average"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                            name={`Average Sleep`}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EmployeeAverageComparisonChart; 
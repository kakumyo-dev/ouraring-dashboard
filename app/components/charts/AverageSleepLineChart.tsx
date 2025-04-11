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
import { format, parseISO } from 'date-fns';

type AverageSleepLineChartProps = {
    data: { date: string; average: number }[];
    title: string;
};

const AverageSleepLineChart = ({ data, title }: AverageSleepLineChartProps) => {
    // Format data for the chart
    const chartData = data.map(item => {
        // Check if the date is in ISO format
        const isISODate = /^\d{4}-\d{2}-\d{2}/.test(item.date);

        return {
            date: item.date,
            average: parseFloat(item.average.toFixed(2)),
            // If it's an ISO date, format it, otherwise use the original string
            formattedDate: isISODate ? format(parseISO(item.date), 'MMM dd') : item.date
        };
    });

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">{title} (Showing {data.length} days)</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12, fill: '#000000' }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            label={{
                                value: 'Hours',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#000000' }
                            }}
                            domain={[4, 10]}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} hours`, 'Average Sleep']}
                            labelFormatter={(label) => `Date: ${label}`}
                            contentStyle={{ color: '#000000' }}
                        />
                        <Legend wrapperStyle={{ color: '#000000' }} />
                        <Line
                            type="monotone"
                            dataKey="average"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                            name="Average Sleep (hours)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default AverageSleepLineChart; 
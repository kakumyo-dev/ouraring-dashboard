'use client';

import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    Rectangle
} from 'recharts';
import { format, parseISO } from 'date-fns';

type BoxPlotData = {
    date: string;
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
};

type SleepBoxPlotChartProps = {
    data: BoxPlotData[];
    title: string;
};

// Custom box plot component
const CustomBoxPlot = (props: any) => {
    const { x, y, width, height, q1, median, q3, min, max } = props;

    const middleX = x + width / 2;
    const q1Y = y + height * (1 - q1 / max);
    const medianY = y + height * (1 - median / max);
    const q3Y = y + height * (1 - q3 / max);
    const minY = y + height * (1 - min / max);
    const maxY = y + height * (1 - max / max);

    return (
        <g>
            {/* Box from Q1 to Q3 */}
            <Rectangle
                x={x}
                y={q3Y}
                width={width}
                height={q1Y - q3Y}
                fill="#8884d8"
                stroke="#8884d8"
                opacity={0.5}
            />

            {/* Median line */}
            <line
                x1={x}
                y1={medianY}
                x2={x + width}
                y2={medianY}
                stroke="#8884d8"
                strokeWidth={2}
            />

            {/* Whisker lines */}
            <line
                x1={middleX}
                y1={minY}
                x2={middleX}
                y2={q1Y}
                stroke="#8884d8"
                strokeDasharray="3 3"
            />
            <line
                x1={middleX}
                y1={q3Y}
                x2={middleX}
                y2={maxY}
                stroke="#8884d8"
                strokeDasharray="3 3"
            />

            {/* Min and Max horizontal lines */}
            <line
                x1={x + width * 0.25}
                y1={minY}
                x2={x + width * 0.75}
                y2={minY}
                stroke="#8884d8"
                strokeWidth={1}
            />
            <line
                x1={x + width * 0.25}
                y1={maxY}
                x2={x + width * 0.75}
                y2={maxY}
                stroke="#8884d8"
                strokeWidth={1}
            />
        </g>
    );
};

// Calculate quartiles for array of values
const calculateQuartiles = (data: number[]): { min: number; q1: number; median: number; q3: number; max: number } => {
    // Sort data
    const sortedData = [...data].sort((a, b) => a - b);
    const len = sortedData.length;

    // Calculate quartiles
    const min = sortedData[0];
    const max = sortedData[len - 1];
    const median = len % 2 === 0
        ? (sortedData[len / 2 - 1] + sortedData[len / 2]) / 2
        : sortedData[Math.floor(len / 2)];

    const q1Index = Math.floor(len / 4);
    const q3Index = Math.floor(len * 3 / 4);

    const q1 = len % 4 === 0
        ? (sortedData[q1Index - 1] + sortedData[q1Index]) / 2
        : sortedData[q1Index];

    const q3 = len % 4 === 0
        ? (sortedData[q3Index - 1] + sortedData[q3Index]) / 2
        : sortedData[q3Index];

    return { min, q1, median, q3, max };
};

// Prepare data for box plot
export const prepareBoxPlotData = (sleepData: { date: string; durations: number[] }[]): BoxPlotData[] => {
    return sleepData.map(item => {
        const { min, q1, median, q3, max } = calculateQuartiles(item.durations);
        return {
            date: item.date,
            min,
            q1,
            median,
            q3,
            max
        };
    });
};

const SleepBoxPlotChart = ({ data, title }: SleepBoxPlotChartProps) => {
    // Format data for the chart
    const chartData = data.map(item => {
        // Check if the date is in ISO format
        const isISODate = /^\d{4}-\d{2}-\d{2}/.test(item.date);

        return {
            ...item,
            formattedDate: isISODate ? format(parseISO(item.date), 'MMM dd') : item.date
        };
    });

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">{title} (Showing {data.length} days)</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="formattedDate"
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            label={{
                                value: 'Sleep Hours',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle' }
                            }}
                            domain={[4, 10]}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} hours`, '']}
                            labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />

                        {/* Use Bar to render custom box plots */}
                        <Bar
                            dataKey="max"
                            fill="#8884d8"
                            shape={<CustomBoxPlot />}
                            name="Sleep Distribution"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SleepBoxPlotChart; 
'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

type HistogramBin = {
    bin: string;
    count: number;
};

type SleepHistogramChartProps = {
    data: number[];
    title: string;
};

// Generate histogram bins from raw sleep duration data
const generateHistogramBins = (sleepDurations: number[]): HistogramBin[] => {
    // Define bin ranges (from 4 hours to 10 hours, in 0.5 hour increments)
    const binSize = 0.5;
    const minBin = 4;
    const maxBin = 10;
    const bins: Record<string, number> = {};

    // Initialize bins
    for (let i = minBin; i < maxBin; i += binSize) {
        const binLabel = `${i}-${i + binSize}`;
        bins[binLabel] = 0;
    }

    // Count values in each bin
    sleepDurations.forEach(duration => {
        if (duration >= minBin && duration < maxBin) {
            const binIndex = Math.floor((duration - minBin) / binSize);
            const binStart = minBin + binIndex * binSize;
            const binLabel = `${binStart}-${binStart + binSize}`;
            bins[binLabel] = (bins[binLabel] || 0) + 1;
        }
    });

    // Convert to array format for Recharts
    return Object.entries(bins).map(([bin, count]) => ({
        bin,
        count
    }));
};

const SleepHistogramChart = ({ data, title }: SleepHistogramChartProps) => {
    const histogramData = generateHistogramBins(data);

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">{title} (Showing {data.length} data)</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={histogramData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="bin"
                            label={{
                                value: 'Sleep Duration (hours)',
                                position: 'insideBottom',
                                offset: -5,
                                style: { fill: '#000000' }
                            }}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <YAxis
                            label={{
                                value: 'Number of Employees',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#000000' }
                            }}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <Tooltip
                            formatter={(value) => [`${value} employees`, 'Count']}
                            labelFormatter={(label) => `Sleep Duration: ${label} hours`}
                            contentStyle={{ color: '#000000' }}
                        />
                        <Legend wrapperStyle={{ color: '#000000', paddingTop: '10px' }} />
                        <Bar dataKey="count" fill="#82ca9d" name="Number of Employees" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SleepHistogramChart; 
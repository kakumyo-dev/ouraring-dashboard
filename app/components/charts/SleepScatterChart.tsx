'use client';

import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ZAxis
} from 'recharts';

type ScatterDataPoint = {
    average: number;
    variance: number;
    count: number;
    name: string;
};

type SleepScatterChartProps = {
    data: ScatterDataPoint[];
    title: string;
};

// Custom shape for smaller dots
const CustomScatterDot = (props: any) => {
    const { cx, cy, fill } = props;

    return (
        <circle cx={cx} cy={cy} r={3} fill={fill} />
    );
};

const SleepScatterChart = ({ data, title }: SleepScatterChartProps) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-black">{title} (Showing {data.length} employees)</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            type="number"
                            dataKey="average"
                            name="Average Sleep"
                            label={{
                                value: 'Average Sleep Duration (hours)',
                                position: 'insideBottom',
                                offset: -5,
                                style: { fill: '#000000' }
                            }}
                            domain={[4, 10]}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <YAxis
                            type="number"
                            dataKey="variance"
                            name="Sleep Variance"
                            label={{
                                value: 'Sleep Variance',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#000000' }
                            }}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <ZAxis
                            type="number"
                            dataKey="count"
                            range={[20, 100]}
                            name="Data Points"
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            formatter={(value, name) => [
                                `${parseFloat(value.toString()).toFixed(2)}`,
                                name === 'average' ? 'Average Sleep (hours)' : name === 'variance' ? 'Sleep Variance' : 'Data Points'
                            ]}
                            labelFormatter={(label) => data[label]?.name || ''}
                            contentStyle={{ color: '#000000' }}
                        />
                        <Legend wrapperStyle={{ color: '#000000', paddingTop: '10px' }} />
                        <Scatter
                            name="Sleep Pattern"
                            data={data}
                            fill="#8884d8"
                            shape={<CustomScatterDot />}
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SleepScatterChart; 
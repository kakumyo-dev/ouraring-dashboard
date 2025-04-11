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
    Rectangle
} from 'recharts';

type EmployeeBoxPlotComparisonChartProps = {
    data: {
        employeeId: number;
        name: string;
        department: string;
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
    }[];
    title: string;
    period: 'week' | 'month' | 'all';
};

// Custom box plot component
const CustomBoxPlot = (props: any) => {
    const { x, y, width, height, q1, median, q3, min, max, fill, payload } = props;

    const q1Y = y + height * (1 - q1 / 10);  // 10 is the max domain value
    const medianY = y + height * (1 - median / 10);
    const q3Y = y + height * (1 - q3 / 10);
    const minY = y + height * (1 - min / 10);
    const maxY = y + height * (1 - max / 10);

    const middleX = x + width / 2;

    return (
        <g>
            {/* Box from Q1 to Q3 */}
            <Rectangle
                x={x}
                y={q3Y}
                width={width}
                height={q1Y - q3Y}
                fill={fill}
                stroke="#000"
                opacity={0.5}
            />

            {/* Median line */}
            <line
                x1={x}
                y1={medianY}
                x2={x + width}
                y2={medianY}
                stroke="#000"
                strokeWidth={2}
            />

            {/* Whisker lines */}
            <line
                x1={middleX}
                y1={minY}
                x2={middleX}
                y2={q1Y}
                stroke="#000"
                strokeDasharray="3 3"
            />
            <line
                x1={middleX}
                y1={q3Y}
                x2={middleX}
                y2={maxY}
                stroke="#000"
                strokeDasharray="3 3"
            />

            {/* Min and Max horizontal lines */}
            <line
                x1={x + width * 0.25}
                y1={minY}
                x2={x + width * 0.75}
                y2={minY}
                stroke="#000"
                strokeWidth={1}
            />
            <line
                x1={x + width * 0.25}
                y1={maxY}
                x2={x + width * 0.75}
                y2={maxY}
                stroke="#000"
                strokeWidth={1}
            />
        </g>
    );
};

const EmployeeBoxPlotComparisonChart = ({ data, title, period }: EmployeeBoxPlotComparisonChartProps) => {
    // Sort data by employee ID
    const sortedData = [...data].sort((a, b) => a.employeeId - b.employeeId);

    // Color mapping for departments
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
                    <ComposedChart
                        data={sortedData}
                        margin={{
                            top: 20,
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
                                value: 'Sleep Hours',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: '#000000' }
                            }}
                            domain={[4, 10]}
                            tick={{ fontSize: 12, fill: '#000000' }}
                        />
                        <Tooltip
                            formatter={(value) => [`${parseFloat(value.toString()).toFixed(2)} hours`, '']}
                            labelFormatter={(label) => `Employee ID: ${label}`}
                            contentStyle={{ color: '#000000' }}
                        />
                        <Legend wrapperStyle={{ color: '#000000', paddingTop: '10px' }} />

                        {/* Use Bar to render custom box plots */}
                        <Bar
                            dataKey="max"
                            name={`Sleep Distribution`}
                            shape={(props: any) => {
                                // Use type assertion to safely access the payload
                                const payload = props.payload as { employeeId: number };
                                const department = data.find(item => item.employeeId === payload.employeeId)?.department || 'Engineering';
                                return <CustomBoxPlot {...props} fill={departmentColors[department] || '#8884d8'} />;
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EmployeeBoxPlotComparisonChart; 
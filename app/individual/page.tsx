'use client';

import { useState, useEffect } from 'react';
import FilterControls from '../components/FilterControls';
import AverageSleepLineChart from '../components/charts/AverageSleepLineChart';
import SleepBoxPlotChart from '../components/charts/SleepBoxPlotChart';
import SleepScatterChart from '../components/charts/SleepScatterChart';
import EmployeeAverageComparisonChart from '../components/charts/EmployeeAverageComparisonChart';
import EmployeeBoxPlotComparisonChart from '../components/charts/EmployeeBoxPlotComparisonChart';
import ClientOnlyWrapper from '../components/ClientOnlyWrapper';
import {
    employees,
    getEmployeeSleepStatsByPeriod,
    SleepData,
    Employee,
    sleepData,
    getEmployeeSleepData
} from '../data/mockData';

// Function to calculate quartiles for an array of values
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

export default function IndividualPage() {
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all');
    const [employeeStats, setEmployeeStats] = useState<any[]>([]);
    const [averageSleepData, setAverageSleepData] = useState<{ date: string; average: number }[]>([]);
    const [boxPlotData, setBoxPlotData] = useState<any[]>([]);
    const [scatterData, setScatterData] = useState<any[]>([]);

    // New state for comparison charts
    const [comparativeAverageData, setComparativeAverageData] = useState<any[]>([]);
    const [comparativeBoxPlotData, setComparativeBoxPlotData] = useState<any[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
    const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);

    // Get stats for all employees for the scatter plot and new comparison charts
    useEffect(() => {
        const allEmployeeStats = filteredEmployees.map(emp => {
            // Get employee sleep data
            let employeeData = getEmployeeSleepData(emp.id);

            // Filter by date range if specified
            if (dateRange && dateRange[0]) {
                const [startDate, endDate] = dateRange;
                const startDateObj = new Date(startDate);
                const endDateObj = endDate ? new Date(endDate) : new Date();

                // Reset hours for comparison
                startDateObj.setHours(0, 0, 0, 0);
                endDateObj.setHours(23, 59, 59, 999);

                // Filter data by date range
                employeeData = employeeData.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate >= startDateObj && itemDate <= endDateObj;
                });
            }

            // Skip if no data in range
            if (employeeData.length === 0) {
                return null;
            }

            // Calculate average sleep duration
            const sleepDurations = employeeData.map(item => item.duration);
            const sum = sleepDurations.reduce((a, b) => a + b, 0);
            const avgAvg = sleepDurations.length > 0 ? sum / sleepDurations.length : 0;

            // Calculate variance
            const mean = avgAvg;
            const variance = sleepDurations.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sleepDurations.length;

            // Calculate quartiles for box plot
            const quartiles = calculateQuartiles(sleepDurations);

            return {
                employeeId: emp.id,
                name: emp.name,
                department: emp.department,
                gender: emp.gender,
                age: emp.age,
                height: emp.height,
                weight: emp.weight,
                average: avgAvg,
                variance: variance,
                count: sleepDurations.length,
                min: quartiles.min,
                q1: quartiles.q1,
                median: quartiles.median,
                q3: quartiles.q3,
                max: quartiles.max
            };
        }).filter(stat => stat !== null); // Remove null entries (employees with no data in range)

        // Update scatter data
        setScatterData(allEmployeeStats.map(stat => ({
            ...stat,
            name: stat.name
        })));

        // Update comparative charts data
        setComparativeAverageData(allEmployeeStats);
        setComparativeBoxPlotData(allEmployeeStats);
    }, [filteredEmployees, dateRange]);

    // Handle employee selection
    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const employeeId = parseInt(e.target.value);
        setSelectedEmployee(employeeId);

        if (employeeId) {
            const stats = getEmployeeSleepStatsByPeriod(employeeId, 'all');
            setEmployeeStats(stats);

            // Prepare data for line chart
            const lineChartData = stats.map(stat => ({
                date: stat.period,
                average: stat.average
            }));
            setAverageSleepData(lineChartData);

            // Prepare data for box plot
            const boxPlotDataRaw = stats.map(stat => ({
                date: stat.period,
                durations: Array(stat.count).fill(0).map((_, i) =>
                    (i / stat.count) * (stat.max - stat.min) + stat.min
                )
            }));

            import('../components/charts/SleepBoxPlotChart')
                .then(module => {
                    const preparedData = module.prepareBoxPlotData(boxPlotDataRaw);
                    setBoxPlotData(preparedData);
                });
        }
    };

    // Function to handle filter changes for comparative analysis
    const handleComparativeFilterChange = (filters: {
        gender?: string;
        ageRange?: [number, number];
        heightRange?: [number, number];
        weightRange?: [number, number];
        dateRange?: [string, string];
    }) => {
        console.log("Applying filters:", filters);

        // Filter employees
        let newFilteredEmployees = [...employees];

        if (filters.gender) {
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.gender === filters.gender
            );
        }

        if (filters.ageRange) {
            const [minAge, maxAge] = filters.ageRange;
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.age >= minAge && emp.age <= maxAge
            );
        }

        if (filters.heightRange) {
            const [minHeight, maxHeight] = filters.heightRange;
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.height >= minHeight && emp.height <= maxHeight
            );
        }

        if (filters.weightRange) {
            const [minWeight, maxWeight] = filters.weightRange;
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.weight >= minWeight && emp.weight <= maxWeight
            );
        }

        console.log("After attribute filtering:", newFilteredEmployees.length, "employees");

        // Store the date range for filtering
        setDateRange(filters.dateRange);

        // Set filtered employees for attribute filtering
        setFilteredEmployees(newFilteredEmployees);
    };

    return (
        <ClientOnlyWrapper>
            <div className="space-y-6">
                {/* New comparative charts for all employees */}
                <h2 className="text-xl font-semibold mb-4 text-black">Comparative Analysis Across Employees</h2>

                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-black">Filter Comparative Analysis</h3>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <div>
                            <FilterControls
                                employees={employees}
                                onFilterChange={handleComparativeFilterChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <EmployeeAverageComparisonChart
                        data={comparativeAverageData}
                        title="Employee Average Sleep Time"
                        period={selectedPeriod}
                    />

                    <EmployeeBoxPlotComparisonChart
                        data={comparativeBoxPlotData}
                        title="Sleep Time Distribution by Employee ID"
                        period={selectedPeriod}
                    />
                </div>

                <div>
                    <SleepScatterChart
                        data={scatterData}
                        title="Sleep Pattern Distribution (Average vs. Variance)"
                    />
                </div>

                {/* Individual employee data */}
                <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Individual Employee Sleep Data</h2>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3 text-black">Select Employee</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employee
                            </label>
                            <select
                                value={selectedEmployee || ''}
                                onChange={handleEmployeeChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            >
                                <option value="">Select an employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.name} - {emp.age}y, {emp.height}cm, {emp.weight}kg
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Period
                            </label>
                            <select
                                value={selectedPeriod}
                                onChange={(e) => {
                                    const newPeriod = e.target.value as 'week' | 'month' | 'all';
                                    setSelectedPeriod(newPeriod);

                                    if (selectedEmployee) {
                                        const stats = getEmployeeSleepStatsByPeriod(selectedEmployee, newPeriod);
                                        setEmployeeStats(stats);

                                        // Prepare data for line chart
                                        const lineChartData = stats.map(stat => ({
                                            date: stat.period,
                                            average: stat.average
                                        }));
                                        setAverageSleepData(lineChartData);

                                        // Prepare data for box plot
                                        const boxPlotDataRaw = stats.map(stat => ({
                                            date: stat.period,
                                            durations: Array(stat.count).fill(0).map((_, i) =>
                                                (i / stat.count) * (stat.max - stat.min) + stat.min
                                            )
                                        }));

                                        import('../components/charts/SleepBoxPlotChart')
                                            .then(module => {
                                                const preparedData = module.prepareBoxPlotData(boxPlotDataRaw);
                                                setBoxPlotData(preparedData);
                                            });
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                            >
                                <option value="week">Weekly</option>
                                <option value="month">Monthly</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                    </div>
                </div>

                {selectedEmployee ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AverageSleepLineChart
                                data={averageSleepData}
                                title={`Average Sleep Duration by ${selectedPeriod === 'week' ? 'Week' : selectedPeriod === 'month' ? 'Month' : 'All Time'}`}
                            />

                            <SleepBoxPlotChart
                                data={boxPlotData}
                                title={`Sleep Duration Distribution by ${selectedPeriod === 'week' ? 'Week' : selectedPeriod === 'month' ? 'Month' : 'All Time'}`}
                            />
                        </div>
                    </>
                ) : (
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-gray-600">Please select an employee to view their sleep data.</p>
                    </div>
                )}
            </div>
        </ClientOnlyWrapper>
    );
} 
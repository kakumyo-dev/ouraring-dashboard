'use client';

import { useState, useEffect } from 'react';
import FilterControls from './components/FilterControls';
import AverageSleepLineChart from './components/charts/AverageSleepLineChart';
import SleepBoxPlotChart from './components/charts/SleepBoxPlotChart';
import SleepHistogramChart from './components/charts/SleepHistogramChart';
import ClientOnlyWrapper from './components/ClientOnlyWrapper';
import {
  employees,
  sleepData,
  getAverageSleepByDate,
  getSleepDistributionByDate,
  SleepData,
  Employee
} from './data/mockData';

// Function to prepare data for box plot
const prepareSleepDistributionByDate = () => {
  const result: { date: string; durations: number[] }[] = [];

  // Get unique dates
  const uniqueDates = [...new Set(sleepData.map(item => item.date))];

  // For each date, get all durations
  uniqueDates.forEach(date => {
    const durations = sleepData
      .filter(item => item.date === date)
      .map(item => item.duration);

    result.push({
      date,
      durations
    });
  });

  return result;
};

export default function Home() {
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const [filteredSleepData, setFilteredSleepData] = useState<SleepData[]>(sleepData);
  const [averageSleepData, setAverageSleepData] = useState(getAverageSleepByDate());
  const [boxPlotData, setBoxPlotData] = useState<any[]>([]);
  const [histogramData, setHistogramData] = useState<number[]>([]);

  useEffect(() => {
    // Initial data preparation
    const boxPlotDataRaw = prepareSleepDistributionByDate();
    import('./components/charts/SleepBoxPlotChart')
      .then(module => {
        const preparedData = module.prepareBoxPlotData(boxPlotDataRaw);
        setBoxPlotData(preparedData);
      });

    // Histogram data (all sleep durations)
    setHistogramData(sleepData.map(item => item.duration));
  }, []);

  // Function to handle filter changes
  const handleFilterChange = (filters: {
    gender?: string;
    ageRange?: [number, number];
    heightRange?: [number, number];
    weightRange?: [number, number];
    dateRange?: [string, string];
  }) => {
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

    // Get employee IDs for filtering sleep data
    const employeeIds = newFilteredEmployees.map(emp => emp.id);

    // Filter sleep data
    let newFilteredSleepData = sleepData.filter(item =>
      employeeIds.includes(item.employeeId)
    );

    // Filter by date range if specified
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      newFilteredSleepData = newFilteredSleepData.filter(item =>
        item.date >= startDate && item.date <= endDate
      );
    }

    setFilteredEmployees(newFilteredEmployees);
    setFilteredSleepData(newFilteredSleepData);

    // Recalculate chart data with filtered data

    // Average sleep line chart
    const dateGroups = newFilteredSleepData.reduce((groups, item) => {
      if (!groups[item.date]) {
        groups[item.date] = [];
      }
      groups[item.date].push(item.duration);
      return groups;
    }, {} as Record<string, number[]>);

    const newAverageSleepData = Object.entries(dateGroups).map(([date, durations]) => {
      const sum = durations.reduce((a, b) => a + b, 0);
      return {
        date,
        average: sum / durations.length
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setAverageSleepData(newAverageSleepData);

    // Box plot data
    const boxPlotDataRaw = Object.entries(dateGroups).map(([date, durations]) => ({
      date,
      durations
    }));

    import('./components/charts/SleepBoxPlotChart')
      .then(module => {
        const preparedData = module.prepareBoxPlotData(boxPlotDataRaw);
        setBoxPlotData(preparedData);
      });

    // Histogram data
    setHistogramData(newFilteredSleepData.map(item => item.duration));
  };

  return (
    <ClientOnlyWrapper>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">All Employees Sleep Dashboard</h2>

          <FilterControls
            employees={employees}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AverageSleepLineChart
            data={averageSleepData}
            title="Average Sleep Duration (All Employees)"
          />

          <SleepBoxPlotChart
            data={boxPlotData}
            title="Sleep Duration Distribution by Date"
          />
        </div>

        <div>
          <SleepHistogramChart
            data={histogramData}
            title="Sleep Duration Distribution (Histogram)"
          />
        </div>
      </div>
    </ClientOnlyWrapper>
  );
}

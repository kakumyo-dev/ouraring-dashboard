'use client';

/**
 * 個人ページコンポーネント
 * 
 * 主な機能:
 * 1. 従業員比較分析 - 全従業員の睡眠データの比較表示
 * 2. 個別従業員データ - 選択した従業員の詳細な睡眠データ表示
 */

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

/**
 * 四分位数を計算する関数
 * 箱ひげ図用のデータ（最小値、第1四分位数、中央値、第3四分位数、最大値）を計算
 */
const calculateQuartiles = (data: number[]): { min: number; q1: number; median: number; q3: number; max: number } => {
    // データを昇順でソート
    const sortedData = [...data].sort((a, b) => a - b);
    const len = sortedData.length;

    // 四分位数の計算
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
    // =========== 状態管理（State） ===========
    // 個別従業員データ用の状態
    const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null); // 選択された従業員ID
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('all'); // 選択された期間
    const [employeeStats, setEmployeeStats] = useState<any[]>([]); // 従業員の統計データ
    const [averageSleepData, setAverageSleepData] = useState<{ date: string; average: number }[]>([]); // 平均睡眠時間データ
    const [boxPlotData, setBoxPlotData] = useState<any[]>([]); // 箱ひげ図データ
    const [scatterData, setScatterData] = useState<any[]>([]); // 散布図データ

    // 従業員比較データ用の状態
    const [comparativeAverageData, setComparativeAverageData] = useState<any[]>([]); // 平均値比較データ
    const [comparativeBoxPlotData, setComparativeBoxPlotData] = useState<any[]>([]); // 箱ひげ図比較データ
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees); // フィルタリングされた従業員リスト
    const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined); // 日付範囲フィルター

    /**
     * 比較グラフ用のデータを計算するエフェクト
     * filteredEmployeesまたはdateRangeが変更されたときに実行される
     */
    useEffect(() => {
        const allEmployeeStats = filteredEmployees.map(emp => {
            // 従業員の睡眠データを取得
            let employeeData = getEmployeeSleepData(emp.id);

            // 日付範囲が指定されている場合はフィルタリング
            if (dateRange && dateRange[0]) {
                const [startDate, endDate] = dateRange;
                const startDateObj = new Date(startDate);
                const endDateObj = endDate ? new Date(endDate) : new Date();

                // 時間をリセットして日付のみで比較
                startDateObj.setHours(0, 0, 0, 0);
                endDateObj.setHours(23, 59, 59, 999);

                // 指定された日付範囲内のデータのみをフィルタリング
                employeeData = employeeData.filter(item => {
                    const itemDate = new Date(item.date);
                    itemDate.setHours(0, 0, 0, 0);
                    return itemDate >= startDateObj && itemDate <= endDateObj;
                });
            }

            // 範囲内にデータがない場合はスキップ
            if (employeeData.length === 0) {
                return null;
            }

            // 平均睡眠時間を計算
            const sleepDurations = employeeData.map(item => item.duration);
            const sum = sleepDurations.reduce((a, b) => a + b, 0);
            const avgAvg = sleepDurations.length > 0 ? sum / sleepDurations.length : 0;

            // 分散を計算
            const mean = avgAvg;
            const variance = sleepDurations.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sleepDurations.length;

            // 箱ひげ図用の四分位数を計算
            const quartiles = calculateQuartiles(sleepDurations);

            // 統計データを返す
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
        }).filter(stat => stat !== null); // データがない従業員を除外

        // 散布図データを更新
        setScatterData(allEmployeeStats.map(stat => ({
            ...stat,
            name: stat.name
        })));

        // 比較グラフのデータを更新
        setComparativeAverageData(allEmployeeStats);
        setComparativeBoxPlotData(allEmployeeStats);
    }, [filteredEmployees, dateRange]);

    /**
     * 従業員選択時の処理
     * 選択された従業員の詳細データを取得・表示する
     */
    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const employeeId = parseInt(e.target.value);
        setSelectedEmployee(employeeId);

        if (employeeId) {
            // 選択された期間に基づいて統計データを取得
            const stats = getEmployeeSleepStatsByPeriod(employeeId, 'all');
            setEmployeeStats(stats);

            // 折れ線グラフ用のデータを準備
            const lineChartData = stats.map(stat => ({
                date: stat.period,
                average: stat.average
            }));
            setAverageSleepData(lineChartData);

            // 箱ひげ図用のデータを準備
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

    /**
     * 比較分析のフィルター変更時の処理
     * フィルターに基づいて従業員リストと日付範囲を更新する
     */
    const handleComparativeFilterChange = (filters: {
        gender?: string;
        ageRange?: [number, number];
        heightRange?: [number, number];
        weightRange?: [number, number];
        dateRange?: [string, string];
    }) => {
        console.log("フィルターを適用:", filters);

        // 従業員属性でフィルタリング
        let newFilteredEmployees = [...employees];

        // 性別フィルター
        if (filters.gender) {
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.gender === filters.gender
            );
        }

        // 年齢範囲フィルター
        if (filters.ageRange) {
            const [minAge, maxAge] = filters.ageRange;
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.age >= minAge && emp.age <= maxAge
            );
        }

        // 身長範囲フィルター
        if (filters.heightRange) {
            const [minHeight, maxHeight] = filters.heightRange;
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.height >= minHeight && emp.height <= maxHeight
            );
        }

        // 体重範囲フィルター
        if (filters.weightRange) {
            const [minWeight, maxWeight] = filters.weightRange;
            newFilteredEmployees = newFilteredEmployees.filter(
                emp => emp.weight >= minWeight && emp.weight <= maxWeight
            );
        }

        console.log("属性フィルタリング後:", newFilteredEmployees.length, "人の従業員");

        // 日付範囲を保存
        setDateRange(filters.dateRange);

        // フィルタリングされた従業員リストを設定
        setFilteredEmployees(newFilteredEmployees);
    };

    return (
        <ClientOnlyWrapper>
            <div className="space-y-6">
                {/* =========== 従業員比較分析セクション =========== */}
                <h2 className="text-xl font-semibold mb-4 text-black">Comparative Analysis Across Employees</h2>

                {/* フィルターコントロール */}
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

                {/* 平均睡眠時間と睡眠時間分布の比較グラフ */}
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

                {/* 睡眠パターン分布の散布図 */}
                <div>
                    <SleepScatterChart
                        data={scatterData}
                        title="Sleep Pattern Distribution (Average vs. Variance)"
                    />
                </div>

                {/* =========== 個別従業員データセクション =========== */}
                <h2 className="text-xl font-semibold mt-8 mb-4 text-black">Individual Employee Sleep Data</h2>

                {/* 従業員選択と期間選択 */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3 text-black">Select Employee</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* 従業員選択ドロップダウン */}
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

                        {/* 期間選択ドロップダウン */}
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
                                        // 選択された期間に基づいて統計データを更新
                                        const stats = getEmployeeSleepStatsByPeriod(selectedEmployee, newPeriod);
                                        setEmployeeStats(stats);

                                        // 折れ線グラフデータを更新
                                        const lineChartData = stats.map(stat => ({
                                            date: stat.period,
                                            average: stat.average
                                        }));
                                        setAverageSleepData(lineChartData);

                                        // 箱ひげ図データを更新
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

                {/* 選択された従業員のデータ表示 */}
                {selectedEmployee ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 平均睡眠時間チャート */}
                            <AverageSleepLineChart
                                data={averageSleepData}
                                title={`Average Sleep Duration by ${selectedPeriod === 'week' ? 'Week' : selectedPeriod === 'month' ? 'Month' : 'All Time'}`}
                            />

                            {/* 睡眠時間分布チャート */}
                            <SleepBoxPlotChart
                                data={boxPlotData}
                                title={`Sleep Duration Distribution by ${selectedPeriod === 'week' ? 'Week' : selectedPeriod === 'month' ? 'Month' : 'All Time'}`}
                            />
                        </div>
                    </>
                ) : (
                    // 従業員が選択されていない場合のメッセージ
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                        <p className="text-gray-600">Please select an employee to view their sleep data.</p>
                    </div>
                )}
            </div>
        </ClientOnlyWrapper>
    );
} 
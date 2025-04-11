'use client';

/**
 * メインダッシュボードページコンポーネント
 * 
 * 主な機能:
 * 1. 全従業員の睡眠データの概要表示
 * 2. フィルター機能による特定条件の従業員データ表示
 * 3. 平均睡眠時間・睡眠時間分布・ヒストグラムの可視化
 */

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

/**
 * 箱ひげ図用のデータを準備する関数
 * 日付ごとの睡眠時間データをグループ化
 */
const prepareSleepDistributionByDate = () => {
  const result: { date: string; durations: number[] }[] = [];

  // ユニークな日付の取得
  const uniqueDates = [...new Set(sleepData.map(item => item.date))];

  // 各日付ごとに睡眠時間データを集計
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
  // =========== 状態管理（State） ===========
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees); // フィルタリングされた従業員リスト
  const [filteredSleepData, setFilteredSleepData] = useState<SleepData[]>(sleepData); // フィルタリングされた睡眠データ
  const [averageSleepData, setAverageSleepData] = useState(getAverageSleepByDate()); // 平均睡眠時間データ
  const [boxPlotData, setBoxPlotData] = useState<any[]>([]); // 箱ひげ図データ
  const [histogramData, setHistogramData] = useState<number[]>([]); // ヒストグラムデータ

  /**
   * 初期データ準備用のエフェクト
   * コンポーネントのマウント時に一度だけ実行される
   */
  useEffect(() => {
    // 箱ひげ図データの準備
    const boxPlotDataRaw = prepareSleepDistributionByDate();
    import('./components/charts/SleepBoxPlotChart')
      .then(module => {
        const preparedData = module.prepareBoxPlotData(boxPlotDataRaw);
        setBoxPlotData(preparedData);
      });

    // ヒストグラムデータの準備（全睡眠時間）
    setHistogramData(sleepData.map(item => item.duration));
  }, []);

  /**
   * フィルター変更時の処理
   * フィルター条件に基づいて従業員データと睡眠データを更新する
   */
  const handleFilterChange = (filters: {
    gender?: string;
    ageRange?: [number, number];
    heightRange?: [number, number];
    weightRange?: [number, number];
    dateRange?: [string, string];
  }) => {
    // 従業員データのフィルタリング
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

    // フィルタリングされた従業員IDの取得
    const employeeIds = newFilteredEmployees.map(emp => emp.id);

    // 睡眠データのフィルタリング（従業員IDに基づく）
    let newFilteredSleepData = sleepData.filter(item =>
      employeeIds.includes(item.employeeId)
    );

    // 日付範囲によるフィルタリング
    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange;
      console.log("日付範囲フィルター:", { startDate, endDate });

      // 開始日が指定されている場合のみ日付フィルタリングを適用
      if (startDate) {
        console.log("開始日フィルターを適用:", startDate);
        newFilteredSleepData = newFilteredSleepData.filter(item => {
          const itemDate = new Date(item.date);

          // 時間を0にセットして日付のみで比較
          itemDate.setHours(0, 0, 0, 0);

          // 開始日のチェック
          const startDateObj = new Date(startDate);
          startDateObj.setHours(0, 0, 0, 0);

          if (itemDate < startDateObj) {
            return false;
          }

          // 終了日が指定されている場合のみ終了日のチェック
          if (endDate) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(0, 0, 0, 0);

            if (itemDate > endDateObj) {
              return false;
            }
          }

          return true;
        });
        console.log("日付フィルタリング後:", newFilteredSleepData.length, "データポイント");
      } else {
        console.log("開始日が指定されていないため、日付フィルタリングをスキップ");
      }
    } else {
      console.log("日付範囲フィルターが適用されていません");
    }

    // フィルタリングされたデータを状態に設定
    setFilteredEmployees(newFilteredEmployees);
    setFilteredSleepData(newFilteredSleepData);

    // =========== フィルタリングされたデータでチャートデータを再計算 ===========

    // 平均睡眠時間ラインチャート用データの計算
    const dateGroups = newFilteredSleepData.reduce((groups, item) => {
      if (!groups[item.date]) {
        groups[item.date] = [];
      }
      groups[item.date].push(item.duration);
      return groups;
    }, {} as Record<string, number[]>);

    // 日付ごとの平均睡眠時間を計算
    const newAverageSleepData = Object.entries(dateGroups).map(([date, durations]) => {
      const sum = durations.reduce((a, b) => a + b, 0);
      return {
        date,
        average: sum / durations.length
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // 日付順にソート

    setAverageSleepData(newAverageSleepData);

    // 箱ひげ図用データの更新
    const boxPlotDataRaw = Object.entries(dateGroups).map(([date, durations]) => ({
      date,
      durations
    }));

    import('./components/charts/SleepBoxPlotChart')
      .then(module => {
        const preparedData = module.prepareBoxPlotData(boxPlotDataRaw);
        setBoxPlotData(preparedData);
      });

    // ヒストグラム用データの更新
    setHistogramData(newFilteredSleepData.map(item => item.duration));
  };

  return (
    <ClientOnlyWrapper>
      <div className="space-y-6">
        {/* =========== タイトル =========== */}
        <h2 className="text-xl font-semibold mb-4 text-black">Comparative Analysis Across Days</h2>
        {/* =========== フィルターコントロールセクション =========== */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-black">Filter Comparative Analysis</h2>

          <FilterControls
            employees={employees}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* =========== チャート表示セクション =========== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 平均睡眠時間チャート */}
          <AverageSleepLineChart
            data={averageSleepData}
            title="Average Sleep Duration by Date"
          />

          {/* 睡眠時間分布チャート（箱ひげ図） */}
          <SleepBoxPlotChart
            data={boxPlotData}
            title="Sleep Duration Distribution by Date"
          />
        </div>

        <div>
          {/* 睡眠時間分布チャート（ヒストグラム） */}
          <SleepHistogramChart
            data={histogramData}
            title="Sleep Duration Distribution (Histogram)"
          />
        </div>
      </div>
    </ClientOnlyWrapper>
  );
}

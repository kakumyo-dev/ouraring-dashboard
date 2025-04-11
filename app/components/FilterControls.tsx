'use client';

/**
 * フィルターコントロールコンポーネント
 * 
 * 主な機能:
 * 1. 性別、年齢、身長、体重、日付範囲によるデータフィルタリング
 * 2. スライダーコントロールによる範囲選択
 * 3. フィルター適用ボタンによるデータ更新
 */

import { useState, useEffect } from 'react';
import { Employee } from '../data/mockData';

/**
 * フィルターコントロールのプロパティ型定義
 */
type FilterControlsProps = {
    employees: Employee[];         // フィルタリング対象の従業員データ配列
    onFilterChange: (filters: {    // フィルター変更時のコールバック関数
        gender?: string;           // 性別フィルター
        ageRange?: [number, number]; // 年齢範囲
        heightRange?: [number, number]; // 身長範囲
        weightRange?: [number, number]; // 体重範囲
        dateRange?: [string, string];   // 日付範囲
    }) => void;
};

const FilterControls = ({ employees, onFilterChange }: FilterControlsProps) => {
    // =========== 状態管理（State） ===========
    const [gender, setGender] = useState<string>('');  // 選択された性別
    const [ageRange, setAgeRange] = useState<[number, number]>([20, 70]);  // 年齢範囲
    const [heightRange, setHeightRange] = useState<[number, number]>([140, 200]);  // 身長範囲（cm）
    const [weightRange, setWeightRange] = useState<[number, number]>([40, 120]);   // 体重範囲（kg）
    const [startDate, setStartDate] = useState<string>('');  // 開始日
    const [endDate, setEndDate] = useState<string>('');      // 終了日

    // 今日の日付をデフォルトの終了日として設定
    const defaultEndDate = new Date().toISOString().split('T')[0];

    /**
     * コンポーネントマウント時に終了日を今日に設定
     */
    useEffect(() => {
        if (!endDate) {
            setEndDate(defaultEndDate);
        }
    }, []);

    // スライダーのための最小・最大値設定
    const ageMin = 20;
    const ageMax = 70;
    const heightMin = 140;
    const heightMax = 200;
    const weightMin = 40;
    const weightMax = 120;

    /**
     * 年齢範囲の最小値変更ハンドラ
     */
    const handleAgeMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setAgeRange([value, ageRange[1]]);
    };

    /**
     * 年齢範囲の最大値変更ハンドラ
     */
    const handleAgeMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setAgeRange([ageRange[0], value]);
    };

    /**
     * 身長範囲の最小値変更ハンドラ
     */
    const handleHeightMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setHeightRange([value, heightRange[1]]);
    };

    /**
     * 身長範囲の最大値変更ハンドラ
     */
    const handleHeightMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setHeightRange([heightRange[0], value]);
    };

    /**
     * 体重範囲の最小値変更ハンドラ
     */
    const handleWeightMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setWeightRange([value, weightRange[1]]);
    };

    /**
     * 体重範囲の最大値変更ハンドラ
     */
    const handleWeightMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setWeightRange([weightRange[0], value]);
    };

    /**
     * フィルター適用ボタン押下時のハンドラ
     * すべてのフィルター条件を親コンポーネントに通知
     */
    const handleFilterChange = () => {
        // デバッグ用ログ
        console.log("フィルターを適用、日付範囲:", startDate ? [startDate, endDate || defaultEndDate] : undefined);

        // 親コンポーネントに現在のフィルター設定を通知
        onFilterChange({
            gender: gender || undefined,
            ageRange: ageRange,
            heightRange: heightRange,
            weightRange: weightRange,
            dateRange: startDate ? [startDate, endDate || defaultEndDate] : undefined
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold mb-3 text-black">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 性別フィルター */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender
                    </label>
                    <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                        <option value="">All Genders</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* 年齢範囲フィルター */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age Range: {ageRange[0]}-{ageRange[1]}
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="range"
                            min={ageMin}
                            max={ageMax}
                            value={ageRange[0]}
                            onChange={handleAgeMinChange}
                            className="w-1/2"
                        />
                        <input
                            type="range"
                            min={ageMin}
                            max={ageMax}
                            value={ageRange[1]}
                            onChange={handleAgeMaxChange}
                            className="w-1/2"
                        />
                    </div>
                </div>

                {/* 身長範囲フィルター */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height Range (cm): {heightRange[0]}-{heightRange[1]}
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="range"
                            min={heightMin}
                            max={heightMax}
                            value={heightRange[0]}
                            onChange={handleHeightMinChange}
                            className="w-1/2"
                        />
                        <input
                            type="range"
                            min={heightMin}
                            max={heightMax}
                            value={heightRange[1]}
                            onChange={handleHeightMaxChange}
                            className="w-1/2"
                        />
                    </div>
                </div>

                {/* 体重範囲フィルター */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight Range (kg): {weightRange[0]}-{weightRange[1]}
                    </label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="range"
                            min={weightMin}
                            max={weightMax}
                            value={weightRange[0]}
                            onChange={handleWeightMinChange}
                            className="w-1/2"
                        />
                        <input
                            type="range"
                            min={weightMin}
                            max={weightMax}
                            value={weightRange[1]}
                            onChange={handleWeightMaxChange}
                            className="w-1/2"
                        />
                    </div>
                </div>

                {/* 日付範囲フィルター - 開始日 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                </div>

                {/* 日付範囲フィルター - 終了日 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                </div>

                {/* フィルター適用ボタン */}
                <div className="lg:col-span-2 flex items-end">
                    <button
                        onClick={handleFilterChange}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterControls; 
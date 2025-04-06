'use client';

import { useState, useEffect } from 'react';
import { Employee } from '../data/mockData';

type FilterControlsProps = {
    employees: Employee[];
    onFilterChange: (filters: {
        gender?: string;
        ageRange?: [number, number];
        heightRange?: [number, number];
        weightRange?: [number, number];
        dateRange?: [string, string];
    }) => void;
};

const FilterControls = ({ employees, onFilterChange }: FilterControlsProps) => {
    const [gender, setGender] = useState<string>('');
    const [ageRange, setAgeRange] = useState<[number, number]>([20, 70]);
    const [heightRange, setHeightRange] = useState<[number, number]>([140, 200]);
    const [weightRange, setWeightRange] = useState<[number, number]>([40, 120]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    // Set default end date to today
    const defaultEndDate = new Date().toISOString().split('T')[0];

    // Set end date to today if not already set
    useEffect(() => {
        if (!endDate) {
            setEndDate(defaultEndDate);
        }
    }, []);

    // Min and max values for sliders
    const ageMin = 20;
    const ageMax = 70;
    const heightMin = 140;
    const heightMax = 200;
    const weightMin = 40;
    const weightMax = 120;

    const handleAgeMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setAgeRange([value, ageRange[1]]);
    };

    const handleAgeMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setAgeRange([ageRange[0], value]);
    };

    const handleHeightMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setHeightRange([value, heightRange[1]]);
    };

    const handleHeightMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setHeightRange([heightRange[0], value]);
    };

    const handleWeightMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setWeightRange([value, weightRange[1]]);
    };

    const handleWeightMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value);
        setWeightRange([weightRange[0], value]);
    };

    const handleFilterChange = () => {
        // For logging purposes
        console.log("Applying filters with date range:", startDate ? [startDate, endDate || defaultEndDate] : undefined);

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
                {/* Gender Filter */}
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

                {/* Age Filter */}
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

                {/* Height Filter */}
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

                {/* Weight Filter */}
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

                {/* Date Range Filter */}
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
// Employee data type
export type Employee = {
  id: number;
  name: string;
  department: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
};

// Sleep data type
export type SleepData = {
  employeeId: number;
  date: string; // ISO date string
  duration: number; // in hours
  efficiency: number; // 0-100
  deepSleepPercentage: number;
  remSleepPercentage: number;
  lightSleepPercentage: number;
};

// Simple deterministic random function with seed
function seededRandom(seed: number): () => number {
  return function() {
    // Simple LCG algorithm
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Create a seeded random generator
const random = seededRandom(12345);

// Fixed departments and genders to ensure consistency
const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
const genders = ['male', 'female', 'other'] as const;

// Generate fixed employees
export const employees: Employee[] = Array.from({ length: 50 }, (_, index) => {
  const gender = genders[index % 2]; // Alternate between first two genders
  // Generate height based on gender (slightly different distributions)
  const baseHeight = gender === 'male' ? 175 : 165;
  const heightVariation = 10;
  const height = Math.round(baseHeight + (random() - 0.5) * heightVariation * 2);
  
  // Generate weight based on height and gender
  const baseWeight = gender === 'male' ? 75 : 60;
  const weightVariation = 15;
  const weight = Math.round(baseWeight + (random() - 0.5) * weightVariation * 2);
  
  return {
    id: index + 1,
    name: `Employee ${index + 1}`,
    department: departments[Math.floor(index % departments.length)],
    age: 25 + (index % 30), // Age between 25-55
    gender,
    height,
    weight
  };
});

// Generate deterministic sleep data for the past 30 days
const today = new Date("2023-12-30"); // Fixed date to ensure consistency
const thirtyDaysAgo = new Date(today);
thirtyDaysAgo.setDate(today.getDate() - 30);

export const sleepData: SleepData[] = [];

employees.forEach(employee => {
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + i);
    
    // Generate deterministic sleep duration
    const baseDuration = 7; // Average sleep hours
    const variation = 2; // +/- variation
    const randomValue = random();
    const noise = (randomValue - 0.5) * variation;
    const duration = Math.max(4, Math.min(10, baseDuration + noise));
    
    // More likely to have good sleep on weekends - but still deterministic
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const efficiencyBase = isWeekend ? 85 : 80;
    const efficiency = Math.min(98, Math.max(60, efficiencyBase + (random() - 0.5) * 20));
    
    // Sleep stages percentages (they should sum up to 100)
    let deepSleepPercentage = Math.min(35, Math.max(10, 20 + (random() - 0.5) * 15));
    let remSleepPercentage = Math.min(30, Math.max(15, 23 + (random() - 0.5) * 15));
    const lightSleepPercentage = 100 - deepSleepPercentage - remSleepPercentage;
    
    sleepData.push({
      employeeId: employee.id,
      date: date.toISOString().split('T')[0],
      duration,
      efficiency,
      deepSleepPercentage,
      remSleepPercentage,
      lightSleepPercentage
    });
  }
});

// Utility functions to calculate statistics
export const getAverageSleepByDate = () => {
  const result: { date: string, average: number }[] = [];
  
  // Group by date
  const dateGroups = sleepData.reduce((groups, item) => {
    if (!groups[item.date]) {
      groups[item.date] = [];
    }
    groups[item.date].push(item.duration);
    return groups;
  }, {} as Record<string, number[]>);
  
  // Calculate averages
  Object.entries(dateGroups).forEach(([date, durations]) => {
    const sum = durations.reduce((a, b) => a + b, 0);
    result.push({
      date,
      average: sum / durations.length
    });
  });
  
  // Sort by date
  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getSleepDistributionByDate = (date: string) => {
  return sleepData.filter(item => item.date === date).map(item => item.duration);
};

export const getEmployeeSleepData = (employeeId: number) => {
  return sleepData.filter(item => item.employeeId === employeeId);
};

export const getEmployeeSleepStatsByPeriod = (employeeId: number, period: 'week' | 'month' | 'all') => {
  const data = getEmployeeSleepData(employeeId);
  
  // Group by week or month
  const periodGroups: Record<string, number[]> = {};
  
  data.forEach(item => {
    const date = new Date(item.date);
    let key: string;
    
    if (period === 'week') {
      // Get week number - use a deterministic approach
      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const dayOffset = firstDayOfMonth.getDay();
      const weekNumber = Math.ceil((date.getDate() + dayOffset) / 7);
      key = `Week ${weekNumber}, ${date.getFullYear()}`;
    } else if (period === 'month') {
      // Month - use fixed names to avoid locale issues
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      key = `${months[date.getMonth()]} ${date.getFullYear()}`;
    } else {
      // 'all' period - use a single key for all data
      key = 'All Time';
    }
    
    if (!periodGroups[key]) {
      periodGroups[key] = [];
    }
    periodGroups[key].push(item.duration);
  });
  
  // Calculate stats
  return Object.entries(periodGroups).map(([period, durations]) => {
    const sum = durations.reduce((a, b) => a + b, 0);
    const average = sum / durations.length;
    
    // Calculate variance
    const variance = durations.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / durations.length;
    
    return {
      period,
      average,
      variance,
      min: Math.min(...durations),
      max: Math.max(...durations),
      count: durations.length
    };
  });
}; 
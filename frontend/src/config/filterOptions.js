// Filter configuration for restaurant list
export const FILTER_OPTIONS = {
  // Time periods for opening hours filter
  timePeriods: [
    { value: 'morning', label: '朝 (6:00-11:00)', icon: '🌅', start: 360, end: 660 },
    { value: 'afternoon', label: '昼 (11:00-14:00)', icon: '☀️', start: 660, end: 840 },
    { value: 'lateafternoon', label: '午後 (14:00-17:00)', icon: '🌤️', start: 840, end: 1020 },
    { value: 'evening', label: '夜 (17:00-22:00)', icon: '🌙', start: 1020, end: 1320 }
  ],

  // Cuisine types
  cuisines: [
    { value: 'Vietnamese', label: 'ベトナム料理', icon: '🍜' },
    { value: 'Japanese', label: '日本料理', icon: '🍱' },
    { value: 'Italian', label: 'イタリアン', icon: '🍕' },
    { value: 'Chinese', label: '中華料理', icon: '🥟' },
    { value: 'Korean', label: '韓国料理', icon: '🍲' },
    { value: 'Thai', label: 'タイ料理', icon: '🌶️' },
    { value: 'French', label: 'フランス料理', icon: '🥖' },
    { value: 'Indian', label: 'インド料理', icon: '🍛' }
  ],

  // Price ranges (based on average price per person in VND)
  priceRanges: [
    { value: '$', label: '〜50,000₫', desc: 'お手頃', min: 0, max: 50000 },
    { value: '$$', label: '50,000₫〜100,000₫', desc: '普通', min: 50000, max: 100000 },
    { value: '$$$', label: '100,000₫〜200,000₫', desc: 'やや高級', min: 100000, max: 200000 },
    { value: '$$$$', label: '200,000₫〜', desc: '高級', min: 200000, max: Infinity }
  ],

  // Rating filters
  ratings: [
    { value: 4.5, label: '4.5以上' },
    { value: 4, label: '4.0以上' },
    { value: 3, label: '3.0以上' }
  ],

  // Distance filters (requires user location)
  distanceFilters: [
    { value: 'near', label: '3km以内', icon: '📍', maxDistance: 3 },
  ]
};

// Helper function to get time period by value
export const getTimePeriod = (value) => {
  return FILTER_OPTIONS.timePeriods.find(period => period.value === value);
};

// Helper function to get price range by value
export const getPriceRange = (value) => {
  return FILTER_OPTIONS.priceRanges.find(range => range.value === value);
};

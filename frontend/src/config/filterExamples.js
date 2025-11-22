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
  // CURRENT: Simple near/far filter
  distanceFilters: [
    { value: 'near', label: '3km以内', icon: '📍', maxDistance: 3 },
    { value: 'far', label: '3km以上', icon: '🚗', minDistance: 3 }
  ]

  // OPTION 1: Multiple specific distances (uncomment to use)
  // distanceFilters: [
  //   { value: '1km', label: '1km以内', icon: '🚶', maxDistance: 1 },
  //   { value: '2km', label: '2km以内', icon: '🚴', maxDistance: 2 },
  //   { value: '5km', label: '5km以内', icon: '🛵', maxDistance: 5 },
  //   { value: '10km', label: '10km以内', icon: '🚗', maxDistance: 10 }
  // ]

  // OPTION 2: Distance ranges (uncomment to use)
  // distanceFilters: [
  //   { value: 'very-near', label: '500m以内', icon: '🚶', maxDistance: 0.5 },
  //   { value: 'near', label: '1-3km', icon: '🚴', minDistance: 1, maxDistance: 3 },
  //   { value: 'medium', label: '3-5km', icon: '🛵', minDistance: 3, maxDistance: 5 },
  //   { value: 'far', label: '5km以上', icon: '🚗', minDistance: 5 }
  // ]

  // OPTION 3: Walking/Driving time estimates (uncomment to use)
  // distanceFilters: [
  //   { value: 'walk-5', label: '徒歩5分 (~400m)', icon: '🚶', maxDistance: 0.4 },
  //   { value: 'walk-15', label: '徒歩15分 (~1.2km)', icon: '🚶‍♂️', maxDistance: 1.2 },
  //   { value: 'bike-10', label: '自転車10分 (~2.5km)', icon: '🚴', maxDistance: 2.5 },
  //   { value: 'drive-10', label: '車10分 (~5km)', icon: '🚗', maxDistance: 5 }
  // ]
};

// Helper function to get time period by value
export const getTimePeriod = (value) => {
  return FILTER_OPTIONS.timePeriods.find(period => period.value === value);
};

// Helper function to get price range by value
export const getPriceRange = (value) => {
  return FILTER_OPTIONS.priceRanges.find(range => range.value === value);
};

// Helper function to get distance filter by value
export const getDistanceFilter = (value) => {
  return FILTER_OPTIONS.distanceFilters.find(filter => filter.value === value);
};

// Location service for getting user location and local news
export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface LocationError {
  code: number;
  message: string;
}

// Get user's current location using browser geolocation API
export const getCurrentLocation = (): Promise<LocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get location details from coordinates
          const locationDetails = await getLocationDetails(latitude, longitude);
          resolve({
            latitude,
            longitude,
            ...locationDetails
          });
        } catch (error) {
          // Return basic location data if reverse geocoding fails
          resolve({
            latitude,
            longitude
          });
        }
      },
      (error) => {
        let message = 'Unknown location error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        reject({
          code: error.code,
          message
        });
      },
      options
    );
  });
};

// Get location details from coordinates using reverse geocoding
const getLocationDetails = async (lat: number, lon: number): Promise<Partial<LocationData>> => {
  try {
    // Using OpenStreetMap Nominatim API (free) - works worldwide
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=en`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    const address = data.address || {};
    
    return {
      city: address.city || address.town || address.village || address.hamlet || address.municipality,
      state: address.state || address.province || address.region || address.county,
      country: address.country,
      zipCode: address.postcode
    };
  } catch (error) {
    console.warn('Failed to get location details:', error);
    return {};
  }
};

// Get local news based on location
export const getLocalNews = async (location: LocationData, query?: string): Promise<SearchResult[]> => {
  // Check if location is in the US
  const isUSLocation = !location.country || 
    location.country.toLowerCase().includes('united states') || 
    location.country.toLowerCase().includes('usa') ||
    location.country.toLowerCase() === 'us';
  
  if (isUSLocation) {
    // Use US local news system
    const { searchAllLocalNews } = await import('./localNewsAPIs');
    
    if (query) {
      return await searchAllLocalNews(query, location);
    }
    return generateGeneralLocalNews(location);
  } else {
    // Use international news system
    return generateInternationalLocalNews(location, query);
  }
};

// Generate international local news for non-US locations
const generateInternationalLocalNews = (location: LocationData, query?: string): SearchResult[] => {
  const country = location.country || 'your country';
  const city = location.city || 'your city';
  const region = location.state || 'your region';
  
  const locationName = city !== 'your city' ? 
    `${city}, ${country}` : 
    country;
  
  const internationalNews: SearchResult[] = [
    {
      id: 'intl-local-1',
      title: query ? 
        `${query}: Local Impact in ${locationName}` :
        `Local News from ${locationName}`,
      description: `Local news and community updates from ${locationName}`,
      content: query ?
        `Local coverage of ${query} and its impact on ${locationName}. This includes perspectives from local residents, businesses, and community leaders on how this topic affects the local area.` :
        `Local news coverage from ${locationName} including community events, local government updates, business news, and regional developments affecting residents.`,
      url: '#',
      source: `${locationName} Local News`,
      publishedAt: new Date().toISOString(),
      author: 'Local Correspondents',
      viewpoint: 'international local',
      keywords: ['international local news', country.toLowerCase(), city.toLowerCase(), 'community coverage']
    },
    {
      id: 'intl-local-2',
      title: query ?
        `${country} National Perspective on ${query}` :
        `National News from ${country}`,
      description: `National news coverage from ${country}`,
      content: query ?
        `National coverage from ${country} examining ${query} from the perspective of ${country}'s media, government, and public opinion. This provides insight into how the topic is viewed and discussed within ${country}.` :
        `National news coverage from ${country} including government updates, economic developments, cultural events, and major stories affecting the country.`,
      url: '#',
      source: `${country} National News`,
      publishedAt: new Date().toISOString(),
      author: 'National Correspondents',
      viewpoint: 'international national',
      keywords: ['international news', country.toLowerCase(), 'national coverage', 'international perspective']
    }
  ];
  
  // Add regional news if we have state/province information
  if (region && region !== 'your region') {
    internationalNews.push({
      id: 'intl-local-3',
      title: query ?
        `${region} Regional Coverage of ${query}` :
        `Regional News from ${region}`,
      description: `Regional news coverage from ${region}, ${country}`,
      content: query ?
        `Regional coverage from ${region} examining how ${query} affects the broader regional area within ${country}. This includes provincial or state-level perspectives and regional implications.` :
        `Regional news from ${region} covering provincial or state-level developments, regional economy, local politics, and community issues affecting the broader area.`,
      url: '#',
      source: `${region} Regional News`,
      publishedAt: new Date().toISOString(),
      author: 'Regional Reporters',
      viewpoint: 'international regional',
      keywords: ['regional news', region.toLowerCase(), country.toLowerCase(), 'provincial coverage']
    });
  }
  
  return internationalNews;
};

// Generate general local news when no specific query is provided
const generateGeneralLocalNews = (location: LocationData): SearchResult[] => {
  const localQueries = [];
  
  // Build location-specific search queries
  if (location.city) {
    localQueries.push(`${location.city} news`);
  }
  
  if (location.state) {
    localQueries.push(`${location.state} news`);
  }
  
  if (location.zipCode) {
    localQueries.push(`${location.zipCode} local news`);
  }
  
  // Add general local search terms
  localQueries.push('local news near me');
  localQueries.push('community news');
  localQueries.push('regional news');
  
  const cityName = location.city || 'Your Area';
  const stateName = location.state || 'Your State';
  
  const generalNews: SearchResult[] = [
    {
      id: 'local-1',
      title: `${cityName} City Council Approves New Development Project`,
      description: `Local government approves major development initiative in ${cityName}`,
      content: `The ${cityName} City Council voted unanimously to approve a new mixed-use development project that will bring affordable housing and retail spaces to the downtown area. The project is expected to create 200 jobs and provide 150 new housing units.`,
      url: '#',
      source: `${cityName} Local News`,
      publishedAt: new Date().toISOString(),
      author: 'Local Reporter',
      viewpoint: 'local community',
      keywords: ['local news', 'city council', 'development', cityName.toLowerCase()]
    },
    {
      id: 'local-2',
      title: `Weather Alert: ${stateName} Prepares for Weekend Storm`,
      description: `Local weather services issue advisory for upcoming weather conditions`,
      content: `The National Weather Service has issued a weather advisory for ${stateName}, with potential for heavy rainfall and strong winds expected this weekend. Residents are advised to secure outdoor items and avoid unnecessary travel during peak storm hours.`,
      url: '#',
      source: `${stateName} Weather Service`,
      publishedAt: new Date().toISOString(),
      author: 'Weather Team',
      viewpoint: 'local weather',
      keywords: ['weather', 'local weather', 'storm', stateName.toLowerCase()]
    },
    {
      id: 'local-3',
      title: `${cityName} Schools Announce New STEM Program`,
      description: `Local education initiative focuses on science and technology`,
      content: `${cityName} Public Schools announced a new STEM education program that will provide students with hands-on experience in science, technology, engineering, and mathematics. The program launches next semester with support from local tech companies.`,
      url: '#',
      source: `${cityName} Education News`,
      publishedAt: new Date().toISOString(),
      author: 'Education Reporter',
      viewpoint: 'local education',
      keywords: ['education', 'STEM', 'schools', cityName.toLowerCase()]
    }
  ];
  
  return generalNews;
};

// Check if location permission is granted
export const checkLocationPermission = async (): Promise<boolean> => {
  if (!navigator.permissions) {
    return false;
  }
  
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return permission.state === 'granted';
  } catch (error) {
    return false;
  }
};

// Save location to localStorage for future use
export const saveLocationToStorage = (location: LocationData): void => {
  try {
    localStorage.setItem('userLocation', JSON.stringify({
      ...location,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to save location to storage:', error);
  }
};

// Get saved location from localStorage
export const getSavedLocation = (): LocationData | null => {
  try {
    const saved = localStorage.getItem('userLocation');
    if (!saved) return null;
    
    const data = JSON.parse(saved);
    const sixHours = 6 * 60 * 60 * 1000; // Extended to 6 hours for international users
    
    // Check if location is less than 6 hours old
    if (Date.now() - data.timestamp < sixHours) {
      return data;
    }
    
    // Remove expired location
    localStorage.removeItem('userLocation');
    return null;
  } catch (error) {
    return null;
  }
};

// Check if location is in the United States
export const isUSLocation = (location: LocationData): boolean => {
  if (!location.country) return true; // Assume US if no country specified
  
  const country = location.country.toLowerCase();
  return country.includes('united states') || 
         country.includes('usa') || 
         country === 'us' ||
         country === 'america';
};

// Get location display name for international locations
export const getLocationDisplayName = (location: LocationData): string => {
  if (isUSLocation(location)) {
    return location.city ? 
      `${location.city}, ${location.state}` : 
      location.state || 'United States';
  } else {
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.state && location.state !== location.city) parts.push(location.state);
    if (location.country) parts.push(location.country);
    return parts.join(', ') || 'International Location';
  }
};

// Get appropriate local news message for international users
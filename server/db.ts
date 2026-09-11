import fs from 'fs';
import path from 'path';
import { 
  Bhandara, 
  Organizer, 
  Review, 
  EventConfirmation, 
  Report, 
  SavedBhandara, 
  AuditLog, 
  EventUpdate, 
  User, 
  AdminMetrics, 
  CityInfo,
  EventStatus
} from '../src/types/index.js';

interface DatabaseSchema {
  users: User[];
  bhandaras: Bhandara[];
  organizers: Organizer[];
  reviews: Review[];
  confirmations: EventConfirmation[];
  reports: Report[];
  savedBhandaras: SavedBhandara[];
  auditLogs: AuditLog[];
  eventUpdates: EventUpdate[];
}

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'annsetu_store.json');

// Indian Cities & Major Localities
export const CITIES_DATA: CityInfo[] = [
  {
    name: 'Delhi NCR',
    slug: 'delhi',
    state: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    localities: ['Chandni Chowk', 'Connaught Place', 'Rohini', 'Laxmi Nagar', 'Karol Bagh', 'Noida Sector 18', 'Ghaziabad', 'Gurugram Sector 29']
  },
  {
    name: 'Varanasi',
    slug: 'varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    localities: ['Kashi Vishwanath Marg', 'Assi Ghat', 'Sankat Mochan', 'Godowlia', 'Durgakund', 'Lanka', 'Cantonment']
  },
  {
    name: 'Lucknow',
    slug: 'lucknow',
    state: 'Uttar Pradesh',
    lat: 26.8467,
    lng: 80.9462,
    localities: ['Hanuman Setu Marg', 'Hazratganj', 'Alambagh', 'Chowk', 'Gomti Nagar', 'Indira Nagar', 'Charbagh']
  },
  {
    name: 'Ayodhya',
    slug: 'ayodhya',
    state: 'Uttar Pradesh',
    lat: 26.7922,
    lng: 82.1998,
    localities: ['Ram Janmabhoomi Marg', 'Hanuman Garhi', 'Naya Ghat', 'Kanak Bhawan', 'Tedhi Bazaar', 'Faizabad Chowk']
  },
  {
    name: 'Haridwar',
    slug: 'haridwar',
    state: 'Uttarakhand',
    lat: 29.9457,
    lng: 78.1642,
    localities: ['Har Ki Pauri', 'Kankhal', 'Bhopatwala', 'Jwalapur', 'Bada Bazaar', 'Shivalik Nagar']
  },
  {
    name: 'Jaipur',
    slug: 'jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    localities: ['City Palace Marg', 'Moti Dungri', 'Johari Bazaar', 'Malviya Nagar', 'Vaishali Nagar', 'Mansarovar']
  },
  {
    name: 'Mathura - Vrindavan',
    slug: 'mathura-vrindavan',
    state: 'Uttar Pradesh',
    lat: 27.5706,
    lng: 77.6593,
    localities: ['Bankey Bihari Marg', 'Prem Mandir Road', 'Krishna Janmabhoomi', 'Raman Reti', 'Chhatikara Road', 'Vishram Ghat']
  },
  {
    name: 'Prayagraj',
    slug: 'prayagraj',
    state: 'Uttar Pradesh',
    lat: 25.4358,
    lng: 81.8463,
    localities: ['Sangam Marg', 'Civil Lines', 'Alopi Devi Marg', 'Katra', 'George Town', 'Naini']
  },
  {
    name: 'Mumbai',
    slug: 'mumbai',
    state: 'Maharashtra',
    lat: 19.0760,
    lng: 72.8777,
    localities: ['Prabhadevi', 'Dadar West', 'Girgaon Chowpatty', 'Goregaon East', 'Borivali West', 'Ghatkopar East']
  },
  {
    name: 'Indore',
    slug: 'indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    localities: ['Khajrana', 'Rajwada', 'Vijay Nagar', 'Sarafa', 'Palasia', 'Bhawarkua']
  }
];

// Helper: Haversine distance in km
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper: Format distance Indian-style
export function formatIndianDistance(km?: number): string {
  if (km === undefined || isNaN(km)) return '';
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

// Strict Pure Vegetarian Food Policy Validator
export const NON_VEG_KEYWORDS = [
  'chicken', 'mutton', 'beef', 'pork', 'fish', 'seafood', 'prawn', 'shrimp',
  'crab', 'meat', 'gosht', 'egg', 'anda', 'ande', 'omelette', 'non-veg', 'nonveg',
  'bacon', 'ham', 'sausage', 'lamb', 'keema', 'biryani non', 'murgh', 'machli',
  'halal meat', 'tandoori chicken', 'kebab', 'seekh'
];

export function validatePureVegetarianFood(fields: {
  name?: string;
  foodType?: string;
  foodItems?: string[];
  description?: string;
}): { isValid: boolean; flaggedTerm?: string } {
  const combinedText = [
    fields.name || '',
    fields.foodType || '',
    ...(fields.foodItems || []),
    fields.description || ''
  ].join(' ').toLowerCase();

  for (const term of NON_VEG_KEYWORDS) {
    const regex = new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, 'i');
    if (regex.test(combinedText)) {
      return { isValid: false, flaggedTerm: term };
    }
  }
  return { isValid: true };
}

// Helper: Dynamic Event Status calculation in Asia/Kolkata
export function calculateDynamicStatus(
  eventDate: string, 
  startTime: string, 
  endTime: string, 
  currentStatus: EventStatus
): EventStatus {
  if (currentStatus === 'CANCELLED') return 'CANCELLED';

  try {
    // Current time in IST
    const now = new Date();
    // Convert now to Asia/Kolkata string parts
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);

    const [year, month, day] = eventDate.split('-').map(Number);
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const eventStart = new Date(istDate);
    eventStart.setFullYear(year, month - 1, day);
    eventStart.setHours(startH, startM, 0, 0);

    const eventEnd = new Date(istDate);
    eventEnd.setFullYear(year, month - 1, day);
    eventEnd.setHours(endH, endM, 0, 0);

    // If end time is before start time, it rolls over midnight
    if (eventEnd.getTime() < eventStart.getTime()) {
      eventEnd.setDate(eventEnd.getDate() + 1);
    }

    const nowMs = istDate.getTime();
    const startMs = eventStart.getTime();
    const endMs = eventEnd.getTime();

    // 60 minutes threshold for STARTING_SOON
    const startingSoonThresholdMs = 60 * 60 * 1000;

    if (nowMs >= startMs && nowMs <= endMs) {
      return 'HAPPENING_NOW';
    } else if (nowMs >= (startMs - startingSoonThresholdMs) && nowMs < startMs) {
      return 'STARTING_SOON';
    } else if (nowMs < startMs) {
      return 'UPCOMING';
    } else {
      return 'ENDED';
    }
  } catch {
    return currentStatus || 'UPCOMING';
  }
}

// Initial Seeds with dynamic dates based on today's Indian date
function generateInitialData(): DatabaseSchema {
  const now = new Date();
  const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // Tomorrow
  const tomorrow = new Date(istDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  // Day after tomorrow
  const dayAfter = new Date(istDate);
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = `${dayAfter.getFullYear()}-${String(dayAfter.getMonth() + 1).padStart(2, '0')}-${String(dayAfter.getDate()).padStart(2, '0')}`;

  const currentHour = istDate.getHours();
  const currentMinute = istDate.getMinutes();

  // Create one that is definitely HAPPENING_NOW right now
  const activeStartHour = Math.max(0, currentHour - 1);
  const activeEndHour = Math.min(23, currentHour + 2);
  const activeStartStr = `${String(activeStartHour).padStart(2, '0')}:00`;
  const activeEndStr = `${String(activeEndHour).padStart(2, '0')}:00`;

  // Create one that is STARTING_SOON (in next 30-45 mins)
  let soonStartHour = currentHour;
  let soonStartMinute = currentMinute + 25;
  if (soonStartMinute >= 60) {
    soonStartHour = (soonStartHour + 1) % 24;
    soonStartMinute = soonStartMinute % 60;
  }
  const soonStartStr = `${String(soonStartHour).padStart(2, '0')}:${String(soonStartMinute).padStart(2, '0')}`;
  const soonEndHour = (soonStartHour + 3) % 24;
  const soonEndStr = `${String(soonEndHour).padStart(2, '0')}:00`;

  const users: User[] = [
    {
      id: 'usr_superadmin',
      email: 'admin@annsetu.in',
      name: 'Utsav Srivastava',
      role: 'SUPER_ADMIN',
      city: 'Delhi NCR',
      phone: '+91 98765 43210',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_admin_varanasi',
      email: 'mod.kashi@annsetu.in',
      name: 'Pandit Rajesh Shastri',
      role: 'ADMIN',
      city: 'Varanasi',
      phone: '+91 98111 22233',
      createdAt: '2026-02-15T00:00:00.000Z'
    },
    {
      id: 'usr_org_hanuman',
      email: 'organizer.delhi@annsetu.in',
      name: 'Rameshwar Dayal Gupta',
      role: 'ORGANIZER',
      city: 'Delhi NCR',
      phone: '+91 98222 33344',
      createdAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'usr_devotee',
      email: 'devotee@annsetu.in',
      name: 'Pooja Sharma',
      role: 'USER',
      city: 'Delhi NCR',
      phone: '+91 98333 44455',
      createdAt: '2026-03-10T00:00:00.000Z'
    }
  ];

  const organizers: Organizer[] = [
    {
      id: 'org_1',
      name: 'Shri Pracheen Hanuman Mandir Sewa Samiti',
      slug: 'shri-pracheen-hanuman-mandir-sewa-samiti',
      description: 'Serving hot freshly cooked Satvik Mahaprasad every Tuesday and Saturday at Connaught Place to thousands of devotees.',
      logo: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?w=300&auto=format&fit=crop&q=80',
      contactPhone: '+91 98101 23456',
      contactEmail: 'hanumansewa.cp@gmail.com',
      address: 'Baba Kharak Singh Marg, Connaught Place',
      city: 'Delhi NCR',
      verificationStatus: 'VERIFIED',
      eventsCount: 42,
      followersCount: 1850,
      createdAt: '2025-06-01T00:00:00.000Z',
      updatedAt: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'org_2',
      name: 'Maa Annapurna Rasoi Trust Varanasi',
      slug: 'maa-annapurna-rasoi-trust-varanasi',
      description: 'Daily unceasing divine Anna Daan in the holy spiritual heart of Kashi near Vishwanath Corridor.',
      logo: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=300&auto=format&fit=crop&q=80',
      contactPhone: '+91 94152 78901',
      contactEmail: 'annapurnarasoi.kashi@gmail.com',
      address: 'Near Vishwanath Corridor Gate 4, Godowlia',
      city: 'Varanasi',
      verificationStatus: 'VERIFIED',
      eventsCount: 128,
      followersCount: 3420,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2026-09-05T00:00:00.000Z'
    },
    {
      id: 'org_3',
      name: 'Hanuman Setu Temple Bhoj Mandal',
      slug: 'hanuman-setu-temple-bhoj-mandal',
      description: 'Traditional community Bhandara serving warm Kadhi Chawal, Puri Sabzi, and Kheer by Lucknow University bank.',
      logo: 'https://images.unsplash.com/photo-1542332213-31f87348057f?w=300&auto=format&fit=crop&q=80',
      contactPhone: '+91 94500 11223',
      contactEmail: 'hanumansetu.lucknow@gmail.com',
      address: 'University Road, Hasanganj',
      city: 'Lucknow',
      verificationStatus: 'VERIFIED',
      eventsCount: 36,
      followersCount: 920,
      createdAt: '2025-09-12T00:00:00.000Z',
      updatedAt: '2026-08-20T00:00:00.000Z'
    },
    {
      id: 'org_4',
      name: 'Sri Ram Sewa Samiti Ayodhya',
      slug: 'sri-ram-sewa-samiti-ayodhya',
      description: 'Organizing grand community feasts for pilgrims visiting Shri Ram Janmabhoomi Mandir.',
      logo: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&auto=format&fit=crop&q=80',
      contactPhone: '+91 94150 99887',
      contactEmail: 'ramsewasamiti.ayodhya@gmail.com',
      address: 'Near Naya Ghat, Ram Path',
      city: 'Ayodhya',
      verificationStatus: 'VERIFIED',
      eventsCount: 65,
      followersCount: 2780,
      createdAt: '2025-04-05T00:00:00.000Z',
      updatedAt: '2026-09-02T00:00:00.000Z'
    },
    {
      id: 'org_5',
      name: 'Bankey Bihari Bhakt Sangathan',
      slug: 'bankey-bihari-bhakt-sangathan',
      description: 'Devotee-run trust organizing weekly Malpua and Khichdi Prasad distribution in Vrindavan.',
      contactPhone: '+91 98370 44556',
      contactEmail: 'vrindavanbhakts@gmail.com',
      address: 'Near VIP Road, Raman Reti',
      city: 'Mathura - Vrindavan',
      verificationStatus: 'PENDING',
      eventsCount: 14,
      followersCount: 410,
      createdAt: '2026-05-18T00:00:00.000Z',
      updatedAt: '2026-08-30T00:00:00.000Z'
    }
  ];

  const bhandaras: Bhandara[] = [
    {
      id: 'bhan_delhi_cp',
      slug: 'pracheen-hanuman-mandir-maha-bhandara-cp',
      name: 'Pracheen Hanuman Mandir Maha Bhandara',
      description: 'Grand community feast featuring hot crispy Puris, spicy Aloo Tamatar Sabzi, Suji Halwa with dry fruits, and chilled sweet Boondi Prasad. Free and open to all devotees, pilgrims, workers, and visitors.',
      eventDate: todayStr,
      startTime: activeStartStr,
      endTime: activeEndStr,
      timezone: 'Asia/Kolkata',
      venue: 'Pracheen Hanuman Mandir Complex',
      address: 'Baba Kharak Singh Marg, Hanuman Mandir Complex, Connaught Place',
      locality: 'Connaught Place',
      city: 'Delhi NCR',
      latitude: 28.6304,
      longitude: 77.2144,
      organizerId: 'org_1',
      organizerName: 'Shri Pracheen Hanuman Mandir Sewa Samiti',
      organizerPhone: '+91 98101 23456',
      createdBy: 'usr_org_hanuman',
      status: 'HAPPENING_NOW',
      moderationStatus: 'APPROVED',
      verificationStatus: 'VERIFIED_ORGANIZER',
      lastConfirmedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(), // 18 mins ago
      foodType: 'Puri Sabzi & Halwa',
      foodItems: ['Puri', 'Aloo Tamatar Sabzi', 'Suji Halwa', 'Boondi Prasad'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '3,000+ devotees',
      facilities: ['Drinking Water Station', 'Sitting Arrangement', 'Separate Queue for Seniors', 'Prasad Packing Allowed', 'Volunteer Assistance'],
      posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 1420,
      savesCount: 184,
      sharesCount: 95,
      directionsClicks: 312,
      positiveConfirmationsCount: 47,
      negativeConfirmationsCount: 1,
      createdAt: '2026-09-08T10:00:00.000Z',
      updatedAt: '2026-09-10T14:30:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_delhi_chandni_chowk',
      slug: 'sri-gauri-shankar-mandir-annadan-chandni-chowk',
      name: 'Sri Gauri Shankar Mandir Pavitra Annadan',
      description: 'Continuous community Bhandara on the occasion of Purnima. Serving nutritious Desi Ghee Moong Dal Khichdi, Kaddu ki Khatthi Meethi Sabzi, and Kheer Prasad.',
      eventDate: todayStr,
      startTime: soonStartStr,
      endTime: soonEndStr,
      timezone: 'Asia/Kolkata',
      venue: 'Sri Gauri Shankar Mandir Dharmshala Hall',
      address: 'Main Road opposite Red Fort, Chandni Chowk',
      locality: 'Chandni Chowk',
      city: 'Delhi NCR',
      latitude: 28.6562,
      longitude: 77.2340,
      organizerName: 'Chandni Chowk Dharmarth Trust',
      organizerPhone: '+91 98112 34567',
      createdBy: 'usr_devotee',
      status: 'STARTING_SOON',
      moderationStatus: 'APPROVED',
      verificationStatus: 'COMMUNITY_CONFIRMED',
      lastConfirmedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      foodType: 'Khichdi Prasad',
      foodItems: ['Moong Dal Khichdi', 'Kaddu Sabzi', 'Kheer Prasad'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '1,500 devotees',
      facilities: ['Drinking Water Station', 'Indoor Dining Hall', 'Clean Washrooms'],
      posterUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 890,
      savesCount: 112,
      sharesCount: 64,
      directionsClicks: 145,
      positiveConfirmationsCount: 22,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-09T08:15:00.000Z',
      updatedAt: '2026-09-10T12:00:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_varanasi_vishwanath',
      slug: 'kashi-annapurna-dhaam-maha-prasad-varanasi',
      name: 'Maa Annapurna Dhaam Akhand Maha Bhandara',
      description: 'Daily sacred Bhojan Prasad in the holy land of Shiva. Devotees receive warm Pulao, Dal Makhani, Paneer Sabzi, Roti, and Banarasi Kheer with tulsi patra.',
      eventDate: todayStr,
      startTime: activeStartStr,
      endTime: activeEndStr,
      timezone: 'Asia/Kolkata',
      venue: 'Annapurna Rasoi Hall, Gate 4',
      address: 'Vishwanath Corridor Marg, Near Godowlia Chowk',
      locality: 'Kashi Vishwanath Marg',
      city: 'Varanasi',
      latitude: 25.3109,
      longitude: 83.0104,
      organizerId: 'org_2',
      organizerName: 'Maa Annapurna Rasoi Trust Varanasi',
      organizerPhone: '+91 94152 78901',
      createdBy: 'usr_admin_varanasi',
      status: 'HAPPENING_NOW',
      moderationStatus: 'APPROVED',
      verificationStatus: 'VERIFIED_ORGANIZER',
      lastConfirmedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      foodType: 'Complete Mahaprasad',
      foodItems: ['Pulao', 'Dal Makhani', 'Paneer Sabzi', 'Roti', 'Banarasi Kheer'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '5,000+ devotees',
      facilities: ['Grand Dining Hall', 'Purified RO Water', 'Wheelchair Access', 'Prasad Counters'],
      posterUrl: 'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1609342122563-a43ac8917a3a?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 2310,
      savesCount: 340,
      sharesCount: 180,
      directionsClicks: 520,
      positiveConfirmationsCount: 88,
      negativeConfirmationsCount: 1,
      createdAt: '2026-09-01T06:00:00.000Z',
      updatedAt: '2026-09-10T16:00:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_lucknow_setu',
      slug: 'hanuman-setu-mangalwar-bhandara-lucknow',
      name: 'Hanuman Setu Temple Shubh Mangalwar Bhandara',
      description: 'Famous Lucknow Tuesday Bhandara serving piping hot Kadhi Chawal with Bundi Raita, Aloo Kachori, and Boondi. Organized with unconditional love for all.',
      eventDate: tomorrowStr,
      startTime: '11:30',
      endTime: '16:00',
      timezone: 'Asia/Kolkata',
      venue: 'Hanuman Setu Temple Ghat Ground',
      address: 'University Road, Near Gomti River Bridge, Hasanganj',
      locality: 'Hanuman Setu Marg',
      city: 'Lucknow',
      latitude: 26.8622,
      longitude: 80.9388,
      organizerId: 'org_3',
      organizerName: 'Hanuman Setu Temple Bhoj Mandal',
      organizerPhone: '+91 94500 11223',
      createdBy: 'usr_superadmin',
      status: 'UPCOMING',
      moderationStatus: 'APPROVED',
      verificationStatus: 'VERIFIED_ORGANIZER',
      lastConfirmedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      foodType: 'Kadhi Chawal',
      foodItems: ['Kadhi Chawal', 'Boondi Raita', 'Aloo Kachori', 'Boondi'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '2,500 devotees',
      facilities: ['Drinking Water', 'Sitting Mats', 'Volunteers for Senior Citizens'],
      posterUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 1150,
      savesCount: 195,
      sharesCount: 104,
      directionsClicks: 210,
      positiveConfirmationsCount: 35,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-05T09:00:00.000Z',
      updatedAt: '2026-09-10T11:00:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_ayodhya_rampath',
      slug: 'shri-ram-janmabhoomi-tirth-kshetra-maha-bhandara',
      name: 'Shri Ram Janmabhoomi Marg Pavitra Bhojan Sewa',
      description: 'Grand continuous Anna Seva for Ram Bhakts and pilgrims arriving in holy Ayodhya. Pure Satvik meal prepared with Desi Ghee including Besan Laddoo, Poori, Chana Masala, and Kheer.',
      eventDate: todayStr,
      startTime: activeStartStr,
      endTime: activeEndStr,
      timezone: 'Asia/Kolkata',
      venue: 'Ram Path Community Pandal #7',
      address: 'Near Naya Ghat Crossing, Ram Path',
      locality: 'Ram Janmabhoomi Marg',
      city: 'Ayodhya',
      latitude: 26.7994,
      longitude: 82.2032,
      organizerId: 'org_4',
      organizerName: 'Sri Ram Sewa Samiti Ayodhya',
      organizerPhone: '+91 94150 99887',
      createdBy: 'usr_superadmin',
      status: 'HAPPENING_NOW',
      moderationStatus: 'APPROVED',
      verificationStatus: 'VERIFIED_ORGANIZER',
      lastConfirmedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      foodType: 'Special Festival Bhoj',
      foodItems: ['Puri', 'Chana Masala', 'Besan Laddoo', 'Kheer'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '8,000+ devotees',
      facilities: ['Sheltered Dining Area', 'Chilled Mineral Water', 'Wheelchair Support', 'Medical Helpdesk'],
      posterUrl: 'https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 3840,
      savesCount: 520,
      sharesCount: 310,
      directionsClicks: 790,
      positiveConfirmationsCount: 114,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-02T12:00:00.000Z',
      updatedAt: '2026-09-10T17:00:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_haridwar_harkipauri',
      slug: 'ganga-kinare-annakshetra-bhandara-haridwar',
      name: 'Maa Ganga Ghat Akhand Annakshetra',
      description: 'Daily divine Prasad distribution along the holy banks of Har Ki Pauri. Devotees receive warm Dal Chawal, Aloo Gobhi, and Halwa Prasad with Ganga Jal.',
      eventDate: tomorrowStr,
      startTime: '12:00',
      endTime: '15:30',
      timezone: 'Asia/Kolkata',
      venue: 'Shri Ganga Sabha Dharmshala Pavitra Bhavan',
      address: 'Subhash Ghat Marg, Near Har Ki Pauri',
      locality: 'Har Ki Pauri',
      city: 'Haridwar',
      latitude: 29.9568,
      longitude: 78.1709,
      organizerName: 'Haridwar Sadhu Sewa Mandal',
      organizerPhone: '+91 98970 12345',
      createdBy: 'usr_devotee',
      status: 'UPCOMING',
      moderationStatus: 'APPROVED',
      verificationStatus: 'COMMUNITY_CONFIRMED',
      lastConfirmedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      foodType: 'Puri Sabzi & Halwa',
      foodItems: ['Dal Chawal', 'Aloo Gobhi', 'Halwa Prasad'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '2,000 devotees',
      facilities: ['Riverfront Seating', 'RO Filtered Water', 'Separate Line for Sadhus & Elderly'],
      posterUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 780,
      savesCount: 98,
      sharesCount: 42,
      directionsClicks: 160,
      positiveConfirmationsCount: 19,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-07T11:00:00.000Z',
      updatedAt: '2026-09-10T09:30:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_jaipur_motidungri',
      slug: 'moti-dungri-ganesh-ji-bhandara-jaipur',
      name: 'Moti Dungri Ganesh Ji Mahaprasad',
      description: 'Traditional Rajasthani Dal Baati Churma Mahaprasad prepared with pure Desi Ghee on Wednesday in celebration of Lord Ganesha.',
      eventDate: dayAfterStr,
      startTime: '12:30',
      endTime: '17:00',
      timezone: 'Asia/Kolkata',
      venue: 'Moti Dungri Temple Community Compound',
      address: 'Moti Doongri Road, Tilak Nagar',
      locality: 'Moti Dungri',
      city: 'Jaipur',
      latitude: 26.8928,
      longitude: 75.8197,
      organizerName: 'Jaipur Ganesh Bhakt Mandali',
      organizerPhone: '+91 94140 55667',
      createdBy: 'usr_devotee',
      status: 'UPCOMING',
      moderationStatus: 'APPROVED',
      verificationStatus: 'COMMUNITY_CONFIRMED',
      lastConfirmedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      foodType: 'Dal Baati Churma',
      foodItems: ['Dal Baati', 'Churma', 'Ghee Khichdi'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '3,500 devotees',
      facilities: ['Shaded Pandal', 'Cool Drinking Water', 'Two-Wheeler Parking'],
      posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 940,
      savesCount: 142,
      sharesCount: 88,
      directionsClicks: 195,
      positiveConfirmationsCount: 26,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-08T15:00:00.000Z',
      updatedAt: '2026-09-10T08:00:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_delhi_rohini',
      slug: 'rohini-sector-9-sai-mandir-khichdi-bhandara',
      name: 'Shri Shirdi Sai Baba Mandir Brihaspativar Bhandara',
      description: 'Thursday special Palak Khichdi, Boondi Raita, and Gulab Jamun Prasad distributed to devotees and passersby.',
      eventDate: todayStr,
      startTime: activeStartStr,
      endTime: activeEndStr,
      timezone: 'Asia/Kolkata',
      venue: 'Sai Baba Mandir Complex, Sector 9',
      address: 'Near DC Chowk, Sector 9, Rohini',
      locality: 'Rohini',
      city: 'Delhi NCR',
      latitude: 28.7118,
      longitude: 77.1189,
      organizerName: 'Rohini Sai Devotees Trust',
      organizerPhone: '+91 98711 44556',
      createdBy: 'usr_devotee',
      status: 'HAPPENING_NOW',
      moderationStatus: 'APPROVED',
      verificationStatus: 'COMMUNITY_CONFIRMED',
      lastConfirmedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      foodType: 'Khichdi Prasad',
      foodItems: ['Palak Khichdi', 'Boondi Raita', 'Gulab Jamun'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '1,200 attendees',
      facilities: ['Clean Sitting Arrangement', 'Chilled Water Cooler'],
      posterUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 620,
      savesCount: 78,
      sharesCount: 35,
      directionsClicks: 110,
      positiveConfirmationsCount: 18,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-09T14:00:00.000Z',
      updatedAt: '2026-09-10T13:00:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_vrindavan_bankey',
      slug: 'vrindavan-raman-reti-malpua-bhandara',
      name: 'Vrindavan Raman Reti Radhe Radhe Bhoj',
      description: 'Special Radhashtami Utsav Bhandara offering fresh Malpua, Makhan Mishri, Kadhi Pakoda, and Rice.',
      eventDate: tomorrowStr,
      startTime: '12:00',
      endTime: '16:00',
      timezone: 'Asia/Kolkata',
      venue: 'Radha Kunj Ashram Hall',
      address: 'VIP Road near Raman Reti Chauraha',
      locality: 'Bankey Bihari Marg',
      city: 'Mathura - Vrindavan',
      latitude: 27.5815,
      longitude: 77.6890,
      organizerId: 'org_5',
      organizerName: 'Bankey Bihari Bhakt Sangathan',
      organizerPhone: '+91 98370 44556',
      createdBy: 'usr_devotee',
      status: 'UPCOMING',
      moderationStatus: 'APPROVED',
      verificationStatus: 'PENDING_VERIFICATION',
      lastConfirmedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      foodType: 'Special Festival Bhoj',
      foodItems: ['Malpua', 'Makhan Mishri', 'Kadhi Pakoda', 'Rice'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '1,800 devotees',
      facilities: ['Sitting Hall', 'Drinking Water'],
      posterUrl: 'https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1542332213-31f87348057f?w=800&auto=format&fit=crop&q=80'
      ],
      viewsCount: 510,
      savesCount: 64,
      sharesCount: 29,
      directionsClicks: 82,
      positiveConfirmationsCount: 12,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-08T16:00:00.000Z',
      updatedAt: '2026-09-10T10:00:00.000Z',
      isDevelopmentSeed: true
    },
    {
      id: 'bhan_pending_delhi_laxmi',
      slug: 'laxmi-nagar-community-prasad-sewa',
      name: 'Laxmi Nagar Vikas Marg Navratri Bhandara',
      description: 'Submitted community event pending administrative moderation: Chhole Bhature and Halwa distribution.',
      eventDate: tomorrowStr,
      startTime: '13:00',
      endTime: '16:00',
      timezone: 'Asia/Kolkata',
      venue: 'Opposite Metro Pillar 38, Main Market',
      address: 'Main Vikas Marg, Laxmi Nagar',
      locality: 'Laxmi Nagar',
      city: 'Delhi NCR',
      latitude: 28.6310,
      longitude: 77.2773,
      organizerName: 'East Delhi Vyapar Sangh',
      organizerPhone: '+91 98109 87654',
      createdBy: 'usr_devotee',
      status: 'UPCOMING',
      moderationStatus: 'PENDING',
      verificationStatus: 'COMMUNITY_ADDED',
      foodType: 'Chhole Bhature',
      foodItems: ['Chhole Bhature', 'Suji Halwa'],
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: '800 attendees',
      facilities: ['Drinking Water'],
      photos: [],
      viewsCount: 15,
      savesCount: 2,
      sharesCount: 1,
      directionsClicks: 4,
      positiveConfirmationsCount: 1,
      negativeConfirmationsCount: 0,
      createdAt: '2026-09-10T20:00:00.000Z',
      updatedAt: '2026-09-10T20:00:00.000Z',
      isDevelopmentSeed: true
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      bhandaraId: 'bhan_delhi_cp',
      userId: 'usr_devotee',
      userName: 'Pooja Sharma',
      attended: true,
      infoAccuracyRating: 5,
      locationAccuracyRating: 5,
      timingAccuracyRating: 5,
      overallRating: 5,
      comments: 'Very well organized! The food was fresh, hot, and hygienic. Separate line for senior citizens was extremely helpful for my grandmother.',
      status: 'APPROVED',
      createdAt: '2026-09-08T16:45:00.000Z'
    },
    {
      id: 'rev_2',
      bhandaraId: 'bhan_varanasi_vishwanath',
      userId: 'usr_devotee',
      userName: 'Amit Trivedi',
      attended: true,
      infoAccuracyRating: 5,
      locationAccuracyRating: 5,
      timingAccuracyRating: 5,
      overallRating: 5,
      comments: 'Divine experience in Kashi. The organizers serve with immense reverence and love. Truly an inspiring community service.',
      status: 'APPROVED',
      createdAt: '2026-09-07T15:20:00.000Z'
    }
  ];

  const confirmations: EventConfirmation[] = [
    {
      id: 'conf_1',
      bhandaraId: 'bhan_delhi_cp',
      userId: 'usr_devotee',
      userName: 'Pooja Sharma',
      isHappening: true,
      note: 'Long queue but moving very fast. Fresh puris being made continuously.',
      createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
    },
    {
      id: 'conf_2',
      bhandaraId: 'bhan_varanasi_vishwanath',
      userId: 'usr_admin_varanasi',
      userName: 'Pandit Rajesh Shastri',
      isHappening: true,
      note: 'Seva in full swing at Gate 4 dining hall.',
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    }
  ];

  const reports: Report[] = [
    {
      id: 'rep_1',
      bhandaraId: 'bhan_delhi_cp',
      bhandaraName: 'Pracheen Hanuman Mandir Maha Bhandara',
      userId: 'usr_devotee',
      userName: 'Rajeev Verma',
      reason: 'WRONG_TIME',
      details: 'On posters the start time was stated 15 minutes earlier than scheduled on some banners.',
      status: 'RESOLVED',
      priority: 'LOW',
      createdAt: '2026-09-08T12:00:00.000Z',
      resolvedAt: '2026-09-08T13:00:00.000Z',
      resolvedBy: 'Utsav Srivastava'
    }
  ];

  const savedBhandaras: SavedBhandara[] = [
    {
      userId: 'usr_devotee',
      bhandaraId: 'bhan_delhi_cp',
      savedAt: '2026-09-09T14:20:00.000Z'
    },
    {
      userId: 'usr_superadmin',
      bhandaraId: 'bhan_varanasi_vishwanath',
      savedAt: '2026-09-08T10:15:00.000Z'
    }
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud_1',
      adminId: 'usr_superadmin',
      adminName: 'Utsav Srivastava',
      action: 'SYSTEM_INITIALIZED',
      targetEntity: 'BHANDARA',
      targetId: 'SYS_INIT',
      details: 'AnnSetu production database initialized with geographic centers and initial seed verifications.',
      timestamp: '2026-09-01T00:00:00.000Z'
    },
    {
      id: 'aud_2',
      adminId: 'usr_superadmin',
      adminName: 'Utsav Srivastava',
      action: 'ORGANIZER_VERIFIED',
      targetEntity: 'ORGANIZER',
      targetId: 'org_1',
      details: 'Verified Shri Pracheen Hanuman Mandir Sewa Samiti after verifying temple authorities and registration.',
      timestamp: '2026-09-05T11:30:00.000Z'
    }
  ];

  const eventUpdates: EventUpdate[] = [
    {
      id: 'upd_1',
      bhandaraId: 'bhan_delhi_cp',
      updateType: 'CORRECTED',
      note: 'Verified address and updated nearest landmark to Hanuman Mandir Complex Gate 2.',
      updatedBy: 'Utsav Srivastava',
      timestamp: '2026-09-08T11:00:00.000Z'
    }
  ];

  return {
    users,
    bhandaras,
    organizers,
    reviews,
    confirmations,
    reports,
    savedBhandaras,
    auditLogs,
    eventUpdates
  };
}

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
    // Re-evaluate dynamic statuses on boot
    this.refreshAllStatuses();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.bhandaras) && parsed.bhandaras.length > 0) {
          // Normalize pure vegetarian fields and data integrity
          parsed.bhandaras = parsed.bhandaras.map((b: any) => ({
            ...b,
            vegetarianStatus: 'PURE_VEG',
            foodItems: Array.isArray(b.foodItems) && b.foodItems.length > 0 
              ? b.foodItems 
              : (b.foodType ? b.foodType.split(/[,&+]/).map((s: string) => s.trim()).filter(Boolean) : ['Puri Sabzi', 'Halwa Prasad'])
          }));
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, seeding new data:', err);
    }

    const seeded = generateInitialData();
    this.saveData(seeded);
    return seeded;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const payload = JSON.stringify(dataToSave || this.data, null, 2);
      fs.writeFileSync(DB_FILE, payload, 'utf-8');
    } catch (err) {
      console.error('Failed to write database file to disk:', err);
    }
  }

  public refreshAllStatuses() {
    for (const b of this.data.bhandaras) {
      b.status = calculateDynamicStatus(b.eventDate, b.startTime, b.endTime, b.status);
    }
  }

  // --- Bhandaras ---
  public getBhandaras(options?: {
    userLat?: number;
    userLng?: number;
    maxDistanceKm?: number;
    city?: string;
    locality?: string;
    status?: string;
    dateFilter?: string;
    verification?: string;
    foodType?: string;
    search?: string;
    sort?: string;
    includePending?: boolean;
  }): Bhandara[] {
    this.refreshAllStatuses();

    let list = [...this.data.bhandaras];

    // Filter moderation status unless admin includes pending
    if (!options?.includePending) {
      list = list.filter(b => b.moderationStatus === 'APPROVED');
    }

    // City filter
    if (options?.city && options.city !== 'all') {
      const targetCity = options.city.toLowerCase().trim();
      list = list.filter(b => b.city.toLowerCase().includes(targetCity));
    }

    // Locality filter
    if (options?.locality && options.locality !== 'all') {
      const targetLoc = options.locality.toLowerCase().trim();
      list = list.filter(b => b.locality.toLowerCase().includes(targetLoc));
    }

    // Status filter
    if (options?.status && options.status !== 'all') {
      list = list.filter(b => b.status === options.status);
    }

    // Verification filter
    if (options?.verification && options.verification !== 'all') {
      list = list.filter(b => b.verificationStatus === options.verification);
    }

    // Food Type filter
    if (options?.foodType && options.foodType !== 'all') {
      list = list.filter(b => b.foodType === options.foodType);
    }

    // Date filter: today, tomorrow, this_week
    if (options?.dateFilter && options.dateFilter !== 'all') {
      const now = new Date();
      const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
      const yyyy = istNow.getFullYear();
      const mm = String(istNow.getMonth() + 1).padStart(2, '0');
      const dd = String(istNow.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      const tomorrow = new Date(istNow);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

      if (options.dateFilter === 'today') {
        list = list.filter(b => b.eventDate === todayStr);
      } else if (options.dateFilter === 'tomorrow') {
        list = list.filter(b => b.eventDate === tomorrowStr);
      } else if (options.dateFilter === 'this_week') {
        const nextWeek = new Date(istNow);
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = `${nextWeek.getFullYear()}-${String(nextWeek.getMonth() + 1).padStart(2, '0')}-${String(nextWeek.getDate()).padStart(2, '0')}`;
        list = list.filter(b => b.eventDate >= todayStr && b.eventDate <= nextWeekStr);
      }
    }

    // Full search query: name, organizer, venue, locality, city
    if (options?.search && options.search.trim().length > 0) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(b => 
        b.name.toLowerCase().includes(q) ||
        b.venue.toLowerCase().includes(q) ||
        b.locality.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        (b.organizerName && b.organizerName.toLowerCase().includes(q)) ||
        b.foodType.toLowerCase().includes(q)
      );
    }

    // Calculate distance if coordinates provided
    if (options?.userLat !== undefined && options?.userLng !== undefined) {
      list = list.map(b => ({
        ...b,
        distanceKm: calculateHaversineDistance(options.userLat!, options.userLng!, b.latitude, b.longitude)
      }));

      // Filter by max distance if requested
      if (options.maxDistanceKm && options.maxDistanceKm > 0) {
        list = list.filter(b => (b.distanceKm !== undefined && b.distanceKm <= options.maxDistanceKm!));
      }
    }

    // Sorting
    const sort = options?.sort || (options?.userLat ? 'nearest' : 'trending');
    if (sort === 'nearest' && options?.userLat !== undefined) {
      list.sort((a, b) => (a.distanceKm ?? 99999) - (b.distanceKm ?? 99999));
    } else if (sort === 'happening_now') {
      const order = { 'HAPPENING_NOW': 1, 'STARTING_SOON': 2, 'UPCOMING': 3, 'ENDED': 4, 'CANCELLED': 5 };
      list.sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99));
    } else if (sort === 'starting_soon') {
      const order = { 'STARTING_SOON': 1, 'HAPPENING_NOW': 2, 'UPCOMING': 3, 'ENDED': 4, 'CANCELLED': 5 };
      list.sort((a, b) => (order[a.status] || 99) - (order[b.status] || 99));
    } else if (sort === 'recently_added') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'trending') {
      // Engagement formula: views + saves*3 + shares*4 + directions*5 + positiveConfirmations*2
      list.sort((a, b) => {
        const scoreA = (a.viewsCount || 0) + (a.savesCount || 0) * 3 + (a.sharesCount || 0) * 4 + (a.directionsClicks || 0) * 5 + (a.positiveConfirmationsCount || 0) * 2;
        const scoreB = (b.viewsCount || 0) + (b.savesCount || 0) * 3 + (b.sharesCount || 0) * 4 + (b.directionsClicks || 0) * 5 + (b.positiveConfirmationsCount || 0) * 2;
        return scoreB - scoreA;
      });
    }

    return list;
  }

  public getBhandaraById(idOrSlug: string, userLat?: number, userLng?: number): Bhandara | null {
    this.refreshAllStatuses();
    const found = this.data.bhandaras.find(b => b.id === idOrSlug || b.slug === idOrSlug);
    if (!found) return null;

    if (userLat !== undefined && userLng !== undefined) {
      return {
        ...found,
        distanceKm: calculateHaversineDistance(userLat, userLng, found.latitude, found.longitude)
      };
    }
    return found;
  }

  public checkDuplicates(name: string, eventDate: string, lat: number, lng: number): Bhandara[] {
    const normName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.data.bhandaras.filter(b => {
      const matchDate = b.eventDate === eventDate;
      const bNorm = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const nameSimilar = normName.includes(bNorm) || bNorm.includes(normName);
      const dist = calculateHaversineDistance(lat, lng, b.latitude, b.longitude);
      const closeLocation = dist < 0.3; // within 300 meters
      return matchDate && (nameSimilar || closeLocation);
    });
  }

  public createBhandara(payload: Partial<Bhandara>, createdByUser: User): { bhandara: Bhandara; duplicates: Bhandara[] } {
    // Validate Pure Vegetarian Policy
    const vegValidation = validatePureVegetarianFood({
      name: payload.name,
      foodType: payload.foodType,
      foodItems: payload.foodItems,
      description: payload.description
    });

    if (!vegValidation.isValid) {
      throw new Error(`Pure Vegetarian Policy Violation: "${vegValidation.flaggedTerm}" detected. AnnSetu strictly allows only Pure Vegetarian (Satvik / Shuddh Shakahari) Bhandaras.`);
    }

    let foodItems: string[] = [];
    if (Array.isArray(payload.foodItems) && payload.foodItems.length > 0) {
      foodItems = payload.foodItems.map(item => String(item).trim()).filter(Boolean);
    } else if (typeof (payload as any).foodItems === 'string') {
      foodItems = ((payload as any).foodItems as string).split(',').map(s => s.trim()).filter(Boolean);
    } else if (payload.foodType) {
      foodItems = payload.foodType.split(/[,&+]/).map(s => s.trim()).filter(Boolean);
    }
    if (foodItems.length === 0) {
      foodItems = ['Puri Sabzi', 'Halwa Prasad'];
    }

    const id = `bhan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const slugBase = (payload.name || 'bhandara').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const duplicates = this.checkDuplicates(
      payload.name || '',
      payload.eventDate || '',
      payload.latitude || 0,
      payload.longitude || 0
    );

    // If submitted by ADMIN or SUPER_ADMIN, approve immediately, otherwise PENDING
    const isAdmin = createdByUser.role === 'ADMIN' || createdByUser.role === 'SUPER_ADMIN';
    const moderationStatus = isAdmin ? 'APPROVED' : 'PENDING';
    const verificationStatus = isAdmin ? 'VERIFIED_ORGANIZER' : 'COMMUNITY_ADDED';

    const newBhandara: Bhandara = {
      id,
      slug,
      name: payload.name || 'Community Bhandara',
      description: payload.description || '',
      eventDate: payload.eventDate || new Date().toISOString().split('T')[0],
      startTime: payload.startTime || '12:00',
      endTime: payload.endTime || '15:00',
      timezone: 'Asia/Kolkata',
      venue: payload.venue || '',
      address: payload.address || '',
      locality: payload.locality || '',
      city: payload.city || 'Delhi NCR',
      latitude: payload.latitude || 28.6139,
      longitude: payload.longitude || 77.2090,
      organizerId: payload.organizerId,
      organizerName: payload.organizerName || createdByUser.name,
      organizerPhone: payload.organizerPhone,
      createdBy: createdByUser.id,
      status: calculateDynamicStatus(payload.eventDate || '', payload.startTime || '', payload.endTime || '', 'UPCOMING'),
      moderationStatus,
      verificationStatus,
      foodType: payload.foodType || 'Puri Sabzi & Halwa',
      foodItems,
      vegetarianStatus: 'PURE_VEG',
      expectedAttendees: payload.expectedAttendees || '500 devotees',
      facilities: payload.facilities || ['Drinking Water'],
      posterUrl: payload.posterUrl,
      photos: payload.photos || (payload.posterUrl ? [payload.posterUrl] : []),
      viewsCount: 1,
      savesCount: 0,
      sharesCount: 0,
      directionsClicks: 0,
      positiveConfirmationsCount: 0,
      negativeConfirmationsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.bhandaras.unshift(newBhandara);

    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: createdByUser.id,
      adminName: createdByUser.name,
      action: 'BHANDARA_CREATED',
      targetEntity: 'BHANDARA',
      targetId: id,
      details: `Bhandara "${newBhandara.name}" submitted in ${newBhandara.city} (${moderationStatus}). Pure Vegetarian certified.`,
      timestamp: new Date().toISOString()
    });

    this.saveData();
    return { bhandara: newBhandara, duplicates };
  }

  public updateBhandara(id: string, updates: Partial<Bhandara>, adminUser?: User): Bhandara | null {
    const idx = this.data.bhandaras.findIndex(b => b.id === id);
    if (idx === -1) return null;

    const existing = this.data.bhandaras[idx];

    // Validate Pure Vegetarian on update if food or text fields changed
    if (updates.name || updates.foodType || updates.foodItems || updates.description) {
      const vegValidation = validatePureVegetarianFood({
        name: updates.name || existing.name,
        foodType: updates.foodType || existing.foodType,
        foodItems: updates.foodItems || existing.foodItems,
        description: updates.description || existing.description
      });
      if (!vegValidation.isValid) {
        throw new Error(`Pure Vegetarian Policy Violation: "${vegValidation.flaggedTerm}" detected. AnnSetu strictly allows only Pure Vegetarian (Satvik / Shuddh Shakahari) Bhandaras.`);
      }
    }

    const updated: Bhandara = {
      ...existing,
      ...updates,
      vegetarianStatus: 'PURE_VEG',
      updatedAt: new Date().toISOString()
    };

    // Recalculate status if timing changed
    if (updates.eventDate || updates.startTime || updates.endTime || updates.status) {
      updated.status = calculateDynamicStatus(updated.eventDate, updated.startTime, updated.endTime, updated.status);
    }

    this.data.bhandaras[idx] = updated;

    if (adminUser) {
      this.data.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        adminId: adminUser.id,
        adminName: adminUser.name,
        action: 'BHANDARA_UPDATED',
        targetEntity: 'BHANDARA',
        targetId: id,
        details: `Updated bhandara details: ${Object.keys(updates).join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    this.saveData();
    return updated;
  }

  public moderateBhandara(
    id: string, 
    action: 'APPROVE' | 'REJECT' | 'VERIFY' | 'CANCEL' | 'DELETE', 
    adminUser: User, 
    reason?: string
  ): boolean {
    const idx = this.data.bhandaras.findIndex(b => b.id === id);
    if (idx === -1) return false;

    const b = this.data.bhandaras[idx];

    if (action === 'DELETE') {
      this.data.bhandaras.splice(idx, 1);
    } else if (action === 'APPROVE') {
      b.moderationStatus = 'APPROVED';
      b.status = calculateDynamicStatus(b.eventDate, b.startTime, b.endTime, b.status);
    } else if (action === 'REJECT') {
      b.moderationStatus = 'REJECTED';
    } else if (action === 'VERIFY') {
      b.verificationStatus = 'VERIFIED_ORGANIZER';
      b.moderationStatus = 'APPROVED';
    } else if (action === 'CANCEL') {
      b.status = 'CANCELLED';
      this.data.eventUpdates.unshift({
        id: `upd_${Date.now()}`,
        bhandaraId: id,
        updateType: 'CANCELLED',
        note: reason || 'Event was officially cancelled by administrator.',
        updatedBy: adminUser.name,
        timestamp: new Date().toISOString()
      });
    }

    b.updatedAt = new Date().toISOString();

    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: `BHANDARA_${action}`,
      targetEntity: 'BHANDARA',
      targetId: id,
      details: `Action ${action} taken on "${b.name}"${reason ? ': ' + reason : ''}`,
      timestamp: new Date().toISOString()
    });

    this.saveData();
    return true;
  }

  public mergeDuplicates(targetId: string, duplicateId: string, adminUser: User): boolean {
    const target = this.data.bhandaras.find(b => b.id === targetId);
    const duplicate = this.data.bhandaras.find(b => b.id === duplicateId);
    if (!target || !duplicate) return false;

    // Combine views, saves, confirmations
    target.viewsCount += (duplicate.viewsCount || 0);
    target.savesCount += (duplicate.savesCount || 0);
    target.positiveConfirmationsCount += (duplicate.positiveConfirmationsCount || 0);
    target.photos = Array.from(new Set([...target.photos, ...duplicate.photos]));

    // Remove duplicate
    this.data.bhandaras = this.data.bhandaras.filter(b => b.id !== duplicateId);

    // Point reviews & confirmations to target
    this.data.reviews.forEach(r => {
      if (r.bhandaraId === duplicateId) r.bhandaraId = targetId;
    });
    this.data.confirmations.forEach(c => {
      if (c.bhandaraId === duplicateId) c.bhandaraId = targetId;
    });

    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'BHANDARA_MERGED',
      targetEntity: 'BHANDARA',
      targetId: targetId,
      details: `Merged duplicate "${duplicate.name}" (${duplicateId}) into "${target.name}" (${targetId})`,
      timestamp: new Date().toISOString()
    });

    this.saveData();
    return true;
  }

  // --- Confirmations (Is it happening now?) ---
  public addConfirmation(bhandaraId: string, user: User, isHappening: boolean, note?: string): boolean {
    // Rate limit: 1 confirmation per user per bhandara every 2 hours
    const existing = this.data.confirmations.find(c => 
      c.bhandaraId === bhandaraId && 
      c.userId === user.id &&
      (Date.now() - new Date(c.createdAt).getTime()) < 2 * 3600 * 1000
    );

    if (existing) {
      existing.isHappening = isHappening;
      if (note) existing.note = note;
      existing.createdAt = new Date().toISOString();
    } else {
      this.data.confirmations.unshift({
        id: `conf_${Date.now()}`,
        bhandaraId,
        userId: user.id,
        userName: user.name,
        isHappening,
        note,
        createdAt: new Date().toISOString()
      });
    }

    // Update bhandara counts & lastConfirmedAt
    const b = this.data.bhandaras.find(b => b.id === bhandaraId);
    if (b) {
      if (isHappening) {
        b.positiveConfirmationsCount = (b.positiveConfirmationsCount || 0) + (existing ? 0 : 1);
        b.lastConfirmedAt = new Date().toISOString();
        if (b.verificationStatus === 'COMMUNITY_ADDED') {
          b.verificationStatus = 'COMMUNITY_CONFIRMED';
        }
      } else {
        b.negativeConfirmationsCount = (b.negativeConfirmationsCount || 0) + (existing ? 0 : 1);
      }
      b.updatedAt = new Date().toISOString();
    }

    this.saveData();
    return true;
  }

  public getConfirmations(bhandaraId: string): EventConfirmation[] {
    return this.data.confirmations
      .filter(c => c.bhandaraId === bhandaraId)
      .slice(0, 10);
  }

  // --- Reviews ---
  public addReview(bhandaraId: string, user: User, payload: Partial<Review>): Review {
    // Prevent duplicate reviews from same account for same event
    const existingIndex = this.data.reviews.findIndex(r => r.bhandaraId === bhandaraId && r.userId === user.id);
    const review: Review = {
      id: existingIndex >= 0 ? this.data.reviews[existingIndex].id : `rev_${Date.now()}`,
      bhandaraId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      attended: payload.attended ?? true,
      infoAccuracyRating: Math.min(5, Math.max(1, payload.infoAccuracyRating || 5)),
      locationAccuracyRating: Math.min(5, Math.max(1, payload.locationAccuracyRating || 5)),
      timingAccuracyRating: Math.min(5, Math.max(1, payload.timingAccuracyRating || 5)),
      overallRating: Math.min(5, Math.max(1, payload.overallRating || 5)),
      comments: payload.comments || '',
      status: 'APPROVED',
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.data.reviews[existingIndex] = review;
    } else {
      this.data.reviews.unshift(review);
    }

    this.saveData();
    return review;
  }

  public getReviews(bhandaraId: string): Review[] {
    return this.data.reviews.filter(r => r.bhandaraId === bhandaraId && r.status === 'APPROVED');
  }

  public moderateReview(reviewId: string, status: 'APPROVED' | 'HIDDEN', adminUser: User): boolean {
    const rev = this.data.reviews.find(r => r.id === reviewId);
    if (!rev) return false;
    rev.status = status;

    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'REVIEW_MODERATED',
      targetEntity: 'REVIEW',
      targetId: reviewId,
      details: `Review set to ${status}`,
      timestamp: new Date().toISOString()
    });

    this.saveData();
    return true;
  }

  // --- Reports ---
  public addReport(bhandaraId: string, user: User, reason: Report['reason'], details: string): Report {
    const b = this.data.bhandaras.find(item => item.id === bhandaraId);
    const priority = (reason === 'FAKE_EVENT' || reason === 'EVENT_CANCELLED') ? 'HIGH' : 'MEDIUM';

    const report: Report = {
      id: `rep_${Date.now()}`,
      bhandaraId,
      bhandaraName: b ? b.name : 'Unknown Event',
      userId: user.id,
      userName: user.name,
      reason,
      details,
      status: 'PENDING',
      priority,
      createdAt: new Date().toISOString()
    };

    this.data.reports.unshift(report);
    this.saveData();
    return report;
  }

  public getReports(status?: string): Report[] {
    if (status && status !== 'all') {
      return this.data.reports.filter(r => r.status === status);
    }
    return this.data.reports;
  }

  public resolveReport(reportId: string, action: 'RESOLVED' | 'DISMISSED', adminUser: User): boolean {
    const r = this.data.reports.find(item => item.id === reportId);
    if (!r) return false;
    r.status = action;
    r.resolvedAt = new Date().toISOString();
    r.resolvedBy = adminUser.name;

    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: `REPORT_${action}`,
      targetEntity: 'REPORT',
      targetId: reportId,
      details: `Report for "${r.bhandaraName}" marked ${action}`,
      timestamp: new Date().toISOString()
    });

    this.saveData();
    return true;
  }

  // --- Saved ---
  public toggleSave(userId: string, bhandaraId: string): boolean {
    const idx = this.data.savedBhandaras.findIndex(s => s.userId === userId && s.bhandaraId === bhandaraId);
    const b = this.data.bhandaras.find(item => item.id === bhandaraId);

    if (idx >= 0) {
      this.data.savedBhandaras.splice(idx, 1);
      if (b && b.savesCount > 0) b.savesCount--;
      this.saveData();
      return false; // un-saved
    } else {
      this.data.savedBhandaras.push({
        userId,
        bhandaraId,
        savedAt: new Date().toISOString()
      });
      if (b) b.savesCount = (b.savesCount || 0) + 1;
      this.saveData();
      return true; // saved
    }
  }

  public getSavedBhandaras(userId: string): Bhandara[] {
    const savedIds = this.data.savedBhandaras
      .filter(s => s.userId === userId)
      .map(s => s.bhandaraId);

    this.refreshAllStatuses();
    return this.data.bhandaras.filter(b => savedIds.includes(b.id));
  }

  public isBhandaraSaved(userId: string, bhandaraId: string): boolean {
    return this.data.savedBhandaras.some(s => s.userId === userId && s.bhandaraId === bhandaraId);
  }

  // --- Organizers ---
  public getOrganizers(): Organizer[] {
    return this.data.organizers;
  }

  public getOrganizerById(idOrSlug: string): Organizer | null {
    return this.data.organizers.find(o => o.id === idOrSlug || o.slug === idOrSlug) || null;
  }

  public verifyOrganizer(id: string, status: 'VERIFIED' | 'REJECTED' | 'SUSPENDED', adminUser: User): boolean {
    const org = this.data.organizers.find(o => o.id === id);
    if (!org) return false;
    org.verificationStatus = status;
    org.updatedAt = new Date().toISOString();

    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: `ORGANIZER_${status}`,
      targetEntity: 'ORGANIZER',
      targetId: id,
      details: `Organizer "${org.name}" status updated to ${status}`,
      timestamp: new Date().toISOString()
    });

    this.saveData();
    return true;
  }

  // --- Tracking ---
  public trackAction(bhandaraId: string, action: 'view' | 'share' | 'directions'): void {
    const b = this.data.bhandaras.find(item => item.id === bhandaraId);
    if (!b) return;

    if (action === 'view') b.viewsCount = (b.viewsCount || 0) + 1;
    if (action === 'share') b.sharesCount = (b.sharesCount || 0) + 1;
    if (action === 'directions') b.directionsClicks = (b.directionsClicks || 0) + 1;

    this.saveData();
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | null {
    return this.data.users.find(u => u.id === id) || null;
  }

  public getUserByEmail(email: string): User | null {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public createUser(email: string, name: string, role: User['role'] = 'USER', city?: string, phone?: string): User {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newUser: User = {
      id,
      email,
      name,
      role,
      city: city || 'Delhi NCR',
      phone,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public updateUserRole(userId: string, role: User['role'], adminUser: User): boolean {
    const u = this.data.users.find(user => user.id === userId);
    if (!u) return false;
    u.role = role;

    this.data.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      adminId: adminUser.id,
      adminName: adminUser.name,
      action: 'USER_ROLE_CHANGED',
      targetEntity: 'USER',
      targetId: userId,
      details: `User ${u.name} (${u.email}) role updated to ${role}`,
      timestamp: new Date().toISOString()
    });

    this.saveData();
    return true;
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs.slice(0, 50);
  }

  // --- Real Metrics ---
  public getAdminMetrics(): AdminMetrics {
    this.refreshAllStatuses();
    const bhandaras = this.data.bhandaras;

    return {
      totalUsers: this.data.users.length,
      totalBhandaras: bhandaras.length,
      activeEvents: bhandaras.filter(b => b.status === 'HAPPENING_NOW' && b.moderationStatus === 'APPROVED').length,
      upcomingEvents: bhandaras.filter(b => (b.status === 'UPCOMING' || b.status === 'STARTING_SOON') && b.moderationStatus === 'APPROVED').length,
      pendingSubmissions: bhandaras.filter(b => b.moderationStatus === 'PENDING').length,
      verifiedEvents: bhandaras.filter(b => b.verificationStatus === 'VERIFIED_ORGANIZER').length,
      reportedEvents: this.data.reports.filter(r => r.status === 'PENDING').length,
      cancelledEvents: bhandaras.filter(b => b.status === 'CANCELLED').length,
      totalOrganizers: this.data.organizers.length,
      totalReviews: this.data.reviews.length,
      totalConfirmations: this.data.confirmations.length
    };
  }
}

// Global Singleton Instance
export const db = new DatabaseStore();

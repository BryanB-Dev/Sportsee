// Mock des données de l'API backend pour le développement initial

// Mock des utilisateurs disponibles pour l'authentification
export const mockAuthUsers = [
  {
    username: 'sophiemartin',
    password: 'password123',
    userId: 'user123',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMTIzIiwiaWF0IjoxNzY0NzcxMjcwLCJleHAiOjE3NjQ4NTc2NzB9.QL94xaObRkcanvVsA2THPfGIwP251cWRVhskKbBbFus'
  },
  {
    username: 'emmaleroy', 
    password: 'password789',
    userId: 'user456',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyNDU2IiwiaWF0IjoxNzY0NzcxMzAxLCJleHAiOjE3NjQ4NTc3MDF9.CCLWKBTpNH0cQfYIRYR9Rq3MXtmV_IBccKj5PgK0y_Y'
  },
  {
    username: 'marcdubois',
    password: 'password456', 
    userId: 'user789',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyNzg5IiwiaWF0IjoxNzY0NzcxMjkwLCJleHAiOjE3NjQ4NTc2OTB9.imxbfEnvZmAjwvCQ80L_YKOyqGk4gr9NKID3DDbacUI'
  }
];

// Mock de la réponse de login
export const mockLoginResponse = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMTIzIiwiaWF0IjoxNzY0NzcxMjcwLCJleHAiOjE3NjQ4NTc2NzB9.QL94xaObRkcanvVsA2THPfGIwP251cWRVhskKbBbFus',
  userId: 'user123'
};

// Mock des informations utilisateur et statistiques
export const mockUserInfo = {
  'user123': {
    profile: {
      firstName: 'Sophie',
      lastName: 'Martin',
      createdAt: '2025-01-01',
      age: 32,
      weight: 60,
      height: 165,
      gender: 'female',
      profilePicture: 'http://localhost:8000/images/sophie.jpg'
    },
    statistics: {
      totalDistance: '2250.2',
      totalSessions: 348,
      totalDuration: 14625
    }
  },
  'user456': {
    profile: {
      firstName: 'Emma',
      lastName: 'Leroy',
      createdAt: '2025-01-15',
      age: 28,
      weight: 55,
      height: 160,
      gender: 'female',
      profilePicture: 'http://localhost:8000/images/emma.jpg'
    },
    statistics: {
      totalDistance: '1850.8',
      totalSessions: 280,
      totalDuration: 11200
    }
  },
  'user789': {
    profile: {
      firstName: 'Marc',
      lastName: 'Dubois',
      createdAt: '2025-02-01',
      age: 35,
      weight: 75,
      height: 180,
      gender: 'male',
      profilePicture: 'http://localhost:8000/images/marc.jpg'
    },
    statistics: {
      totalDistance: '3120.5',
      totalSessions: 425,
      totalDuration: 18900
    }
  }
};

// Mock des données d'activité de course
export const mockUserActivity = {
  'user123': [
    {
      date: '2025-11-18',
      distance: 5.8,
      duration: 38,
      heartRate: { min: 140, max: 178, average: 163 },
      caloriesBurned: 422
    },
    {
      date: '2025-11-19',
      distance: 3.2,
      duration: 20,
      heartRate: { min: 148, max: 184, average: 171 },
      caloriesBurned: 248
    },
    {
      date: '2025-11-20',
      distance: 6.4,
      duration: 42,
      heartRate: { min: 140, max: 176, average: 163 },
      caloriesBurned: 468
    },
    {
      date: '2025-11-21',
      distance: 7.5,
      duration: 50,
      heartRate: { min: 138, max: 178, average: 162 },
      caloriesBurned: 532
    },
    {
      date: '2025-11-22',
      distance: 5.1,
      duration: 34,
      heartRate: { min: 141, max: 177, average: 165 },
      caloriesBurned: 378
    },
    {
      date: '2025-11-23',
      distance: 6,
      duration: 39,
      heartRate: { min: 141, max: 177, average: 164 },
      caloriesBurned: 425
    },
    {
      date: '2025-11-24',
      distance: 3.5,
      duration: 22,
      heartRate: { min: 146, max: 183, average: 170 },
      caloriesBurned: 265
    }
  ],
  'user456': [
    {
      date: '2025-11-18',
      distance: 4.2,
      duration: 28,
      heartRate: { min: 145, max: 180, average: 165 },
      caloriesBurned: 315
    },
    {
      date: '2025-11-20',
      distance: 6.8,
      duration: 45,
      heartRate: { min: 142, max: 176, average: 162 },
      caloriesBurned: 485
    },
    {
      date: '2025-11-22',
      distance: 3.8,
      duration: 25,
      heartRate: { min: 148, max: 182, average: 168 },
      caloriesBurned: 285
    },
    {
      date: '2025-11-24',
      distance: 5.5,
      duration: 36,
      heartRate: { min: 144, max: 178, average: 164 },
      caloriesBurned: 390
    }
  ],
  'user789': [
    {
      date: '2025-11-18',
      distance: 8.2,
      duration: 52,
      heartRate: { min: 138, max: 175, average: 160 },
      caloriesBurned: 620
    },
    {
      date: '2025-11-19',
      distance: 6.5,
      duration: 41,
      heartRate: { min: 140, max: 177, average: 162 },
      caloriesBurned: 495
    },
    {
      date: '2025-11-20',
      distance: 10.1,
      duration: 68,
      heartRate: { min: 136, max: 179, average: 158 },
      caloriesBurned: 755
    },
    {
      date: '2025-11-21',
      distance: 4.8,
      duration: 32,
      heartRate: { min: 143, max: 180, average: 166 },
      caloriesBurned: 365
    },
    {
      date: '2025-11-22',
      distance: 7.3,
      duration: 48,
      heartRate: { min: 139, max: 178, average: 161 },
      caloriesBurned: 545
    },
    {
      date: '2025-11-23',
      distance: 5.9,
      duration: 38,
      heartRate: { min: 141, max: 176, average: 163 },
      caloriesBurned: 445
    },
    {
      date: '2025-11-24',
      distance: 9.4,
      duration: 62,
      heartRate: { min: 137, max: 179, average: 159 },
      caloriesBurned: 705
    }
  ]
};

// Fonction utilitaire pour simuler une réponse d'API avec délai
export const mockApiCall = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

// Fonction pour simuler l'authentification
export const mockLogin = async (username, password) => {
  const user = mockAuthUsers.find(u => u.username === username && u.password === password);
  
  if (!user) {
    throw new Error('Identifiants incorrects');
  }
  
  // Retourner le vrai token de l'API backend
  return mockApiCall({
    token: user.token,
    userId: user.userId
  });
};

// Fonction pour simuler la récupération des infos utilisateur
export const mockGetUserInfo = async (userId) => {
  const userInfo = mockUserInfo[userId];
  
  if (!userInfo) {
    throw new Error('Utilisateur non trouvé');
  }
  
  return mockApiCall(userInfo);
};

// Fonction pour simuler la récupération de l'activité utilisateur
export const mockGetUserActivity = async (userId, startWeek, endWeek) => {
  const activity = mockUserActivity[userId] || [];
  
  // Filtrer par dates si fournies
  let filteredActivity = activity;
  if (startWeek && endWeek) {
    const start = new Date(startWeek);
    const end = new Date(endWeek);
    filteredActivity = activity.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= start && sessionDate <= end;
    });
  }
  
  return mockApiCall(filteredActivity);
};
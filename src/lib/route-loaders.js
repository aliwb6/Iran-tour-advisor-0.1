export const routeLoaders = {
  tours: () => import('@/pages/Tours'),
  tourDetails: () => import('@/pages/TourDetails'),
  packageDetails: () => import('@/pages/PackageDetails'),
  dashboard: () => import('@/pages/Dashboard'),
  adminDashboard: () => import('@/pages/AdminDashboard'),
  guides: () => import('@/pages/Guides'),
  agencies: () => import('@/pages/Agencies'),
  guideDetails: () => import('@/pages/GuideDetails'),
  agencyProfile: () => import('@/pages/AgencyProfile'),
  tripRequest: () => import('@/pages/TripRequest'),
  aiAssistant: () => import('@/pages/AIAssistant'),
  about: () => import('@/pages/About'),
  blog: () => import('@/pages/Blog'),
  articleDetails: () => import('@/pages/ArticleDetails'),
  chat: () => import('@/pages/Chat'),
  profile: () => import('@/pages/profile/ProfilePage'),
  settings: () => import('@/pages/profile/SettingsPage'),
  requests: () => import('@/pages/profile/RequestsPage'),
  city: () => import('@/pages/CityPage'),
  findJobs: () => import('@/pages/FindJobs'),
  myTrips: () => import('@/pages/MyTripRequests'),
  requestDetails: () => import('@/pages/profile/RequestDetailPage'),
  signup: () => import('@/pages/Signup'),
  login: () => import('@/pages/Login'),
  destinations: () => import('@/pages/Destinations'),
  search: () => import('@/pages/Search'),
  guideOnboarding: () => import('@/pages/GuideOnboarding'),
};

const pathLoaders = [
  ['/tours', routeLoaders.tours],
  ['/guides', routeLoaders.guides],
  ['/agencies', routeLoaders.agencies],
  ['/ai-assistant', routeLoaders.aiAssistant],
  ['/blog', routeLoaders.blog],
  ['/dashboard', routeLoaders.dashboard],
  ['/admin', routeLoaders.adminDashboard],
  ['/profile', routeLoaders.profile],
  ['/trip-requests', routeLoaders.requests],
  ['/login', routeLoaders.login],
  ['/signup', routeLoaders.signup],
];

export function preloadRoute(path) {
  const match = pathLoaders.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`));
  const loader = match?.[1];
  if (typeof loader === 'function') void loader();
}

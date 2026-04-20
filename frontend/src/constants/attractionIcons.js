const ATTRACTION_ICONS = {
  landmark: '🗿',
  museum: '🏛',
  romantic: '💞',
  walk: '🚶',
  nature: '🌿',
  beach: '🌊',
  experience: '✨',
  relaxation: '🧘',
  adventure: '⛰',
};

export const iconForType = (type) => ATTRACTION_ICONS[type] || '📍';

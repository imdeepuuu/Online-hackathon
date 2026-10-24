export const CATEGORIES = [
  'Electronics',
  'Bags',
  'ID & Cards',
  'Bottles & Containers',
  'Keys',
  'Stationery',
  'Clothing',
  'Books & Notes',
  'Accessories',
  'Other',
] as const

export const LOCATIONS = [
  'Library',
  'Academic Block',
  'Cafeteria',
  'Sports Complex',
  'Computer Lab',
  'Main Entrance',
  'Hostel',
  'Auditorium',
  'Parking Area',
  'Other',
] as const

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const ITEMS_PER_PAGE = 9

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']

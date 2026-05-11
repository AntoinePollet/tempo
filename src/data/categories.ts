export const CATEGORIES = [
  { id: 'streaming', name: 'Streaming', color: '#E50914', icon: 'carbon--tv' },
  { id: 'music', name: 'Music', color: '#1DB954', icon: 'carbon--music' },
  { id: 'software', name: 'Software/SaaS', color: '#0EA5E9', icon: 'carbon--code' },
  { id: 'cloud', name: 'Cloud', color: '#6366F1', icon: 'carbon--cloud' },
  { id: 'gaming', name: 'Gaming', color: '#A855F7', icon: 'carbon--game-console' },
  { id: 'news', name: 'News & Reading', color: '#F59E0B', icon: 'carbon--news' },
  { id: 'fitness', name: 'Fitness', color: '#10B981', icon: 'carbon--pedestrian-family' },
  { id: 'food', name: 'Food & Drink', color: '#F97316', icon: 'carbon--restaurant' },
  { id: 'utilities', name: 'Utilities', color: '#64748B', icon: 'carbon--flash' },
  { id: 'other', name: 'Other', color: '#9CA3AF', icon: 'carbon--tag' },
] as const

export type Category = typeof CATEGORIES[number]
export type CategoryId = Category['id']

const byId = new Map(CATEGORIES.map(c => [c.id, c]))

export function getCategory(id: string): Category | undefined {
  return byId.get(id as CategoryId)
}

export function isCategoryId(id: string): id is CategoryId {
  return byId.has(id as CategoryId)
}

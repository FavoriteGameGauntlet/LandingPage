export interface RuleMeta {
  slug: string
  title: string
  published?: boolean
}

export const ruleManifest: RuleMeta[] = [
  { slug: 'Introduction', title: 'Вступление' },
  { slug: 'Victory', title: 'Победа' },
  { slug: 'Wishlist', title: 'Список желаемого' },
  { slug: 'CurrentGame', title: 'Текущая игра' },
  { slug: 'Wheel', title: 'Колесо' },
  { slug: 'Territory', title: 'Территория' },
  { slug: 'Timer', title: 'Таймер' },
  { slug: 'Items', title: 'Предметы' },
  { slug: 'Perks', title: 'Перк' },
  { slug: 'Quests', title: 'Квесты' },
  { slug: 'Sandstorm', title: 'Буря' },
  { slug: 'Characteristics', title: 'Характеристики' },
  { slug: 'Bosses', title: 'Боссы' },
  { slug: 'Districts', title: 'Районы' },
  { slug: 'Dicksmoke', title: 'Диксмоук', published: false },
]

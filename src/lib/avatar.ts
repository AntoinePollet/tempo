const AVATAR_COLORS = [
  '#5E81AC',
  '#A3BE8C',
  '#D08770',
  '#B48EAD',
  '#88C0D0',
  '#BF616A',
  '#EBCB8B',
  '#81A1C1',
] as const

export interface LetterAvatar {
  letter: string
  color: string
}

export function letterAvatar(name: string): LetterAvatar {
  const trimmed = name.trim()
  const letter = trimmed.charAt(0).toUpperCase() || '?'
  let hash = 0
  for (let i = 0; i < trimmed.length; i++)
    hash = (trimmed.charCodeAt(i) + ((hash << 5) - hash)) | 0
  const color = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
  return { letter, color }
}

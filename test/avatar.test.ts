import { letterAvatar } from '~/lib/avatar'
import { describe, expect, it } from 'vitest'

describe('letterAvatar', () => {
  it('uses the first letter of the name uppercase', () => {
    expect(letterAvatar('netflix').letter).toBe('N')
    expect(letterAvatar('My gym').letter).toBe('M')
  })

  it('returns ? for an empty name', () => {
    expect(letterAvatar('').letter).toBe('?')
    expect(letterAvatar('   ').letter).toBe('?')
  })

  it('is deterministic for the same name', () => {
    const a = letterAvatar('Spotify')
    const b = letterAvatar('Spotify')
    expect(a).toEqual(b)
  })

  it('returns a color from the predefined palette', () => {
    const palette = new Set([
      '#5E81AC',
      '#A3BE8C',
      '#D08770',
      '#B48EAD',
      '#88C0D0',
      '#BF616A',
      '#EBCB8B',
      '#81A1C1',
    ])
    for (const name of ['Netflix', 'Spotify', 'My gym', 'X', 'a really long subscription name'])
      expect(palette.has(letterAvatar(name).color)).toBe(true)
  })
})

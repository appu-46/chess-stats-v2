import { describe, expect, it } from 'vitest'
import { SHARE_TARGET_LABELS, shareLink } from './shareLinks'
import type { ShareTarget } from './shareLinks'

const post = {
  text: 'Hikaru on Chess.com: Blitz 3482 & Rapid 2838',
  url: 'https://example.com/profile/hikaru',
  title: 'Hikaru · Chess Stats',
}

describe('shareLink', () => {
  it('builds a link for every target, with the URL encoded in it', () => {
    for (const target of Object.keys(
      SHARE_TARGET_LABELS,
    ) as Array<ShareTarget>) {
      const link = shareLink(target, post)
      expect(link).toMatch(/^https:\/\//)
      expect(decodeURIComponent(link.replace(/\+/g, ' '))).toContain(post.url)
    }
  })

  it('keeps the text intact, ampersand included', () => {
    const link = new URL(shareLink('x', post))
    expect(link.searchParams.get('text')).toBe(post.text)
    expect(link.searchParams.get('url')).toBe(post.url)
  })

  it('puts text and link together where there is one field', () => {
    const link = new URL(shareLink('whatsapp', post))
    expect(link.searchParams.get('text')).toBe(`${post.text} ${post.url}`)
  })
})

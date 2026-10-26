import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  comparePreview,
  injectPreview,
  isPreviewBot,
  leaderboardPreview,
  playerPreview,
} from './preview'

describe('link previews', () => {
  it('only treats preview bots and crawlers as bots', () => {
    expect(isPreviewBot('WhatsApp/2.23.20.0')).toBe(true)
    expect(isPreviewBot('Twitterbot/1.0')).toBe(true)
    expect(isPreviewBot('Mozilla/5.0 (compatible; Discordbot/2.0)')).toBe(true)
    expect(isPreviewBot('facebookexternalhit/1.1')).toBe(true)
    expect(
      isPreviewBot(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
      ),
    ).toBe(false)
    expect(isPreviewBot(null)).toBe(false)
  })

  it('describes a player by name, title and ratings', () => {
    const preview = playerPreview('profile', {
      username: 'hikaru',
      name: 'Hikaru Nakamura',
      title: 'GM',
      platform: 'chess.com',
      ratings: [
        ['blitz', 3482],
        ['rapid', 2838],
        ['bullet', 3401],
        ['daily', 2239],
      ],
    })
    expect(preview.title).toBe(
      'Hikaru Nakamura (GM @hikaru) · Chess.com profile · Chess Stats',
    )
    expect(preview.description).toMatch(
      /^Blitz 3482 · Rapid 2838 · Bullet 3401 on Chess\.com\./,
    )
  })

  it('names compare and leaderboard pages from their URL', () => {
    expect(comparePreview('hikaru', 'fabianocaruana').title).toBe(
      'hikaru vs fabianocaruana · Chess Stats',
    )
    expect(
      leaderboardPreview(new URLSearchParams('tc=rapid&country=India')).title,
    ).toBe('Top Chess.com Rapid players from India · Chess Stats')
    expect(
      leaderboardPreview(new URLSearchParams('platform=lichess')).title,
    ).toBe('Top Lichess players · Chess Stats')
    expect(
      leaderboardPreview(new URLSearchParams('tc=rapid&country=India'))
        .description,
    ).toBe(
      'The Chess.com rapid players from India in the top 100, with their ranks, titles and ratings.',
    )
  })

  it("fills our index.html's tags, escaped", () => {
    const html = readFileSync('index.html', 'utf8')
    const out = injectPreview(
      html,
      { title: 'A & "B"', description: 'x < y' },
      'https://example.com/profile/a',
    )
    expect(out).toContain('<title>A &amp; &quot;B&quot;</title>')
    expect(out).toMatch(/property="og:title"\s+content="A &amp; &quot;B&quot;"/)
    expect(out).toMatch(/property="og:description"\s+content="x &lt; y"/)
    expect(out).toMatch(/name="description"\s+content="x &lt; y"/)
    expect(out).toMatch(
      /property="og:url"\s+content="https:\/\/example\.com\/profile\/a"/,
    )
  })
})

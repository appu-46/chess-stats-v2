import { describe, expect, it } from 'vitest'
import {
  lichessFlagToCountry,
  normalizeChessComProfile,
  normalizeChessComStats,
  normalizeLichessPerf,
  normalizeLichessProfile,
} from './normalizePlayer'

describe('normalizeChessComProfile', () => {
  it('stringifies the numeric id and keeps chess.com-only fields', () => {
    const profile = normalizeChessComProfile(
      {
        player_id: 15448422,
        username: 'hikaru',
        name: 'Hikaru Nakamura',
        url: 'https://www.chess.com/member/Hikaru',
        avatar: 'https://images.chesscomfiles.com/a.png',
        title: 'GM',
        followers: 1500000,
        joined: 1389043258,
        last_online: 1792000000,
        league: 'Legend',
        status: 'premium',
        is_streamer: true,
        twitch_url: 'https://twitch.tv/gmhikaru',
      },
      { code: 'US', name: 'United States' },
    )
    expect(profile).toMatchObject({
      platform: 'chess.com',
      playerId: '15448422',
      name: 'Hikaru Nakamura',
      country: { code: 'US', name: 'United States' },
      league: 'Legend',
      streamUrl: 'https://twitch.tv/gmhikaru',
      totalGames: null,
    })
  })

  it('hides the twitch url when the player is not flagged as a streamer', () => {
    const profile = normalizeChessComProfile(
      {
        player_id: 1,
        username: 'x',
        url: '',
        is_streamer: false,
        twitch_url: 'https://twitch.tv/x',
      },
      null,
    )
    expect(profile.streamUrl).toBeNull()
  })
})

describe('normalizeChessComStats', () => {
  it('keys standard-chess blocks by time class and ignores the rest', () => {
    const stats = normalizeChessComStats({
      chess_blitz: {
        last: { rating: 3300 },
        best: { rating: 3400, game: 'https://www.chess.com/game/live/1' },
        record: { win: 10, loss: 2, draw: 3 },
      },
      chess960_daily: { last: { rating: 2000 } },
      tactics: { highest: { rating: 3000 } },
    })
    expect(Object.keys(stats)).toEqual(['blitz'])
    expect(stats.blitz).toEqual({
      current: 3300,
      best: { rating: 3400, gameUrl: 'https://www.chess.com/game/live/1' },
      record: { win: 10, loss: 2, draw: 3 },
    })
  })
})

describe('normalizeLichessProfile', () => {
  it('maps a lichess user onto the shared profile shape', () => {
    const profile = normalizeLichessProfile({
      id: 'drnykterstein',
      username: 'DrNykterstein',
      title: 'GM',
      url: 'https://lichess.org/@/DrNykterstein',
      createdAt: 1544100290814,
      seenAt: 1792000750356,
      profile: { flag: 'NO', realName: 'Magnus' },
      count: { all: 10455 },
      playTime: { total: 1170459 },
      streamer: { twitch: { channel: 'https://www.twitch.tv/maskenissen' } },
    })
    expect(profile).toMatchObject({
      platform: 'lichess',
      playerId: 'drnykterstein',
      username: 'DrNykterstein',
      name: 'Magnus',
      avatar: null,
      followers: null,
      joined: 1544100290,
      lastOnline: 1792000750,
      country: { code: 'NO', name: 'Norway' },
      totalGames: 10455,
      playTimeSeconds: 1170459,
      streamUrl: 'https://www.twitch.tv/maskenissen',
    })
  })

  it('leaves name and country empty when the profile is blank', () => {
    const profile = normalizeLichessProfile({
      id: 'x',
      username: 'x',
      url: 'https://lichess.org/@/x',
      profile: {},
    })
    expect(profile.name).toBeNull()
    expect(profile.country).toBeNull()
  })
})

describe('lichessFlagToCountry', () => {
  it('handles ISO codes, subdivisions and lichess-only flags', () => {
    expect(lichessFlagToCountry('IN')).toEqual({ code: 'IN', name: 'India' })
    expect(lichessFlagToCountry('GB-SCT')).toEqual({
      code: 'GB',
      name: 'Scotland',
    })
    expect(lichessFlagToCountry('_lichess')).toEqual({
      code: 'XX',
      name: 'International',
    })
    expect(lichessFlagToCountry(undefined)).toBeNull()
  })
})

describe('normalizeLichessPerf', () => {
  it('rounds the glicko rating and links the peak game', () => {
    expect(
      normalizeLichessPerf({
        perf: { glicko: { rating: 3194.13 } },
        stat: {
          highest: { int: 3221, gameId: 'fWFrV4Wo' },
          count: { win: 457, loss: 92, draw: 63 },
        },
      }),
    ).toEqual({
      current: 3194,
      best: { rating: 3221, gameUrl: 'https://lichess.org/fWFrV4Wo' },
      record: { win: 457, loss: 92, draw: 63 },
    })
  })

  it('has no best rating before lichess has computed one', () => {
    expect(
      normalizeLichessPerf({ perf: { glicko: { rating: 1500 } } }).best,
    ).toBeNull()
  })
})

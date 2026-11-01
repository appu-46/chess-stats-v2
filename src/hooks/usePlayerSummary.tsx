import { useQuery } from '@tanstack/react-query'
import type { Platform } from '../helpers/platform'

// The LLM-written profile summary from netlify/functions/player-summary.ts.
// null when the player has too few recent games for one.
async function fetchPlayerSummary(
  platform: Platform,
  username: string,
): Promise<string | null> {
  // Lowercased so every spelling of a name shares one CDN-cached answer.
  const params = new URLSearchParams({
    platform,
    username: username.toLowerCase(),
  })
  const response = await fetch(`/api/player-summary?${params}`)

  // The page hides a failed summary, so the console is where to find out
  // why. Plain `vite` has no functions and answers with the app's own HTML.
  if (!response.headers.get('content-type')?.includes('application/json')) {
    console.warn(
      '[player-summary] The summary function isn’t running here. Start the app with `npx netlify-cli dev` to use it locally.',
    )
    throw new Error('Summary function not running')
  }
  const data: { summary?: string | null; reason?: string } =
    await response.json()
  if (!response.ok) {
    console.warn(
      `[player-summary] No summary for ${platform}/${username}: ${data.reason ?? response.status}. The function's log has the details.`,
    )
    throw new Error(data.reason ?? 'No summary right now')
  }
  return data.summary ?? null
}

function usePlayerSummary(username: string, platform: Platform) {
  const { data, isPending, error } = useQuery({
    queryKey: ['playerSummary', platform, username.toLowerCase()],
    queryFn: () => fetchPlayerSummary(platform, username),
    // The server only refreshes it daily, and a failure just hides it.
    staleTime: 60 * 60 * 1000,
    retry: false,
  })

  return { summary: data, isPending, error }
}

export default usePlayerSummary

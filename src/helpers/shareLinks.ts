// Links that open each site's "new post" page with our text and link
// filled in. These can only carry text and a URL, not an image: the stat
// card itself goes through Copy image, Download, or the device's share
// sheet. Instagram has no such link, so it isn't here.
export type ShareTarget =
  | 'x'
  | 'reddit'
  | 'whatsapp'
  | 'telegram'
  | 'facebook'
  | 'linkedin'
  | 'bluesky'
  | 'email'

export interface SharePost {
  // A one-line summary, e.g. "Hikaru Nakamura on Chess.com: Blitz 3482".
  text: string
  url: string
  // Used where the site wants a separate title (Reddit, email subject).
  title: string
}

export const SHARE_TARGET_LABELS: Record<ShareTarget, string> = {
  x: 'X',
  reddit: 'Reddit',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  bluesky: 'Bluesky',
  email: 'Email',
}

export function shareLink(target: ShareTarget, post: SharePost): string {
  const { text, url, title } = post
  const q = (params: Record<string, string>) =>
    new URLSearchParams(params).toString()

  switch (target) {
    case 'x':
      return `https://x.com/intent/post?${q({ text, url })}`
    case 'reddit':
      return `https://www.reddit.com/submit?${q({ url, title })}`
    case 'whatsapp':
      return `https://wa.me/?${q({ text: `${text} ${url}` })}`
    case 'telegram':
      return `https://t.me/share/url?${q({ url, text })}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?${q({ u: url })}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?${q({ url })}`
    case 'bluesky':
      return `https://bsky.app/intent/compose?${q({ text: `${text} ${url}` })}`
    case 'email':
      // mailto wants %20 for spaces, not URLSearchParams' "+".
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`
  }
}

export interface ComicCard {
  slug: string
  title: string
  image: string
  chapter: string
  type: string
  genre: string
  meta?: string
  status?: string
  rating?: number | null
  source?: string
  description?: string
}

export interface Genre {
  name: string
  slug: string
}

export interface ChapterItem {
  name: string
  slug: string
  date: string
  number: number | null
}

export interface ComicDetail {
  slug: string
  title: string
  title_indonesian: string
  image: string
  synopsis: string
  summary: string
  type: string
  author: string
  status: string
  concept: string
  age_rating: string
  reading_direction: string
  genres: Genre[]
  chapters: ChapterItem[]
  latest_chapter: ChapterItem | null
  similar: ComicCard[]
  total_chapters: number
}

export interface ChapterDetail {
  comic_slug: string
  manga_title: string
  chapter_title: string
  images: string[]
  previous_chapter: string | null
  next_chapter: string | null
  page_count: number
  comic: {
    slug: string
    title: string
    image: string
    type: string
    genres: Genre[]
  } | null
}

export interface HomePayload {
  trending: ComicCard[]
  latest: ComicCard[]
  genres: Genre[]
  spotlight: ComicCard[]
  for_you: ComicCard[]
  for_you_genres: string[]
  anime_for_you: AnimeCard[]
  anime_for_you_genres: string[]
  generated_at: string
}

export interface CommentItem {
  id: number
  target_type: "comic" | "anime"
  target_id: string
  body: string
  created_at: string
  author: {
    id: number | null
    name: string
    avatar: string
  }
}

export interface Playlist {
  id: number
  name: string
  description: string
  is_public: boolean
  items: ComicCard[]
  created_at: string
  updated_at: string
}

export interface PlaylistDetail extends Playlist {
  owner: {
    id: number
    name: string
    avatar: string
  }
}

export interface PublicProfile {
  id: number
  name: string
  avatar: string
  bio: string
  joined_at: string
  is_me: boolean
  badges: Array<{ id: string; label: string }>
  badge_catalog: Array<{
    id: string
    label: string
    description: string
    earned: boolean
  }>
  stats: {
    favorites: number
    chapters_read: number
    comments: number
    streak_days: number
  }
  playlists: Playlist[]
}

export interface Favorite {
  comic_slug: string
  title: string
  image: string
  comic_type: string
  genre: string
  created_at: string
}

export interface HistoryItem {
  comic_slug: string
  title: string
  image: string
  comic_type: string
  genre: string
  chapter_slug: string
  chapter_name: string
  chapter_index: number | null
  updated_at: string
}

export interface LibraryPayload {
  favorites: Favorite[]
  history: HistoryItem[]
}

export interface StatsPayload {
  totals: {
    favorites: number
    comics_read: number
    chapters_read: number
    streak_days: number
    reading_minutes: number
  }
  delta_chapters: number
  series: Array<{ date: string; Dibaca: number; Dilihat: number }>
  genres: Array<{ name: string; value: number }>
  types: Array<{ name: string; value: number }>
  top_comics: Array<{ slug: string; title: string; reads: number }>
  recent: Array<{
    event_type: string
    label: string
    title: string
    comic_slug: string
    created_at: string
  }>
}

export interface AnimeCard {
  id: string
  title: string
  poster: string
  episodes: number | null
  release_day: string
  latest_release: string
  score: string
  status: string
}

export interface AnimeHomePayload {
  ongoing: AnimeCard[]
  complete: AnimeCard[]
}

export interface AnimeDetail {
  id: string
  title: string
  poster: string
  japanese: string
  score: string
  producers: string
  type: string
  status: string
  duration: string
  aired: string
  studios: string
  synopsis: string
  genres: Array<{ title: string; genreId: string; href: string }>
  episodes: Array<{ title: string; eps: number | null; date: string; id: string }>
  related: AnimeCard[]
}

export interface AnimeEpisode {
  title: string
  anime_id: string
  release_time: string
  default_streaming_url: string
  streams: Array<{
    title: string
    serverList: Array<{ title: string; serverId: string; href: string }>
  }>
  downloads: Array<{
    title: string
    size: string
    urls: Array<{ title: string; url: string }>
  }>
  prev: { title: string; episodeId: string; href: string } | null
  next: { title: string; episodeId: string; href: string } | null
  info: Record<string, string>
}

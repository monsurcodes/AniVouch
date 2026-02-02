/**
 * Anime/Manga release status
 */
export enum AnimeStatus {
	FINISHED = "FINISHED",
	RELEASING = "RELEASING",
	NOT_YET_RELEASED = "NOT_YET_RELEASED",
	CANCELLED = "CANCELLED",
	HIATUS = "HIATUS",
}

/**
 * Media format types
 */
export enum MediaFormat {
	TV = "TV",
	TV_SHORT = "TV_SHORT",
	MOVIE = "MOVIE",
	SPECIAL = "SPECIAL",
	OVA = "OVA",
	ONA = "ONA",
	MUSIC = "MUSIC",
	MANGA = "MANGA",
	NOVEL = "NOVEL",
	ONE_SHOT = "ONE_SHOT",
}

/**
 * Title information in multiple languages
 */
export interface AnimeTitle {
	romaji: string;
	english: string | null;
	native: string | null;
}

/**
 * Search result for anime/manga
 * @deprecated Use AnimeSearchResult instead
 */
export interface SearchAnimeResult {
	id: number;
	title: AnimeTitle;
	coverImage: {
		medium: string;
	};
	genres: string[];
	averageScore: number;
	episodes: number | null;
	status: AnimeStatus;
	format: MediaFormat;
	seasonYear: number | null;
}

/**
 * Anime search result (main export)
 */
export type AnimeSearchResult = SearchAnimeResult;

/**
 * Type guard to check if a status is valid
 */
export function isValidAnimeStatus(status: string): status is AnimeStatus {
	return Object.values(AnimeStatus).includes(status as AnimeStatus);
}

/**
 * Type guard to check if a format is valid
 */
export function isValidMediaFormat(format: string): format is MediaFormat {
	return Object.values(MediaFormat).includes(format as MediaFormat);
}

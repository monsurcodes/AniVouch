import * as z from "zod";

export const searchAnimeSchema = z.object({
	search: z.string().min(1, "Search query cannot be empty").max(100, "Search query too long"),
	sort: z
		.enum([
			"ID",
			"ID_DESC",
			"TITLE_ROMAJI",
			"TITLE_ROMAJI_DESC",
			"TITLE_ENGLISH",
			"TITLE_ENGLISH_DESC",
			"TITLE_NATIVE",
			"TITLE_NATIVE_DESC",
			"TYPE",
			"TYPE_DESC",
			"FORMAT",
			"FORMAT_DESC",
			"START_DATE",
			"START_DATE_DESC",
			"END_DATE",
			"END_DATE_DESC",
			"SCORE",
			"SCORE_DESC",
			"POPULARITY",
			"POPULARITY_DESC",
			"TRENDING",
			"TRENDING_DESC",
			"EPISODES",
			"EPISODES_DESC",
			"DURATION",
			"DURATION_DESC",
			"STATUS",
			"STATUS_DESC",
			"CHAPTERS",
			"CHAPTERS_DESC",
			"VOLUMES",
			"VOLUMES_DESC",
			"UPDATED_AT",
			"UPDATED_AT_DESC",
			"SEARCH_MATCH",
			"FAVOURITES",
			"FAVOURITES_DESC",
		])
		.default("SCORE_DESC"),
});

// Infer types from schemas
export type AnimeSearchInput = z.infer<typeof searchAnimeSchema>;

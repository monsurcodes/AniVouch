/**
 * Anime API Endpoints
 * All anime-related API calls
 */

import type { AnimeSearchResult } from "@repo/types";

import { apiClient } from "../client";

/**
 * Anime search params
 */
export interface AnimeSearchParams {
	query: string;
	page?: number;
	perPage?: number;
}

/**
 * Anime search response
 */
export interface AnimeSearchResponse {
	data: AnimeSearchResult[];
	pagination: {
		currentPage: number;
		hasNextPage: boolean;
	};
}

/**
 * Anime API
 */
export const animeApi = {
	/**
	 * Search anime by query
	 */
	search: async (params: AnimeSearchParams): Promise<AnimeSearchResponse> => {
		const searchParams = new URLSearchParams({
			query: params.query,
			...(params.page && { page: params.page.toString() }),
			...(params.perPage && { perPage: params.perPage.toString() }),
		});

		return apiClient.get(`anime/search?${searchParams.toString()}`).json<AnimeSearchResponse>();
	},
};

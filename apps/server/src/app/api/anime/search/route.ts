import { NextResponse } from "next/server";
import { searchAnimeSchema, SearchAnimeResult } from "@repo/types";
import { handleError, AppError } from "@/lib/utils";
import { env } from "@/lib";

export async function POST(request: Request) {
	const body = await request.json();

	const result = searchAnimeSchema.safeParse(body);

	if (!result.success) {
		return handleError(result.error);
	}

	const variables = result.data;

	const query = `
	query ($search: String, $sort: [MediaSort]) {
  Page(page: 1, perPage: 20) {
    media(search: $search, type: ANIME, sort: $sort) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        medium
      }
      genres
      averageScore
      episodes
      status
      format
      seasonYear
    }
  }
}
	`;

	const options = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			query: query,
			variables: variables,
		}),
	};

	try {
		const response = await fetch(env.ANILIST_GRAPHQL_API, options);
		if (!response.ok) {
			return handleError(new AppError("Failed to fetch from Anilist API", response.status));
		}
		const data = await response.json();

		const results: SearchAnimeResult[] = data.data.Page.media;
		return NextResponse.json({ results }, { status: 200 });
	} catch (error) {
		return handleError(error);
	}
}

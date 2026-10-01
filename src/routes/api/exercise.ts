import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/exercise")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get("name");

        if (!name) {
          return new Response(JSON.stringify([]), { status: 400 });
        }

        const apiKey = process.env.API_NINJAS_KEY;
        const res = await fetch(
          `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(name)}`,
          {
            headers: { "X-Api-Key": apiKey || "" },
          }
        );

        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});

import { useQuery } from "@tanstack/react-query";
import { graphql } from "@/generated/gql.ts";
import { request } from "@/utils/graphql.ts";

const HealthQuery = graphql(`
	query Health {
		health {
			status
		}
	}
`);

export function HealthStatus() {
	const { data, isPending, isError, isFetching, refetch } = useQuery({
		queryKey: ["health"],
		queryFn: () => request(HealthQuery),
		retry: false,
	});

	if (isPending) {
		return <p>Checking API…</p>;
	}
	if (isError) {
		return (
			<div role="alert">
				<p>API unavailable</p>
				<button type="button" onClick={() => refetch()} disabled={isFetching}>
					Retry
				</button>
			</div>
		);
	}
	return <p>API status: {data.health.status}</p>;
}

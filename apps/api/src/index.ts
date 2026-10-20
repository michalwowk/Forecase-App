import { createServer } from "node:http";
import { env } from "#src/env.ts";
import { logger } from "#src/logger.ts";
import { createApp } from "#src/server.ts";

const app = createApp();

createServer(app).listen(env.PORT, () => {
	logger.info(
		`API ready on http://localhost:${env.PORT}${app.graphqlEndpoint}`,
	);
});

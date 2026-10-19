import { createServer } from "node:http";
import { env } from "./env.ts";
import { logger } from "./logger.ts";
import { createApp } from "./server.ts";

const app = createApp();

createServer(app).listen(env.PORT, () => {
	logger.info(
		`API ready on http://localhost:${env.PORT}${app.graphqlEndpoint}`,
	);
});

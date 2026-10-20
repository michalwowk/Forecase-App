import { graphql } from "msw/graphql";

// Our GraphQL endpoint, whatever origin it runs on.
export const api = graphql.link("*/graphql");

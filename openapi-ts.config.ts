import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:4000/api/open-api",
  output: {
    path: "./src/api/generated",
    indexFile: false,
  },
  plugins: [
    {
      name: "@hey-api/client-axios",
      exportFromIndex: false,
      throwOnError: true,
      runtimeConfigPath: "./src/api/hey-api",
    },
    {
      name: "@hey-api/sdk",
      operations: {
        strategy: "flat",
        nesting: "operationId",
        methodName: {
          casing: "camelCase",
        },
      },
    },
    {
      name: "@tanstack/react-query",
      infiniteQueryOptions: true,
      queryOptions: true,
      setQueryData: true,
      queryKeys: {
        tags: false,
      },
    },
    {
      name: "@hey-api/typescript",
      requests: {
        case: "PascalCase",
      },
    },
  ],
});

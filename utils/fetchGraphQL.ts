import "server-only";

import {
  ResultOf,
  TypedDocumentNode,
  VariablesOf,
} from "@graphql-typed-document-node/core";
import { OperationDefinitionNode } from "graphql";
import { print } from "graphql/language/printer.js";
import { cookies, draftMode } from "next/headers";
import { serverEnv } from "../serverEnv";

const extractOperationName = (
  document: TypedDocumentNode<unknown, unknown>
): string | undefined => {
  let operationName = undefined;

  const operationDefinitions = document.definitions.filter(
    (definition) => definition.kind === `OperationDefinition`
  ) as OperationDefinitionNode[];

  if (operationDefinitions.length === 1) {
    operationName = operationDefinitions[0]?.name?.value;
  }

  return operationName;
};

export const resolveRequestDocument = (
  document: TypedDocumentNode<unknown, unknown>
): { query: string; operationName?: string } => {
  const operationName = extractOperationName(document);
  return { query: print(document), operationName };
};

class FetchError extends Error {
  errors: unknown[];

  constructor(
    message: string,
    public readonly response: Response,
    errors?: unknown[]
  ) {
    super(message);
    this.errors = errors ?? [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchGraphQL<
  Operation extends TypedDocumentNode<any, any>
>(
  operation: Operation,
  variables?: VariablesOf<Operation>,
  // headers?: Record<string, string>,
  // tags?: string[],
  params?: {
    headers?: Record<string, string>,
    tags?: string[],
  }
): Promise<ResultOf<Operation>> {
	const { query, operationName } = resolveRequestDocument(operation);

  try {
		// const { isEnabled: preview } = await draftMode();

    // let authHeader = "";
    // if (preview) {
    //   const auth = (await cookies()).get("wp_jwt")?.value;
    //   if (auth) {
    //     authHeader = `Bearer ${auth}`;
    //   }
    // }

    const body = JSON.stringify({
      query,
      operationName: operationName,
      variables: {
        // preview,
        ...variables,
      },
    });

    const response = await fetch(`${serverEnv.WORDPRESS_URL}/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ...(authHeader && { Authorization: authHeader }),
        // ...headers,
        ...params?.headers
      },
      body,
      // cache: preview ? 'no-cache' : 'default',
      // cache: "no-cache",
      next: {
        tags: ["wordpress", ...(params?.tags ?? [])],
				revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new FetchError("Failed to fetch GraphQL API", response);
    }

    const { data, errors } = await response.json();

    if (errors) {
      // if ((await draftMode()).isEnabled) {
      // if (preview) {
      //   (await draftMode()).disable();

      //   throw new FetchError(
      //     "Might be error in draft mode. Try to refresh the page.",
      //     response,
      //     errors
      //   );
      // }

      throw new FetchError(
        "GraphQL response contains errors",
        response,
        errors
      );
    }

    return data;
  } catch (error) {
    console.error("error 1", error);
    // throw error
    return null as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

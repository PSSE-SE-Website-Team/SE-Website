import { zCustomMutation, zCustomQuery } from "convex-helpers/server/zod4";
import { NoOp } from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";

// Zod Query
export const zodQuery = zCustomQuery(query, NoOp);

// Zod Mutation
export const zodMutation = zCustomMutation(mutation, NoOp);

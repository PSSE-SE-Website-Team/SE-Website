import { v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import { requireAuthenticated } from "../../platform/auth";
import { withMutationRlsContext, withQueryRlsContext } from "../../platform/rls";

export const list = query({
	args: {},
	handler: async (ctx) => {
		const secureCtx = await withQueryRlsContext(ctx);

		return await secureCtx.db
			.query("todos")
			.withIndex("by_creation_time")
			.order("desc")
			.collect();
	},
});

export const add = mutation({
	args: { text: v.string(), description: v.optional(v.string()) },
	handler: async (ctx, args) => {
		const authUserId = await requireAuthenticated(ctx);
		const secureCtx = await withMutationRlsContext(ctx);

		return await secureCtx.db.insert("todos", {
			text: args.text,
			description: args.description,
			completed: false,
			ownerAuthUserId: authUserId,
		});
	},
});

export const toggle = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, args) => {
		const secureCtx = await withMutationRlsContext(ctx);
		const todo = await secureCtx.db.get(args.id);

		if (!todo) {
			throw new Error("Todo not found");
		}

		await secureCtx.db.patch(args.id, {
			completed: !todo.completed,
		});
	},
});

export const remove = mutation({
	args: { id: v.id("todos") },
	handler: async (ctx, args) => {
		const secureCtx = await withMutationRlsContext(ctx);
		const todo = await secureCtx.db.get(args.id);

		if (!todo) {
			throw new Error("Todo not found");
		}

		await secureCtx.db.delete(args.id);
	},
});

import { mutation, query } from "../../_generated/server";
import { zodMutation } from "../../helpers/zod";
import { requireRole } from "../../platform/auth";
import { withMutationRlsContext, withQueryRlsContext } from "../../platform/rls";
import {
	CreatePostInputSchema,
	RemovePostInputSchema,
	TogglePostPublishInputSchema,
} from "./validators";

export const listPublic = query({
	args: {},
	handler: async (ctx) => {
		const secureCtx = await withQueryRlsContext(ctx);

		return await secureCtx.db
			.query("posts")
			.withIndex("by_published", (q) => q.eq("published", true))
			.order("desc")
			.collect();
	},
});

export const listForEditor = query({
	args: {},
	handler: async (ctx) => {
		await requireRole(ctx, "admin");
		const secureCtx = await withQueryRlsContext(ctx);

		return await secureCtx.db
			.query("posts")
			.withIndex("by_creation_time")
			.order("desc")
			.collect();
	},
});

export const generateUploadUrl = mutation({
	args: {},
	handler: async (ctx) => {
		await requireRole(ctx, "admin");
		return await ctx.storage.generateUploadUrl();
	},
});

export const create = zodMutation({
	args: CreatePostInputSchema.shape,
	handler: async (ctx, args) => {
		const { authUserId } = await requireRole(ctx, "admin");
		const secureCtx = await withMutationRlsContext(ctx);

		return await secureCtx.db.insert("posts", {
			title: args.title,
			content: args.content,
			published: args.published ?? false,
			authorAuthUserId: authUserId,
			coverImageStorageId: args.coverImageStorageId,
		});
	},
});

export const togglePublish = zodMutation({
	args: TogglePostPublishInputSchema.shape,
	handler: async (ctx, args) => {
		await requireRole(ctx, "admin");
		const secureCtx = await withMutationRlsContext(ctx);
		const post = await secureCtx.db.get(args.id);

		if (!post) {
			throw new Error("Post not found");
		}

		await secureCtx.db.patch(args.id, { published: args.published });
	},
});

export const remove = zodMutation({
	args: RemovePostInputSchema.shape,
	handler: async (ctx, args) => {
		await requireRole(ctx, "admin");
		const secureCtx = await withMutationRlsContext(ctx);
		const post = await secureCtx.db.get(args.id);

		if (!post) {
			throw new Error("Post not found");
		}

		if (post.coverImageStorageId) {
			await ctx.storage.delete(post.coverImageStorageId);
		}

		await secureCtx.db.delete(args.id);
	},
});

export const listPublicWithImageUrls = query({
	args: {},
	handler: async (ctx) => {
		const secureCtx = await withQueryRlsContext(ctx);
		const posts = await secureCtx.db
			.query("posts")
			.withIndex("by_published", (q) => q.eq("published", true))
			.order("desc")
			.collect();

		return await Promise.all(
			posts.map(async (post) => ({
				...post,
				coverImageUrl: post.coverImageStorageId
					? await ctx.storage.getUrl(post.coverImageStorageId)
					: null,
			})),
		);
	},
});

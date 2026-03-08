import { zid } from "convex-helpers/server/zod4";
import { z } from "zod";

const PostTitleSchema = z
	.string()
	.trim()
	.min(1, "Title is required")
	.max(120, "Title must be 120 characters or fewer");

const PostContentSchema = z
	.string()
	.trim()
	.min(1, "Content is required")
	.max(10000, "Content must be 10000 characters or fewer");

export const CreatePostInputSchema = z.strictObject({
	title: PostTitleSchema,
	content: PostContentSchema,
	published: z.boolean().optional().default(false),
	coverImageStorageId: zid("_storage").optional(),
});

export const TogglePostPublishInputSchema = z.strictObject({
	id: zid("posts"),
	published: z.boolean(),
});

export const RemovePostInputSchema = z.strictObject({
	id: zid("posts"),
});

export type CreatePostInput = z.infer<typeof CreatePostInputSchema>;
export type TogglePostPublishInput = z.infer<
	typeof TogglePostPublishInputSchema
>;
export type RemovePostInput = z.infer<typeof RemovePostInputSchema>;

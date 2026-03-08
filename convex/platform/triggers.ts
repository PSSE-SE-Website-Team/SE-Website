import { Triggers } from "convex-helpers/server/triggers";
import { authComponent } from "../auth";
import type { DataModel } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const triggers = new Triggers<DataModel, MutationCtx>();

function registerAuditTrigger(tableName: "todos" | "posts" | "userProfiles") {
	triggers.register(tableName, async (ctx, change) => {
		const actor = await authComponent.getAuthUser(ctx);

		await ctx.innerDb.insert("auditLogs", {
			tableName,
			resourceId: String(change.id),
			operation: change.operation,
			actorAuthUserId: actor?.userId ?? undefined,
			message: `${tableName}:${change.operation}`,
			at: Date.now(),
		});
	});
}

registerAuditTrigger("todos");
registerAuditTrigger("posts");
registerAuditTrigger("userProfiles");

export function wrapMutationWithTriggers(ctx: MutationCtx): MutationCtx {
	return triggers.wrapDB(ctx);
}

import { query } from './_generated/server'
import { authComponent } from './auth'

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx)

    if (!authUser?.userId) {
      return null
    }

    const authUserId = authUser.userId

    const profile = await ctx.db
      .query('userProfiles')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
      .unique()

    return {
      userId: authUserId,
      email: authUser.email ?? null,
      role: profile?.role ?? 'student',
    }
  },
})

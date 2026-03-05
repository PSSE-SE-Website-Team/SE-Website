import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    description: v.optional(v.string())
  }),
  userProfiles: defineTable({
    authUserId: v.string(),
    role: v.union(
      v.literal('student'),
      v.literal('admin'),
      v.literal('superadmin')
    )
  }).index('by_auth_user_id', ['authUserId'])
})

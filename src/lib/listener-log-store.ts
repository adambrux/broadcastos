import { ensureListenerLogSchema, getCloudSaveSql, type ListenerLogRow } from "@/lib/cloud-save-db"

type BroadcastSql = NonNullable<ReturnType<typeof getCloudSaveSql>>

export function listenerNameKeyServer(name: string) {
  return name.toLowerCase().replace(/\s+/g, " ").trim()
}

/**
 * One more message from this person on this show day (or one fewer). The same
 * upsert the On Air name log uses, shared so a banked message counts too and
 * "last heard" stays true for the missing list.
 */
export async function bumpListenerLog(
  sql: BroadcastSql,
  userId: string,
  input: { name: string; showId: string; showDate: string; source: string; delta?: 1 | -1 }
) {
  await ensureListenerLogSchema(sql)
  const delta = input.delta === -1 ? -1 : 1
  const name = input.name.replace(/\s+/g, " ").trim()
  const rows = await sql`
    INSERT INTO broadcastos_listener_log (id, user_id, name_key, display_name, show_id, show_date, message_count, source_counts)
    VALUES (${crypto.randomUUID()}, ${userId}, ${listenerNameKeyServer(name)}, ${name}, ${input.showId}, ${input.showDate}, 1, jsonb_build_object(${input.source}::text, 1))
    ON CONFLICT (user_id, name_key, show_id, show_date)
    DO UPDATE SET
      message_count = GREATEST(1, broadcastos_listener_log.message_count + ${delta}),
      source_counts = jsonb_set(
        broadcastos_listener_log.source_counts,
        ARRAY[${input.source}::text],
        to_jsonb(GREATEST(0, COALESCE((broadcastos_listener_log.source_counts->>${input.source})::int, 0) + ${delta}))
      ),
      display_name = ${name},
      updated_at = NOW()
    RETURNING id, name_key, display_name, show_id, show_date, message_count, source_counts, created_at, updated_at
  ` as ListenerLogRow[]
  return rows.at(0) ?? null
}

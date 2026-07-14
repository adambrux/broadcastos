"use client"

import { ShowLaunchSequencePanel } from "@/components/show-launch-sequence"
import { UsableProducerDesk } from "@/components/usable-producer-desk"
import { useStudioWorkspace } from "@/lib/studio-workspace"

export function ProducerDeskWithLaunch() {
  const workspace = useStudioWorkspace()

  return (
    <div className="space-y-5">
      <ShowLaunchSequencePanel showId={workspace.showId} date={workspace.date} />
      <UsableProducerDesk />
    </div>
  )
}

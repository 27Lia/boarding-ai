import { create } from 'zustand'
import { Workspace, WorkspaceMember } from '@/types'

interface WorkspaceState {
  currentWorkspace: Workspace | null
  members: WorkspaceMember[]
  setWorkspace: (workspace: Workspace) => void
  setMembers: (members: WorkspaceMember[]) => void
  clearWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  members: [],
  setWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setMembers: (members) => set({ members }),
  clearWorkspace: () => set({ currentWorkspace: null, members: [] }),
}))

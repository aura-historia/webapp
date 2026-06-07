const RESOURCE_STATES = ["ACTIVE", "INACTIVE_BY_USER", "INACTIVE_BY_RESTRICTED_PLAN"] as const;
export type ResourceState = (typeof RESOURCE_STATES)[number];
export type PatchResourceState = "ACTIVE" | "INACTIVE_BY_USER";

export function parseResourceState(state?: string | null): ResourceState {
    switch (state) {
        case "ACTIVE":
        case "INACTIVE_BY_USER":
        case "INACTIVE_BY_RESTRICTED_PLAN":
            return state;
        default:
            return "ACTIVE";
    }
}

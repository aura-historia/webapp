import { getCurrentUser } from "aws-amplify/auth";

/** Capture the authenticated identity before a personal mutation request is dispatched. */
export async function getMutationViewer(): Promise<string> {
    return (await getCurrentUser()).userId;
}

/** Like `getMutationViewer`, but lets anonymous requests reach the API and fail there. */
export async function findMutationViewer(): Promise<string | undefined> {
    try {
        return await getMutationViewer();
    } catch {
        return undefined;
    }
}

/** Cache writes for a settled mutation apply only while its viewer is still signed in. */
export async function isCurrentViewer(viewerId: string | undefined): Promise<boolean> {
    if (!viewerId) return false;
    return (await findMutationViewer()) === viewerId;
}

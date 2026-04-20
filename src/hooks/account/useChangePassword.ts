import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { updatePassword } from "aws-amplify/auth";

export type ChangePasswordData = {
    oldPassword: string;
    newPassword: string;
};

export function useChangePassword(): UseMutationResult<void, Error, ChangePasswordData> {
    return useMutation({
        mutationFn: async ({ oldPassword, newPassword }: ChangePasswordData) => {
            await updatePassword({ oldPassword, newPassword });
        },
        onError: (error) => {
            console.error("[useChangePassword]", error);
        },
    });
}

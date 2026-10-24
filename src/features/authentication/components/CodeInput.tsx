import type { ComponentProps } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export const CODE_LENGTH = 6;
const SLOT_INDICES = Array.from({ length: CODE_LENGTH }, (_, index) => index);

type CodeInputProps = Omit<
    ComponentProps<typeof InputOTP>,
    "maxLength" | "children" | "render" | "pattern"
>;

/** Six-digit verification or reset code: one raised box per digit, serif lining figures. */
export function CodeInput(props: CodeInputProps) {
    return (
        <InputOTP
            {...props}
            maxLength={CODE_LENGTH}
            pattern="^\d+$"
            inputMode="numeric"
            autoComplete="one-time-code"
            containerClassName="w-full"
        >
            <InputOTPGroup className="grid w-full grid-cols-6 gap-1.5 sm:gap-2.5">
                {SLOT_INDICES.map((index) => (
                    <InputOTPSlot
                        key={index}
                        index={index}
                        aria-invalid={props["aria-invalid"]}
                        className="h-14 w-full rounded-md border-0 bg-surface-raised font-serif text-2xl leading-none text-ink shadow-(--shadow-field) [font-variant-numeric:lining-nums_tabular-nums] first:rounded-md first:border-0 last:rounded-md aria-invalid:shadow-[inset_0_0_0_1.5px_var(--oxblood)] data-[active=true]:shadow-[inset_0_0_0_1.5px_var(--ink)] data-[active=true]:ring-0 sm:h-16 sm:text-[28px]"
                    />
                ))}
            </InputOTPGroup>
        </InputOTP>
    );
}

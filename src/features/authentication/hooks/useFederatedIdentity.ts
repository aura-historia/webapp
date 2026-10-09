import { useEffect, useState } from "react";
import {
    type FederatedIdentity,
    readFederatedIdentity,
} from "@/features/authentication/lib/federatedIdentity.ts";

/** The signed-in federated identity: undefined while reading, null for native or signed-out users. */
export function useFederatedIdentity(): FederatedIdentity | null | undefined {
    const [identity, setIdentity] = useState<FederatedIdentity | null | undefined>(undefined);

    useEffect(() => {
        let isActive = true;
        void readFederatedIdentity().then((result) => {
            if (isActive) {
                setIdentity(result);
            }
        });

        return () => {
            isActive = false;
        };
    }, []);

    return identity;
}

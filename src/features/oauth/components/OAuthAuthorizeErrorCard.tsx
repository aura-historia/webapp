import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { OAuthAuthorizePageContainer } from "@/features/oauth/components/OAuthAuthorizePageContainer.tsx";

interface OAuthAuthorizeErrorCardProps {
    readonly title: string;
    readonly description: string;
}

export function OAuthAuthorizeErrorCard({ title, description }: OAuthAuthorizeErrorCardProps) {
    return (
        <OAuthAuthorizePageContainer>
            <Card className="w-full max-w-lg mx-auto gap-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">{description}</p>
                </CardContent>
            </Card>
        </OAuthAuthorizePageContainer>
    );
}

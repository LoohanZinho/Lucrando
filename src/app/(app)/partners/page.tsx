import { PartnersManager } from "@/components/settings/partners-manager";

export default function PartnersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Sócios</h1>
                <p className="text-muted-foreground">
                    Adicione, edite e gerencie os sócios da sua equipe.
                </p>
            </div>
            <PartnersManager />
        </div>
    )
}

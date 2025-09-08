import { InfluencersManager } from "@/components/settings/influencers-manager";

export default function InfluencersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Influenciadores</h1>
        <p className="text-muted-foreground">
          Adicione, edite e gerencie os influenciadores com quem você trabalha.
        </p>
      </div>

       <InfluencersManager />
      
    </div>
  );
}

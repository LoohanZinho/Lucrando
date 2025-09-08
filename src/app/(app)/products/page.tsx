
import { ProductsManager } from "@/components/settings/products-manager";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
        <p className="text-muted-foreground">
          Adicione, edite e gerencie os produtos que seus influenciadores divulgam.
        </p>
      </div>

       <ProductsManager />
      
    </div>
  );
}

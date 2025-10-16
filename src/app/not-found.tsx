
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Frown } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Frown className="h-10 w-10 text-primary" />
            </div>
        </CardHeader>
        <CardContent className="space-y-2">
            <CardTitle className="text-3xl font-bold">Página Não Encontrada</CardTitle>
            <CardDescription className="text-lg">
                A página que você está procurando não existe ou foi movida.
            </CardDescription>
        </CardContent>
        <CardFooter className="flex justify-center">
            <Button asChild>
                <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, updateDoc, Timestamp, doc } from 'firebase/firestore/lite';
import { db } from '@/lib/firebase';
import { add } from 'date-fns';

// IMPORTANTE: Mantenha este secret seguro e, idealmente, mova-o para variáveis de ambiente.
const CAKTO_WEBHOOK_SECRET = process.env.CAKTO_WEBHOOK_SECRET || "15edd2d5-d662-418a-93ff-d1ba6a631272";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // 1. Verificação de Segurança
    if (payload.secret !== CAKTO_WEBHOOK_SECRET) {
      console.warn("Webhook secret mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Processar apenas eventos de pagamento bem-sucedido
    if (payload.event !== 'charge_paid') {
      return NextResponse.json({ message: `Event ${payload.event} received, but not processed.` }, { status: 200 });
    }
    
    const { data } = payload;
    const customerEmail = data?.customer?.email;
    const paidAt = data?.paidAt;

    if (!customerEmail || !paidAt) {
      return NextResponse.json({ error: "Missing customer email or payment date" }, { status: 400 });
    }

    // 3. Encontrar o usuário no Firestore pelo email
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where("email", "==", customerEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(`Webhook received for non-existent user: ${customerEmail}`);
      // Retornamos 200 para que a Cakto não tente reenviar o webhook.
      return NextResponse.json({ message: "User not found, but webhook acknowledged." }, { status: 200 });
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);

    // 4. Calcular a data de expiração e atualizar o usuário
    const paidAtDate = new Date(paidAt);
    const subscriptionExpiresAt = add(paidAtDate, { days: 30 });

    await updateDoc(userRef, {
      paidAt: Timestamp.fromDate(paidAtDate),
      subscriptionExpiresAt: Timestamp.fromDate(subscriptionExpiresAt),
    });

    console.log(`Subscription updated for user: ${customerEmail}`);
    return NextResponse.json({ message: "Webhook processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error processing webhook:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

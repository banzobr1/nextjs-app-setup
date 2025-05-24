import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase-init";
import { createUserWithEmailAndPassword } from "firebase/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log("Register route hit");
  
  try {
    const body = await req.json();
    console.log("Request body:", body);

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha são obrigatórios." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User registered:", user.email);

    return NextResponse.json(
      { message: "Usuário registrado com sucesso." },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Registration error:", error);
    
    // Handle Firebase specific errors
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: "Este email já está registrado." },
        { status: 409 }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro no servidor." },
      { status: 500 }
    );
  }
}

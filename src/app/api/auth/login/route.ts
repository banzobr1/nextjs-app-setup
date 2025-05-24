import { NextResponse } from "next/server";
import { auth } from "@/lib/firebase-init";
import { signInWithEmailAndPassword } from "firebase/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log("Login route hit");
  
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

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Formato de email inválido." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User logged in:", user.email);

    return NextResponse.json(
      { 
        message: "Login realizado com sucesso.",
        user: {
          email: user.email,
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      },
      { 
        status: 200,
        headers: {
          'Set-Cookie': `auth=${await user.getIdToken()}; Path=/; HttpOnly; Secure; SameSite=Strict`
        }
      }
    );

  } catch (error: any) {
    console.error("Login error:", error);
    
    // Handle Firebase specific errors
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { error: "Email ou senha inválidos." },
        { status: 401 }
      );
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: "Email inválido." },
        { status: 400 }
      );
    }

    if (error.code === 'auth/too-many-requests') {
      return NextResponse.json(
        { error: "Muitas tentativas de login. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    if (error.code === 'auth/network-request-failed') {
      return NextResponse.json(
        { error: "Erro de conexão. Verifique sua internet." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erro no servidor. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}

import NextAuth, { AuthOptions, SessionStrategy } from "next-auth"
import { MongoDBAdapter } from "@next-auth/mongodb-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { clientPromise, connectToDatabase } from "@/lib/mongodb"
import { compare } from "bcrypt"
import {getServerSession} from "next-auth/next"
import { Session } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          console.log("Credentials are missing");
          return null;
        }

        try {
          const { db } = await connectToDatabase();
          console.log("Connected to database");

          // Look in admins, teachers, and students collections
          const admin = await db.collection("admins").findOne({ 
            $or: [
              { email: credentials.email },
              { username: credentials.email },
              { email: credentials.email.toLowerCase() },
              { username: credentials.email.toLowerCase() }
            ]
          });

          const teacher = await db.collection("teachers").findOne({ 
            email: credentials.email 
          });

          const student = await db.collection("students").findOne({ 
            email: credentials.email 
          });

          const user = admin || teacher || student;

          console.log("User search result:", user ? "User found" : "User not found");

          if (!user) {
            console.log("User not found in admins, teachers, or students collection");
            return null;
          }

          console.log("User found:", user.email);

          const isPasswordValid = await compare(credentials.password, user.password);

          console.log("Password validation result:", isPasswordValid ? "Valid" : "Invalid");

          if (!isPasswordValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("User authenticated successfully");
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.username || user.name,
            role: user.role || (admin ? 'admin' : teacher ? 'teacher' : 'student'),
          };
        } catch (error) {
          console.error("Error in authorize function:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Çıkış yapma URL'sini kontrol et
      if (url.startsWith("/api/auth/signout")) {
        return `${baseUrl}/login`
      }
      // Giriş yapıldıktan sonra yönlendirme
      if (url.startsWith(baseUrl)) {
        // URL, baseUrl ile başlıyorsa (yani dahili bir yönlendirme ise)
        if (url.includes('/dashboard')) {
          // Eğer URL /dashboard içeriyorsa, rolü kontrol et ve uygun sayfaya yönlendir
          const session = await getServerSession(authOptions);
          if (session) {
            switch (session.user.role) {
              case 'admin':
              case 'manager':
                return `${baseUrl}/admin/dashboard`;
              case 'teacher':
                return `${baseUrl}/teacher/dashboard`;
              case 'student':
                return `${baseUrl}/student/dashboard`;
              default:
                return `${baseUrl}/unauthorized`;
            }
          }
        }
        // Diğer dahili yönlendirmeler için URL'i olduğu gibi döndür
        return url;
      }
      // Harici yönlendirmeler için baseUrl'e geri dön
      return baseUrl;
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }


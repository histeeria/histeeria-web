import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.histeeria.com";

type SyncedUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

async function syncUserWithApi(
  email: string,
  full_name?: string | null,
  avatar_url?: string | null,
): Promise<SyncedUser | null> {
  const res = await fetch(`${API_URL}/v1/auth/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
      full_name: full_name ?? null,
      avatar_url: avatar_url ?? null,
    }),
  });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as SyncedUser;
}

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);
const githubConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
);

export const authOptions: NextAuthOptions = {
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
    ...(githubConfigured
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isRegister: { type: "text" },
        fullName: { type: "text" },
        avatarUrl: { type: "text" },
        code: { type: "text" },
        sudoToken: { type: "text" },
      },
      async authorize(credentials) {
        if (credentials?.sudoToken) {
          const res = await fetch(`${API_URL}/v1/auth/sudo/consume`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: credentials.sudoToken }),
          });
          if (!res.ok) {
            const err = (await res.json()) as { detail?: string };
            throw new Error(err.detail || "Sudo session expired");
          }
          const user = (await res.json()) as {
            id: string;
            email: string;
            full_name: string | null;
            avatar_url: string | null;
          };
          return {
            id: user.id,
            email: user.email,
            name: user.full_name ?? undefined,
            image: user.avatar_url ?? undefined,
          };
        }

        if (!credentials?.email) return null;

        try {
          if (credentials.isRegister === "true") {
            const res = await fetch(`${API_URL}/v1/auth/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                code: credentials.code,
                password: credentials.password,
                full_name: credentials.fullName,
                avatar_url: credentials.avatarUrl || null,
              }),
            });
            if (!res.ok) {
              const err = (await res.json()) as { detail?: string };
              throw new Error(err.detail || "Registration failed");
            }
            const user = (await res.json()) as {
              id: string;
              email: string;
              full_name: string | null;
              avatar_url: string | null;
            };
            return {
              id: user.id,
              email: user.email,
              name: user.full_name ?? undefined,
              image: user.avatar_url ?? undefined,
            };
          }

          const res = await fetch(`${API_URL}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) {
            const err = (await res.json()) as { detail?: string };
            throw new Error(err.detail || "Invalid email or password");
          }
          const user = (await res.json()) as {
            id: string;
            email: string;
            full_name: string | null;
            avatar_url: string | null;
          };
          return {
            id: user.id,
            email: user.email,
            name: user.full_name ?? undefined,
            image: user.avatar_url ?? undefined,
          };
        } catch (error) {
          throw new Error(error instanceof Error ? error.message : "Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      const isOAuth = account?.provider === "google" || account?.provider === "github";
      if (!isOAuth) {
        return true;
      }

      const synced = await syncUserWithApi(user.email, user.name, user.image);
      return synced !== null;
    },
    async jwt({ token, user, trigger, session }) {
      if (user?.email) {
        token.email = user.email;
        token.name = user.name ?? undefined;
        token.picture = user.image ?? undefined;

        if (user.id) {
          token.sub = user.id;
        } else {
          const synced = await syncUserWithApi(user.email, user.name, user.image);
          if (synced) {
            token.sub = synced.id;
            if (synced.full_name) token.name = synced.full_name;
            if (synced.avatar_url) token.picture = synced.avatar_url;
          }
        }
      }

      if (trigger === "update" && session) {
        const nextSession = session as { name?: string; image?: string };
        if (nextSession.name) token.name = nextSession.name;
        if (nextSession.image) token.picture = nextSession.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string | undefined;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/onboarding`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
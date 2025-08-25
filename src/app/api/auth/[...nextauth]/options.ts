// import { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";
// import dbConnect from "@/lib/dbConnect";
// import UserModel from "@/models/user";


// export const authOptions: NextAuthOptions = {
//     providers: [
//         CredentialsProvider({
//             id: "credentials",
//             name: "Credentials",
//             credentials: {
//                 email: { label: "Email", type: "text"},
//                 password: { label: "Password", type: "password" }
//             },
//             async authorize(credentials:any): Promise<any>{
//                 await dbConnect()
//                 try {
//                     const user = await UserModel.findOne({
//                         $or : [
//                             { email: credentials.identifier },
//                             {username: credentials.identifier}
//                         ]
//                     })
//                     if(!user){
//                         throw new Error("No user found with this user")
//                     }
//                     if(!user.isVerified){
//                         throw new Error("please verify your account before login")
//                     }
//                     const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
//                     if(isPasswordCorrect) {
//                         return user
//                     } else {
//                         throw new Error("password is incorrect")
//                     }
//                 } catch (err: any) {
//                     throw new Error(err)
//                 }

//             }
//         })
//     ],
//     callbacks: {
//         async jwt({ token, user}) {
//             if(user){
//                 token._id = user._id?.toString(),
//                 token.isVerified = user.isVerified;
//                 token.isAcceptingMessages = user.isAcceptingMessages;
//                 token.username = user.username;
//             }
//             return token
//         },
//         async session({ session, token }) {
//             if(token) {
//                 session.user._id = token._id
//                 session.user.isVerified = token.isVerified
//                 session.user.isAcceptingMessages = token.isAcceptingMessages
//                 session.user.username = token.username
//             }
//             return session
//         },
//     },
//     pages: {
//         signIn: "/sign-in"
//     },
//     session: {
//         strategy: 'jwt'
//     },
//     secret: process.env.NEXTAUTH_SECRET
// }
import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel, { User as MongooseUser } from "@/models/user";

interface Credentials {
  email: string;
  password: string;
  identifier?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Credentials | undefined
      ): Promise<NextAuthUser | null> {
        if (!credentials) return null;

        await dbConnect();

        const user = await UserModel.findOne({
          $or: [
            { email: credentials.identifier || credentials.email },
            { username: credentials.identifier },
          ],
        });

        if (!user) throw new Error("No user found with this identifier");
        if (!user.isVerified)
          throw new Error("Please verify your account before login");

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) throw new Error("Password is incorrect");

        // ✅ Map mongoose user → NextAuth User
        return {
          id: user._id.toString(), // NextAuth requires `id: string`
          email: user.email,
          name: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // 👇 we safely extend the token with custom fields
        const u = user as unknown as MongooseUser;
        token._id = u._id?.toString();
        token.isVerified = u.isVerified;
        token.isAcceptingMessages = u.isAcceptingMessage;
        token.username = u.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user._id = token._id as string;
        (session.user ).isVerified = token.isVerified;
        (session.user ).isAcceptingMessages = token.isAcceptingMessages;
        (session.user ).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

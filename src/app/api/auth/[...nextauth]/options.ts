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


import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";

// define a type for our credentials
interface Credentials {
  email: string;
  password: string;
  identifier?: string; // you’re checking both email and username
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
      ): Promise<User | null> {
        if (!credentials) return null;

        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier || credentials.email },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this identifier");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before login");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user as unknown as User; // casting because mongoose returns Document
          } else {
            throw new Error("Password is incorrect");
          }
        } catch (err) {
          // forward error as proper Error
          if (err instanceof Error) throw err;
          throw new Error("Authorization failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = (user as any)._id?.toString(); // if your User type doesn’t extend mongoose schema
        token.isVerified = (user as any).isVerified;
        token.isAcceptingMessages = (user as any).isAcceptingMessages;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any)._id = token._id;
        (session.user as any).isVerified = token.isVerified;
        (session.user as any).isAcceptingMessages =
          token.isAcceptingMessages;
        (session.user as any).username = token.username;
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

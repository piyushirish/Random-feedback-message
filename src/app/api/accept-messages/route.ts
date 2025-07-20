import dbConnect from "@/lib/dbConnect";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { success } from "zod/v4";
import UserModel from "@/models/user";
 

export async function POST(request:Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, {status: 401})
    }

    const userId = user._id
    const {acceptMessages} = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )
        if(!updatedUser){
            return Response.json({
                success: false,
                message: "failed to update user status to accept message"
            },{status: 401})
        }

        return Response.json({
                success: true,
                message: "message acceptance status updated successfully",
                updatedUser 
            },{status: 401})
    } catch (error) {
        console.log("failed to update user status to accept message")
        return Response.json({
            success: false,
            message: "failed to update user status to accept message"
        },{status:500})
    }
}


export async function GET(request: Request){
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "Not authenticated"
        }, {status: 401})
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId)
    
        if(!foundUser){
            return Response.json({
                    success: false,
                    message: "user not found"
                },{status: 404})
        }
    
        return Response.json({
                    success: true,
                    isAcceptingMessage:foundUser.isAcceptingMessage
                },{status: 200})
    } catch (error) {
        console.log("Error in getting message acceptance status")
        return Response.json({
            success: false,
            message: "Error in getting message acceptance status"
        },{status:500})
    }
}
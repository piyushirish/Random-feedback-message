import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/models/user";


export async function POST(request:Request) {
    await dbConnect()

    const {username, content} = await request.json()
    try {
        const user = await UserModel.findOne({username})
        if(!user) {
            return Response.json({
                success: false,
                message: "User not found"
            },{status: 404})
        }

        // is user accepting messages

        if(!user.isAcceptingMessage){
            return Response.json({
                success:false,
                message: "User is not accepting the messages"
            },{status: 403})
        }
        const newMessage = {content, createdAt: new Date()}
        user.messages.push(newMessage as Message)
        await user.save()
        return Response.json({
                success:true,
                message: "message send successfully"
            },{status: 200})

    } catch (error) {
        console.log("error adding messages")
        return Response.json({
                success:false,
                message: "internal server error"
            },{status: 500})
    }
}
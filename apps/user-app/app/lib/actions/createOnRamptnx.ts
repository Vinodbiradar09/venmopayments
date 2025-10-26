"use server";
import prisma from "@repo/db/client";
import {getServerSession} from "next-auth";
import { authOptions } from "../auth";


interface OnRampResponse {
success: boolean;
  message: string;
  token?: string;
  user_identifier?: string;
  amountRef?: string | number;
}

export async function createOnRampTransaction(amount : number , provider : string) : Promise<OnRampResponse> {
    try {
        const session = await getServerSession(authOptions);
       const userId = session?.user?.id;
       const token = Math.random().toString();
       if(!userId){
        return {
            success : false,
            message : "please login",
        }
       }
     await prisma.onRampTransaction.create({
        data : {
            userId : Number(userId),
            amount : Number(amount),
            provider,
            token,
            startTime : new Date(),
            status : "Processing",
        }
       })
       return {
        message : "on ramp transaction created successfully",
        success : true,
        token : token ?? "",
        user_identifier : userId ?? "1",
        amountRef : amount ?? "0",
       }
    } catch (error) {
        console.log("error on creating the on ramp transactions");
        return {
            success : false,
            message : "Failed to create on-ramp transaction",
        }
    }
}

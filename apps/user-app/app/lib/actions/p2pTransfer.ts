"use server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"
import prisma from "@repo/db/client"



export async function p2pTransfer(to : string , amount :number) {
    try {
        const session = await getServerSession(authOptions);
        const from = session?.user?.id;
        if(!from){
            return {
                message : "please login"
            }
        }
        const toUser = await prisma.user.findFirst({
            where : {
                number : to
            }
        });
        if(!toUser){
            return {
                message : "there is no user whom you are trying to send the money"
            }
        }
        // we will learn what is the database locking and how it is different from the transactions
        // what are the transactions it simple here we execute all the db request completely or nothing will happens 
        // what is database locking there are multiple types of locking in the postgresql 
        // whethere we need to lock a row or a complete table and all 
        // it is simple locking means if the user sends multiple request for we need to locked the row becoz if the multiple request comes it will be problem
        // example the user has 200rs and he made the four request of each 100rs now the first comes and checks the balance now the second request also comes before completing the complete transactions before updating the amount on both side the from user and to user side it bypassess the four request of user for checking the 200< 100 which is bad so we lock the database by saying untill this request finish we need to lock the db after this request only anothere request is handled 
        const result = await prisma.$transaction(async(tx)=>{
            await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
             // we should use the queryRaw unforunately the prisma does not supports for the locks so we need to inject the sql query 
            const fromBalance = await tx.balance.findFirst({
                where :{ userId : Number(from)}
            });
            if(!fromBalance || fromBalance.amount < amount){
                throw new Error('Insufficient funds');
            }
            await tx.balance.update({
                where : { userId : Number(from)},
                data : {
                    amount : {decrement : amount}
                }
            });
            
            await tx.balance.update({
                where : { userId : Number(toUser.id)},
                data : {
                    amount : {increment : amount}
                }
            });
            await tx.p2pTransfer.create({
                data : {
                    fromUserId :Number(from),
                    toUserId : toUser.id,
                    amount : amount,
                    timeStamp : new Date(),
                }
            });

            return {
                success : true,
            }
        })

        return result;
    } catch (error) {
        console.log("server error while transferring the p2p transactions");
        return {
            message : "server error while transferring the p2p transactions",
            success : false
        }
    }
}


// what is the database locking 
// a lock is the mechanism that prevents the two or more transactions from changing the same data at same time 
// await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`; here we are telling that the the row needs to locked where the userId = from which is userId for update now no other transactions will come in the race conditions 
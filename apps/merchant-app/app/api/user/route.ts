// import { NextResponse } from "next/server"
// import  prisma  from "@repo/db/client";

import { NextResponse } from "next/server"

// export const GET = async () => {
//     await prisma.user.create({
//         data: {
//             email: "asd",
//             name: "adsads",
//             number : "7204832222",
//             password : "hello"
//         }
//     })
//     return NextResponse.json({
//         message: "hi there"
//     })
// }

export const GET = async()=>{
    return NextResponse.json({
        message : "hello from the merchant app"
    },{status : 200})
}
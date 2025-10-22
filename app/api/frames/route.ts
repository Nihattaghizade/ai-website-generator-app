import { db } from "@/config/db";
import { frameTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function GET(req:NextRequest){
    const {searchParams}=new URL(req.url)
    const frameId=searchParams.get('frameId')
    const projectId=searchParams.get('projectId')

    const frameResult = await db.select().from(frameTable)
    //@ts-ignore
    .where(eq(frameTable.frameId,frameId))
}
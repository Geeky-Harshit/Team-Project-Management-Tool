import connectDB from "./db";
import Activity from "@/models/activity/Activity";
import { ActivityType } from "@/types";
import mongoose from "mongoose";

interface LogParams {
  organizationId: mongoose.Types.ObjectId | string;
  boardId?: mongoose.Types.ObjectId | string | null;
  cardId?: mongoose.Types.ObjectId | string | null;
  actorId: string;
  type: ActivityType;
  message: string;
}

export async function logActivity(params: LogParams) {
  await connectDB();
  return await Activity.create({
    organizationId: new mongoose.Types.ObjectId(params.organizationId),
    boardId: params.boardId ? new mongoose.Types.ObjectId(params.boardId) : null,
    cardId: params.cardId ? new mongoose.Types.ObjectId(params.cardId) : null,
    actorId: params.actorId,
    type: params.type,
    message: params.message,
  });
}
import { toast } from "sonner";
import type { ActivityType } from "@/types/activity";
import { activityToastMessages } from "@/lib/activity-toast";

export function showActivityToast(activityType: ActivityType) {
  toast.success(activityToastMessages[activityType]);
}
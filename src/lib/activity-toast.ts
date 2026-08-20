import type { ActivityType } from "@/types/activity";

export const activityToastMessages: Record<ActivityType, string> = {
  BOARD_CREATED: "Board created successfully.",
  BOARD_RENAMED: "Board renamed successfully.",
  BOARD_ARCHIVED: "Board archived successfully.",
  BOARD_RESTORED: "Board restored successfully.",

  LIST_CREATED: "List created successfully.",
  LIST_RENAMED: "List renamed successfully.",
  LIST_DELETED: "List deleted successfully.",

  CARD_CREATED: "Card created successfully.",
  CARD_UPDATED: "Card updated successfully.",
  CARD_MOVED: "Card moved successfully.",
  CARD_ASSIGNED: "Card assigned successfully.",
  CARD_DELETED: "Card deleted successfully.",

  COMMENT_ADDED: "Comment added successfully.",

  MEMBER_INVITED: "Member invited successfully.",
  MEMBER_JOINED: "Member joined successfully.",
};
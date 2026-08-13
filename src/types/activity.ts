export type ActivityType =
  | "BOARD_CREATED"
  | "BOARD_RENAMED"
  | "BOARD_ARCHIVED"
  | "LIST_CREATED"
  | "LIST_RENAMED"
  | "LIST_DELETED"
  | "CARD_CREATED"
  | "CARD_UPDATED"
  | "CARD_MOVED"
  | "CARD_ASSIGNED"
  | "CARD_DELETED"
  | "COMMENT_ADDED"
  | "MEMBER_INVITED"
  | "MEMBER_JOINED";

export interface Activity {
  id: string;
  organizationId: string;
  boardId: string | null;
  cardId: string | null;
  actorId: string;
  type: ActivityType;
  message: string;
  createdAt: string;
  updatedAt: string;
}

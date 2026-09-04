export interface Card {
  id: string;
  listId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  dueDate: string | null;
  position: string;
  archived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface Label {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}
export interface CardLabel {
  id: string;
  cardId: string;
  labelId: string;
  createdAt: string;
  updatedAt: string;
}
export interface Comment {
  id: string;
  cardId: string;
  authorId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}
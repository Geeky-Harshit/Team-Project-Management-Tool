export interface Board {
  id: string;
  organizationId: string;
  name: string;
  archived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface List {
  id: string;
  boardId: string;
  name: string;
  position: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

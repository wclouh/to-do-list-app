export interface Todo {
  id: number;
  title: string;
  classification: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
}

export type Category = string;

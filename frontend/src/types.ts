export type Role = 'waiter' | 'cashier';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface TableRow {
  id: number;
  number: number;
  status: 'available' | 'occupied';
}

export interface Food {
  id: number;
  name: string;
  price: number;
  category?: string | null;
}

export interface OrderItem {
  id: number;
  food_id: number;
  quantity: number;
  price: number;
  food?: Food;
}

export interface Order {
  id: number;
  table_id: number;
  status: 'open' | 'closed';
  total: number;
  table?: TableRow;
  items?: OrderItem[];
}

export interface ApiList<T> {
  data: T[];
  // paginate variant
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}
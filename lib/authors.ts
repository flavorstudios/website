export interface Author {
  id: string;
  name: string;
}

export const authors: Author[] = [
  { id: 'admin', name: 'Admin' },
  { id: 'flavor', name: 'Flavor Studios' },
  { id: 'guest', name: 'Guest Writer' }
];
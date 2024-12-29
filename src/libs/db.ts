import { DateTime } from 'effect';
import { User } from '../users/users.schemas.ts';

// Imaginary database
const users: User[] = [];

// Pre-populate users
if (users.length === 0) {
  const fakeNames = [
    'John',
    'Jane',
    'Bob',
    'Alice',
    'Charlie',
    'David',
    'Emily',
    'Frank',
    'Grace',
    'Hannah',
  ];

  for (const name of fakeNames) {
    users.push({
      id: users.length + 1,
      name,
      createdAt: DateTime.unsafeFromDate(new Date()),
    });
  }
}

export { users };

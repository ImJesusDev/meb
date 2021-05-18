import { User } from '../user';
import { UserStatus, UserRole } from '@movers/common';

it('implements version control', async (done) => {
  const user = User.build({
    email: 'test@mail.com',
    password: '123',
    role: UserRole.User,
    status: UserStatus.Unverified,
    firstName: 'Regular',
    activationCode: Math.floor(100000 + Math.random() * 900000),
    lastName: 'User',
    city: 'Bogota',
    country: 'Colombia',
  });
  await user.save();

  const firstInstance = await User.findById(user.id);
  const secondInstance = await User.findById(user.id);
  firstInstance!.set({
    email: 'test1@mail.com',
  });
  secondInstance!.set({
    email: 'test3@mail.com',
  });

  await firstInstance!.save();
  try {
    await secondInstance!.save();
  } catch (err) {
    return done();
  }
  throw new Error('Should not reach this');
});

it('increments version number on multiple saves', async () => {
  const user = User.build({
    email: 'test@mail.com',
    password: '123',
    firstName: 'Regular',
    lastName: 'User',
    activationCode: Math.floor(100000 + Math.random() * 900000),
    role: UserRole.User,
    status: UserStatus.Unverified,
    city: 'Bogota',
    country: 'Colombia',
  });
  await user.save();
  expect(user.version).toEqual(0);
  await user.save();
  expect(user.version).toEqual(1);
  await user.save();
  expect(user.version).toEqual(2);
});

import { prismaClient } from '../../lib/prismaClient';
import { hash } from 'bcryptjs';

interface IInput {
  name: string;
  email: string;
  password: string;
}

type IOutput = void

export class SignUpUseCase {
  async execute({ email, name, password }: IInput): Promise<IOutput> {
    const emailAlreadyExists = await prismaClient.account.findUnique({
      where: { email },
    });

    if (emailAlreadyExists) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await hash(password, 10); // salt of 10 rounds for security

    await prismaClient.account.create({
      data: {
        name, 
        email, 
        password: hashedPassword,
      },


    });
  }

}
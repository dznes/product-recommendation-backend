import { prisma } from '@/lib/prisma'
import { Prisma, User } from '@prisma/client'

import { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })
    return user
  }

  async findByCode(code: string) {
    const user = await prisma.user.findUnique({
      where: {
        code,
      },
    })
    return user
  }

  async findByIdWithNested(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        reports: true,
      },
    })
    return user
  }

  async findByEmail(email: string) {
    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    })
    return user
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })
    return user
  }

  async list() {
    const user = await prisma.user.findMany({
      orderBy: {
        created_at: 'desc',
      },
    })
    return user
  }

  async update(user: User) {
    await prisma.user.update({
      where: { id: user.id },
      data: user,
    })
  }

  async delete(user: User) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    })
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CustomForbiddenException } from '@common/exceptions/customForbidden.exception';
import { JwtPayload } from 'auth/types/jwtPayload.type';

const prisma = new PrismaClient();

export const GetCurrentUserId = createParamDecorator(
  async (_: undefined, context: ExecutionContext): Promise<string> => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    const isExist = await prisma.user.findUnique({
      where: {
        id: user.sub,
      },
    });
    if (!isExist) {
      throw new CustomForbiddenException('Invalid token');
    }
    return user.sub;
  },
);

import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest(); //para obtener la request
  const user = req.user; //para obtener el usuario

  if (!user) throw new InternalServerErrorException('User not found(request)');

  return !data ? user : user[data];
});

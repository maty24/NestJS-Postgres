import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RawHeaders } from './decoratator';
import { Auth } from './decoratator/auth.decorator';
import { GetUser } from './decoratator/get-user.decorator';
import { RoleProtected } from './decoratator/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/User.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard()) //esto es para que me pida el token para mostrar la ruta
  testingPrivateRoute(
    @GetUser() user: User, //obtine la info del jwt del usuario
    @GetUser('email') userEmail: string,

    @RawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      messague: ' hola desde priavte',
      user,
      userEmail,
      rawHeaders,
    };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRouter2(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }

  @Get('private3')
  @Auth(ValidRoles.user) //esto incluye los roleprotected y el use guards
  privateRouter3(@GetUser() user: User) {
    return {
      ok: true,
      user,
    };
  }
}

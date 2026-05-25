import { Injectable } from "@nestjs/common";
import { ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from "class-validator";
import { UsersService } from "../users.service";

@ValidatorConstraint()
@Injectable()
export class IsEmailAlreadyExistConstraint implements ValidatorConstraintInterface {
    constructor(private readonly usersService: UsersService) { }

    async validate(email: string): Promise<boolean> {
        const user = await this.usersService.findUserByEmail(email);
        return !!user;
    }
}
export function IsEmailAlreadyExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailAlreadyExistConstraint,
        });
    };
}    
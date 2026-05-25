import { User } from "src/app/modules/users/user.entity";
import { authenticationData } from "../../utils/authenticator";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      tokenData?: authenticationData
    }
  }
}

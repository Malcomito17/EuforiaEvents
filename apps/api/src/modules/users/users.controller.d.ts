import { Request, Response, NextFunction } from 'express';
export declare function listUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updatePermissions(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function reactivateUser(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getRolePresets(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function errorHandler(err: any, req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=users.controller.d.ts.map
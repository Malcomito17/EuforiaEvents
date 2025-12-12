interface ProtectedRouteProps {
    children: React.ReactNode;
    roles?: ('ADMIN' | 'MANAGER' | 'OPERATOR')[];
}
export declare function ProtectedRoute({ children, roles }: ProtectedRouteProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=ProtectedRoute.d.ts.map
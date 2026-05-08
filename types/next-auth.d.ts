import 'next-auth';
import 'next-auth/jwt';

type Role = 'user' | 'admin' | 'company_owner';
type CompanyStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      role?: Role;
      accountType?: string;
      companyId?: string | null;
      companyStatus?: CompanyStatus | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string | null;
    role?: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: Role;
    accountType?: string;
    companyId?: string | null;
    companyStatus?: CompanyStatus | null;
  }
}

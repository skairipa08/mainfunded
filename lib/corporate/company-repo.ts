import { prisma } from '@/lib/prisma';
import type { Company, CompanyStatus, Prisma } from '@prisma/client';

export type CreateCompanyInput = {
  name: string;
  legalName?: string;
  taxId: string;
  contactEmail: string;
  contactPhone?: string;
  websiteUrl?: string;
  logoUrl?: string;
  ownerUserId: string;
};

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  return prisma.company.create({
    data: {
      ...input,
      status: 'PENDING',
    },
  });
}

export async function findCompanyByOwner(ownerUserId: string): Promise<Company | null> {
  return prisma.company.findUnique({ where: { ownerUserId } });
}

export async function findCompanyById(id: string): Promise<Company | null> {
  return prisma.company.findUnique({ where: { id } });
}

export async function findCompaniesByStatus(status: CompanyStatus): Promise<Company[]> {
  return prisma.company.findMany({
    where: { status },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteCompany(id: string): Promise<void> {
  await prisma.company.delete({ where: { id } });
}

export type UpdateCompanyProfileInput = Partial<
  Pick<Company, 'name' | 'legalName' | 'logoUrl' | 'contactEmail' | 'contactPhone' | 'websiteUrl'>
>;

export async function updateCompanyProfile(
  id: string,
  input: UpdateCompanyProfileInput
): Promise<Company> {
  return prisma.company.update({
    where: { id },
    data: input as Prisma.CompanyUpdateInput,
  });
}

export async function approveCompany(id: string, adminUserId: string): Promise<Company> {
  return prisma.company.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approvedAt: new Date(),
      approvedBy: adminUserId,
      rejectedReason: null,
    },
  });
}

export async function rejectCompany(id: string, reason: string): Promise<Company> {
  return prisma.company.update({
    where: { id },
    data: {
      status: 'REJECTED',
      rejectedReason: reason,
    },
  });
}

export async function isTaxIdTaken(taxId: string): Promise<boolean> {
  const existing = await prisma.company.findUnique({ where: { taxId } });
  return !!existing;
}

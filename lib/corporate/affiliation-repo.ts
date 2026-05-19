import { prisma } from '@/lib/prisma';
import type { EmployeeAffiliation } from '@prisma/client';

export async function findActiveAffiliationByUser(
  userId: string
): Promise<EmployeeAffiliation | null> {
  const aff = await prisma.employeeAffiliation.findUnique({ where: { userId } });
  return aff && aff.active ? aff : null;
}

export async function findAffiliationByUser(userId: string): Promise<EmployeeAffiliation | null> {
  return prisma.employeeAffiliation.findUnique({ where: { userId } });
}

export async function activateAffiliation(
  userId: string,
  companyId: string
): Promise<EmployeeAffiliation> {
  return prisma.employeeAffiliation.upsert({
    where: { userId },
    create: { userId, companyId, active: true },
    update: { companyId, active: true, activatedAt: new Date(), deactivatedAt: null },
  });
}

export async function deactivateAffiliation(userId: string): Promise<EmployeeAffiliation | null> {
  const existing = await prisma.employeeAffiliation.findUnique({ where: { userId } });
  if (!existing) return null;
  return prisma.employeeAffiliation.update({
    where: { userId },
    data: { active: false, deactivatedAt: new Date() },
  });
}

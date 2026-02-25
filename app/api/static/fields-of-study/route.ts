import { NextResponse } from 'next/server';
import { FIELDS_OF_STUDY as FIELDS_LIST, EDUCATION_LEVELS, APPLICANT_TYPES } from '@/lib/constants';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: FIELDS_LIST,
    educationLevels: EDUCATION_LEVELS.map(l => ({
      value: l.value,
      label: `${l.labelTr} / ${l.label}`,
      labelEn: l.label,
      labelTr: l.labelTr,
    })),
    applicantTypes: APPLICANT_TYPES.map(t => ({
      value: t.value,
      label: `${t.labelTr} / ${t.label}`,
      labelEn: t.label,
      labelTr: t.labelTr,
    })),
  });
}

import { NextResponse } from 'next/server';
import { COUNTRIES as COUNTRY_LIST } from '@/lib/constants';

// Turkey first, then alphabetical — with value + label format
const COUNTRIES = COUNTRY_LIST.map(c => ({
  value: c.value,
  label: `${c.flag} ${c.labelTr} / ${c.label}`,
  labelEn: c.label,
  labelTr: c.labelTr,
  flag: c.flag,
}));

export async function GET() {
  return NextResponse.json({
    success: true,
    data: COUNTRIES
  });
}

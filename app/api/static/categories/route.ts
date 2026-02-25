import { NextResponse } from 'next/server';
import { FUNDING_CATEGORIES } from '@/lib/constants';

// Map centralized constants to API response format
const CATEGORIES = FUNDING_CATEGORIES.map(cat => ({
  id: cat.value,
  value: cat.value,
  name: cat.label,
  nameTr: cat.labelTr,
  label: `${cat.labelTr} / ${cat.label}`,
  icon: cat.icon,
}));

export async function GET() {
  return NextResponse.json({
    success: true,
    data: CATEGORIES
  });
}

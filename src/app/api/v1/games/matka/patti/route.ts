import { NextRequest, NextResponse } from 'next/server';
import {
  getPattiPossibilities,
  getAllPattiForDigit,
  PattiCategory
} from '@/domain/games/matka/patti-generator';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const digitParam = searchParams.get('digit');
    const categoryParam = searchParams.get('category') as PattiCategory | 'all' | null;

    if (digitParam === null || digitParam === undefined || digitParam === '') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PARAMETER',
            message: 'Query parameter "digit" (0-9) is required'
          }
        },
        { status: 400 }
      );
    }

    const digit = parseInt(digitParam, 10);
    if (isNaN(digit) || digit < 0 || digit > 9) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_DIGIT',
            message: `Digit "${digitParam}" is invalid: must be an integer between 0 and 9`
          }
        },
        { status: 400 }
      );
    }

    if (categoryParam && categoryParam !== 'all') {
      if (!['single', 'double', 'triple'].includes(categoryParam)) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_CATEGORY',
              message: `Category "${categoryParam}" is invalid: must be 'single', 'double', or 'triple'`
            }
          },
          { status: 400 }
        );
      }

      const possibilities = getPattiPossibilities(digit, categoryParam);
      return NextResponse.json({
        data: {
          digit,
          category: categoryParam,
          count: possibilities.length,
          possibilities,
          rule:
            categoryParam === 'single'
              ? 'Three distinct digits whose sum modulo 10 equals selected digit (12 combinations)'
              : categoryParam === 'double'
              ? 'Exactly two identical digits whose sum modulo 10 equals selected digit (9 combinations)'
              : 'Three identical digits whose sum modulo 10 equals selected digit (1 combination)'
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    }

    // Default: return all categories for the selected digit
    const allData = getAllPattiForDigit(digit);
    return NextResponse.json({
      data: allData,
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: {
          code: 'SERVER_ERROR',
          message: err.message || 'Failed to fetch Patti combinations'
        }
      },
      { status: 500 }
    );
  }
}

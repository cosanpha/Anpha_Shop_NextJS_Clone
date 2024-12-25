import { connectDatabase } from '@/config/database'
import ProductModel from '@/models/ProductModel'
import { NextRequest, NextResponse } from 'next/server'

// Models: Product
import '@/models/ProductModel'

// [PATCH]: /admin/product/:id/edit-property/:field
export async function PATCH(
  req: NextRequest,
  { params: { id, field } }: { params: { id: string; field: string } }
) {
  console.log('- Edit Product Property -')

  try {
    // connect to database
    await connectDatabase()

    // get field to update
    const { value } = await req.json()

    // update product property
    const product: any = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { [field]: value } },
      { new: true }
    )
      .select(field)
      .lean()

    // check product
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({
      newValue: product[field],
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} has been updated to ${product[field]}`,
    })
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}

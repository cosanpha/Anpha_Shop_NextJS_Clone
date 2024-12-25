import Meta from '@/components/Meta'
import Pagination from '@/components/Pagination'
import ProductCard from '@/components/ProductCard'
import { IProduct } from '@/models/ProductModel'
import { ITag } from '@/models/TagModel'
import { getTagsPageApi } from '@/requests'
import { handleQuery } from '@/utils/handleQuery'

async function TagPage({ searchParams }: { searchParams?: { [key: string]: string[] } }) {
  // Data
  let tags: ITag[] = []
  let products: IProduct[] = []
  let amount: number = 0
  let chops: { [key: string]: number } | null = null
  let query = ''

  // values
  const itemPerPage = 8

  // MARK: Get Data
  try {
    // get query
    query = handleQuery(searchParams)

    // cache: no-store for filter
    const data = await getTagsPageApi(query)

    // destructure
    products = data.products
    tags = data.tags
    amount = data.amount
    chops = data.chops
  } catch (err: any) {
    console.log(err)
  }

  // jsonLd
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'ItemList',
    name: `Tag`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/tag${query}`,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: `${index + 1}`,
      item: {
        '@type': 'Product',
        name: product.title,
        url: `${process.env.NEXT_PUBLIC_APP_URL}/${product.slug}`,
        image: product.images[0],
        description: product.description,
        offers: {
          '@type': 'Offer',
          price: `${product.price}`,
          priceCurrency: 'VND',
          availability: product.stock ? 'InStock' : 'OutOfStock',
        },
      },
    })),
  }

  return (
    <div className="pt-16">
      {/* MARK: Add JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* MARK: Meta */}
      <Meta
        title={`Sản Phẩm Theo "Tag"`}
        searchParams={searchParams}
        type="tag"
        items={tags}
        chops={chops}
      />

      {/* MARK: Amount */}
      <div className="p-3 text-right text-sm font-semibold text-white">
        {Math.min(itemPerPage * +(searchParams?.page || 1), amount)}/{amount} sản phẩm
      </div>

      {/* MARK: MAIN LIST */}
      <div className="grid grid-cols-1 gap-21 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map(product => (
          <ProductCard
            product={product}
            key={product._id}
          />
        ))}
      </div>

      {/* MARK: Pagination */}
      <Pagination
        searchParams={searchParams}
        amount={amount}
        itemsPerPage={itemPerPage}
        className="mt-11"
      />
    </div>
  )
}

export default TagPage

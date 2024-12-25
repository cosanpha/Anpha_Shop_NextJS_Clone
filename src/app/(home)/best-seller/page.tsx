import ProductCard from '@/components/ProductCard'
import { IProduct } from '@/models/ProductModel'
import { getBestSellerPageApi } from '@/requests'
import { handleQuery } from '@/utils/handleQuery'

async function BestSellerPage({ searchParams }: { searchParams?: { [key: string]: string[] } }) {
  // Data
  let products: IProduct[] = []
  let query = ''

  // MARK: Get Data
  try {
    // get query
    query = handleQuery(searchParams)

    // cache: no-store for filter
    const data = await getBestSellerPageApi(query)

    // destructure
    products = data.products
  } catch (err: any) {
    console.log(err)
  }

  // jsonLd
  const jsonLd = {
    '@context': 'http://schema.org',
    '@type': 'ItemList',
    name: `Danh Sách Bạn Chạy`,
    url: `${process.env.NEXT_PUBLIC_APP_URL}/category${query}`,
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
    <div className="pt-8">
      {/* MARK: Add JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Heading */}
      <h2
        className={`mx-auto my-11 w-full max-w-1200 text-center font-sans text-4xl font-light tracking-wide text-white sm:text-nowrap md:text-nowrap`}
      >
        Danh Sách Bán Chạy
      </h2>

      {/* MARK: MAIN LIST */}
      <div className="mt-12 grid grid-cols-1 gap-21 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map(product => (
          <ProductCard
            product={product}
            key={product._id}
          />
        ))}
      </div>
    </div>
  )
}

export default BestSellerPage

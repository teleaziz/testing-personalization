import type {
    GetStaticPathsContext,
    GetStaticPropsContext,
    InferGetStaticPropsType,
  } from 'next'
  import { NextSeo } from 'next-seo'
  import { useRouter } from 'next/router'
  import { Layout } from '@components/common'
  import { BuilderComponent, builder, useIsPreviewing } from '@builder.io/react'
  import builderConfig from '@config/builder'
  import DefaultErrorPage from 'next/error'
  import Head from 'next/head'
  import { resolveBuilderContent } from '@lib/resolve-builder-content'
  
  import '../../blocks/ProductGrid/ProductGrid.builder'
  import '../../blocks/CollectionView/CollectionView.builder'
  import { useThemeUI } from '@theme-ui/core'
  import { Link } from '@components/ui'
  import { Themed } from '@theme-ui/mdx'
  import { getLayoutProps } from '@lib/get-layout-props'
  import { useAddItemToCart } from '@lib/shopify/storefront-data-hooks'
  import { useUI } from '@components/ui/context'
  import { PersonalizedURL } from '@builder.io/personalization-utils'
import { useEffect } from 'react'

builder.init(builderConfig.apiKey)

  export async function getStaticProps({ params } : GetStaticPropsContext<{ hash: string }>) {
    const personlizedURL = PersonalizedURL.fromRewrite(params!.hash!);
    const attributes = personlizedURL.options.attributes;
    const page = await resolveBuilderContent('page', attributes)
  
    return {
      props: {
        page,
        attributes: attributes,
        locale: attributes.locale || 'en-US',
        ...(await getLayoutProps(attributes)),
      },
      // Next.js will attempt to re-generate the page:
      // - When a request comes in
      // - At most once every 1 seconds
      revalidate: 1
    }
  }
  

  export async function getStaticPaths({ locales }: GetStaticPathsContext) {
    return {
      paths: [],
      fallback: true,
    }
  }
  
  export default function Path({
    page,
    attributes,
  }: InferGetStaticPropsType<typeof getStaticProps>) {
    const router = useRouter()
    const { theme } = useThemeUI()
    const addToCart = useAddItemToCart()
    const { openSidebar } = useUI()
    const isPreviewing = useIsPreviewing()

    useEffect(() => {
        builder.setUserAttributes(attributes)
      }, [])
    
    if (router.isFallback) {
      return <h1>Loading...</h1>
    }
    const { title, description, image } = page?.data! || {}

    let head = !page ?           <Head>
    <meta name="robots" content="noindex" />
    <meta name="title"></meta>
  </Head> :           <NextSeo
            title={title}
            description={description}
            openGraph={{
              type: 'website',
              title,
              description,
              ...(image && {
                images: [
                  {
                    url: image,
                    width: 800,
                    height: 600,
                    alt: title,
                  },
                ],
              }),
            }}
          />

    return (
      <div>
        { head }
        { (page || isPreviewing) ? <BuilderComponent
          options={{ includeRefs: true }}
          model="page"
          data={{ theme, attributes }}
          context={{
            productBoxService: {
              addToCart,
              navigateToCart() {
                openSidebar();
              },
              navigateToProductPage(product: { handle: string }) {
                router.push(`/product/${product.handle}`)
              }
            }
          }}
          renderLink={(props: any) => {
            // nextjs link doesn't handle hash links well if it's on the same page (starts with #)
            if (props.target === '_blank' || props.href?.startsWith('#')) {
              return <Themed.a {...props} />
            }
            return <Themed.a {...props} as={Link} />
          }}
          {...(page && { content: page })}
        /> : <DefaultErrorPage statusCode={404} />
  }
      </div>
    )
  }
  
  Path.Layout = Layout
  
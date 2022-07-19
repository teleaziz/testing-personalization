/** @jsxRuntime classic */
/** @jsx jsx */
import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
import { Themed, jsx } from 'theme-ui'
import { useRouter } from 'next/router'
import { Layout } from '@components/common'
import { BuilderComponent, Builder, builder } from '@builder.io/react'
import { resolveBuilderContent } from '@lib/resolve-builder-content'
import builderConfig from '@config/builder'
import shopifyConfig from '@config/shopify'
import {
  getCollection,
  getAllCollectionPaths,
} from '@lib/shopify/storefront-data-hooks/src/api/operations'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import { useThemeUI } from '@theme-ui/core'
import { getLayoutProps } from '@lib/get-layout-props'
import { CollectionPreview } from 'blocks/CollectionView/CollectionView'
import React from 'react'
builder.init(builderConfig.apiKey!)
const builderModel = 'collection-page'

export async function getStaticProps({
  params,
  locale,
}: GetStaticPropsContext<{ handle: string }>) {
  const collection = await getCollection(shopifyConfig, {
    handle: params?.handle,
  })

  const page = await resolveBuilderContent(builderModel, {
    collectionHandle: params?.handle,
    locale,
  })

  return {
    props: {
      page: page || null,
      collection: collection || null,
      ...(await getLayoutProps()),
    },
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  const paths = await getAllCollectionPaths(shopifyConfig)
  return {
    paths: paths.map((path) => `/collection/${path}`),
    fallback: 'blocking',
  }
}

export default function Handle({
  collection,
  page,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  const isLive = !Builder.isEditing && !Builder.isPreviewing
  const { theme } = useThemeUI()
  if (!collection && isLive) {
    return (
      <>
        <Head>
          <meta name="robots" content="noindex" />
          <meta name="title"></meta>
        </Head>
        <DefaultErrorPage statusCode={404} />
      </>
    )
  }

  return router.isFallback && isLive ? (
    <h1>Loading...</h1> // TODO (BC) Add Skeleton Views
  ) : (
    <Themed.div sx={{ p: 2}}>
      <CollectionPreview collection={{collection}} productGridOptions={{
        offset: 0,
        limit: 10,
        cardProps: {
          imgHeight: 350,
          imgWidth: 350,
        }
      }} renderSeo></CollectionPreview>
      <BuilderComponent
        isStatic
        key={collection.id}
        model={builderModel}
        context={{ theme }}
        data={{ collection, theme }}
        {...(page && { content: page })}
      />

    </Themed.div>
  )
}

Handle.Layout = Layout

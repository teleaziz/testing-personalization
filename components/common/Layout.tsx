/** @jsxRuntime classic */
/** @jsx jsx */
import React from 'react'
import { ThemeProvider, jsx } from 'theme-ui'
import dynamic from 'next/dynamic'
import { ManagedUIContext, useUI } from '@components/ui/context'
import { Head, Navbar } from '@components/common'
import { useAcceptCookies } from '@lib/hooks/useAcceptCookies'
import { Button } from 'theme-ui'
import { Sidebar } from '@components/ui'
import { CartSidebarView } from '@components/cart'
import { CommerceProvider } from '@lib/shopify/storefront-data-hooks'
import shopifyConfig from '@config/shopify'
import { builder, BuilderContent, Builder, BuilderComponent } from '@builder.io/react'
import themesMap from '@config/theme'
import '@builder.io/widgets'
import seoConfig from '@config/seo.json'
import NoSSR from './NoSSR'
import { useThemeUI } from '@theme-ui/core'

if (!Builder.isBrowser) {
  try {
    require('vm2')
  } catch (e) {
    console.log('no vm2')
  }
}

const FeatureBar = dynamic(() => import('@components/common/FeatureBar'), {
  ssr: false,
})

const Layout: React.FC<{ pageProps: any, children: any }> = ({ children, pageProps }) => {
  const builderTheme = pageProps.theme
  const announcementBar = pageProps.announcementBar;
  const footer = pageProps.footer;
  const editingModel = Builder.previewingModel || builder.editingModel;

  const isLive = editingModel !== 'theme';
  const attributes = pageProps.attributes;
  return (
    <CommerceProvider {...shopifyConfig}>
      <BuilderContent
        isStatic
        {...(isLive && { content: builderTheme })}
        modelName="theme"
      >
        {(data, loading) => {
          if (loading && !builderTheme) {
            return 'loading ...'
          }
          const siteSettings = data?.siteSettings
          const colorOverrides = data?.colorOverrides
          const siteSeoInfo = data?.siteInformation
          const themeName = data?.theme || 'base';
          const theme = {
            ...themesMap[themeName],
            colors: {
              ...themesMap[themeName].colors,
              ...colorOverrides,
            },
          }
        
          return (
            <ManagedUIContext key={data?.id} siteSettings={{
              ...siteSettings,
              attributes,
              children,
              announcementBar,
              footer
            }}>
              <Head seoInfo={siteSeoInfo || seoConfig} />
              <ThemeProvider theme={theme}>
                { editingModel === 'announcement-bar' && <AnnouncementBar forceShow />}
                <BuilderComponent {...isLive && {content: builderTheme}} context={{ theme }} model="theme"></BuilderComponent>
                { editingModel === 'footer' && <Footer forceShow />}
                <ManagedSideBar editingModel={editingModel} />
              </ThemeProvider>
            </ManagedUIContext>
          )
        }}
      </BuilderContent>
    </CommerceProvider>
  )
}

const ManagedSideBar: React.FC<{editingModel: string | null }> = ( {editingModel}) => {
    const { displaySidebar, closeSidebar } = useUI()
  return (<Sidebar
    open={
      displaySidebar ||
      editingModel ===
        'cart-upsell-sidebar'
    }
    onClose={closeSidebar}
  >
    <CartSidebarView />
  </Sidebar>)
}

const InnerLayout: React.FC<{
  themeName: string
  colorOverrides?: {
    text?: string
    background?: string
    primary?: string
    secondary?: string
    muted?: string
  }
}> = () => {
  const { children } = useUI()
  return (
      <div
        sx={{
          margin: `0 auto`,
          px: 20,
          maxWidth: 1920,
          minWidth: '60vw',
          minHeight: 800,
        }}
      >
        <main>{children}</main>
      </div>
  )
}

Builder.registerComponent(InnerLayout, {
  name: 'MainContent',
  image: 'https://visualpharm.com/assets/936/Page%20Overview%204-595b40b75ba036ed117d9a2a.svg'
});

Builder.registerComponent(() => <Navbar></Navbar>, {
  name: 'Navbar',
  image: 'https://visualpharm.com/assets/565/Document%20Header-595b40b75ba036ed117d5c62.svg'
})

Builder.registerComponent(() => {
  const { acceptedCookies, onAcceptCookies } = useAcceptCookies()
  return <NoSSR>
  <FeatureBar
    title="This site uses cookies to improve your experience. By clicking, you agree to our Privacy Policy."
    hide={acceptedCookies}
    action={
      <Button onClick={() => onAcceptCookies()}>Accept cookies</Button>
    }
  />
</NoSSR>

}, {
  image: 'https://visualpharm.com/assets/700/Cookies-595b40b85ba036ed117dcdb9.svg',
  name: 'CookieConsent'
})

const AnnouncementBar = ({ forceShow} : any) => {
  const { announcementBar } = useUI()
  const model = Builder.previewingModel || builder.editingModel;
  const theme = useThemeUI();
  if (model === 'announcement-bar' && !forceShow)  {
    return null
  }
  return <BuilderComponent content={announcementBar} model="announcement-bar" data={{theme}}></BuilderComponent>
};

Builder.registerComponent(AnnouncementBar, {
  name: 'AnnouncementBar',
  image: 'https://visualpharm.com/assets/468/Megaphone-595b40b65ba036ed117d482b.svg',
})

const Footer = ({ forceShow }: any) => {
  const { footer } = useUI()
  const theme = useThemeUI();
  const model = Builder.previewingModel || builder.editingModel;
  if (model === 'footer' && !forceShow)  {
    return null
  }
  return <BuilderComponent content={footer} model="footer" data={{theme}}></BuilderComponent>
};

Builder.registerComponent(Footer, {
  name: 'Footer',
  image: 'https://visualpharm.com/assets/680/Footer-595b40b75ba036ed117d5c60.svg',
})


export default Layout

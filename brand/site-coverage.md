# Site coverage

Every route in the site (the newer zip, `spyglass-website`, received 2026-11-24) and every component file in `src/components` (219 .tsx files), with the library item that covers it or the reason it is left out. Generated from the import graph of `src/app` (which components each route renders); "current" means a route renders it today.

Components: 219 files. 13 covered by existing items, 112 by new items, 21 by rebuilt items, 73 excluded (reasons below).

## Routes

| Route | Site source | Library |
| --- | --- | --- |
| / | app/page.tsx (renders app/v2/page.tsx: the current home) | home-page (rebuilt) |
| /v2 | app/v2/page.tsx: the current home, noindex alias | home-page |
| /v1 | app/v1/page.tsx: the first home, noindex, linked from nowhere | excluded: superseded by the current home; its sections map to the current blocks (see the components) |
| /about | app/about/page.tsx | about-page (rebuilt) |
| /enterprise | app/enterprise/page.tsx | enterprise-page (new) |
| /pricing | app/pricing/page.tsx | pricing-page (rebuilt) |
| /products/[slug] | app/products/[slug]/page.tsx (one template for every product) | product-page (rebuilt, one example per product kind) |
| /products/coming-soon | app/products/coming-soon/page.tsx | coming-soon-page (new) |
| /use-cases | app/use-cases/page.tsx | use-cases-page (new) |
| /use-cases/[slug] | app/use-cases/[slug]/page.tsx | use-case-page (new) |
| /resources | app/resources/page.tsx | resources-page (new) |
| /resources/[slug] | app/resources/[slug]/page.tsx (a list of posts or guides) | resource-list-page (new) |
| /resources/case-studies | app/resources/case-studies/page.tsx | case-studies-page (new) |
| /resources/case-studies/[slug] | app/resources/case-studies/[slug]/page.tsx | case-study-page (new) |
| /templates | app/templates/page.tsx | templates-page (new) |
| /privacy | app/privacy/page.tsx | legal-page (rebuilt) |
| /terms | app/terms/page.tsx | legal-page (rebuilt) |
| /sign-up | app/(auth)/sign-up/page.tsx | auth-page (done, a35a1bb) |
| /sign-in | app/(auth)/sign-in/page.tsx | auth-page (done, a35a1bb) |
| 404 | app/not-found.tsx | not-found-page (rebuilt) |
| error | app/error.tsx, app/global-error.tsx | error-page (rebuilt) |
| /preview/hero-frame, /preview/hero-options | app/preview/* (internal frames for recording the hero video, not linked) | excluded: tooling for recording a video; the motion is the video command's job |
| robots, sitemap, manifest, llms.txt, icons | app/robots.ts, sitemap.ts, manifest.ts, llms*.txt, icon.svg, apple-icon.png, favicon.ico | excluded: site metadata files, no page; the icons command makes the brand's icons |

## Components

| File (src/components) | State | Library item or reason |
| --- | --- | --- |
| abstract/Abstract.tsx | unused | `abstract-canvas` (new) |
| effect/AsciiLens/AsciiLens.tsx | current | `ascii-lens` (new) |
| effect/AsciiTrail/AsciiTrail.tsx | current | `ascii-trail` (new) |
| effect/CursorBurst/CursorBurst.tsx | current | `cursor-effects` (new) |
| effect/CursorLens/CursorLens.tsx | current | `cursor-effects` (new) |
| effect/CursorSwitch/CursorSwitch.tsx | current | `cursor-effects` (new) |
| effect/CursorTrail/CursorTrail.tsx | current | `cursor-effects` (new) |
| effect/DispersionField.tsx | current | `dispersion-field` (new) |
| effect/LightImage/LightImage.tsx | current | `light-image` (new) |
| effect/PointerEffects.tsx | current | `cursor-effects` (new) |
| effect/PointerEffectsLoaded.tsx | current | `cursor-effects` (new) |
| effect/WordmarkGlow/WordmarkGlow.tsx | current | `wordmark-glow` (new) |
| instrument/marks.tsx | current | `instrument-marks` (new) |
| pages/About/AboutPage.tsx | current | `about-page` (rebuilt) |
| pages/Auth/AuthEmail.tsx | current | `auth-page` (existing) |
| pages/Auth/AuthForm.tsx | current | `auth-form` (existing) |
| pages/Auth/AuthProof.tsx | current | `proof-strip` (existing) |
| pages/Auth/AuthShell.tsx | current | `auth-page` (existing) |
| pages/Auth/GoogleMark.tsx | current | excluded: Google's logo (third party); auth-form takes the provider's mark through `providerIcon`. |
| pages/CaseStudies/CaseStudyArticle.tsx | current | `case-study-page` (new) |
| pages/CaseStudies/CaseStudyIndex.tsx | current | `case-studies-page` (new) |
| pages/ComingSoon/ComingSoon.tsx | current | `coming-soon-page` (new) |
| pages/Enterprise/AutomationRun.tsx | current | `automation-run` (new) |
| pages/Enterprise/EnterprisePage.tsx | current | `enterprise-page` (new) |
| pages/Enterprise/FeatureAgents.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureAlpha.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureArchive.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureBuilds.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureData.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureEngineers.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureGrid.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureReports.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/FeatureTools.tsx | current | `enterprise-features` (new) |
| pages/Enterprise/HeroRing.tsx | current | `enterprise-hero` (new) |
| pages/Enterprise/LogoStrip.tsx | current | `proof-strip` (existing) |
| pages/PageClose/PageClose.tsx | current | `page-close` (new) |
| pages/PageHead/ErrorHead.tsx | current | `page-head` (new) |
| pages/PageHead/PageHead.tsx | current | `page-head` (new) |
| pages/Pricing/CompareTable.tsx | current | `compare-table` (new) |
| pages/Pricing/Estimator.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `pricing-page (the site's pricing page renders plan cards and the compare table, not the estimator)` |
| pages/Pricing/PlanCards.tsx | current | `pricing-table` (rebuilt) |
| pages/Pricing/PlanRim.tsx | current | `pricing-table` (rebuilt) |
| pages/Pricing/PricingPage.tsx | current | `pricing-page` (rebuilt) |
| pages/Pricing/Segmented.tsx | current | `pricing-table` (rebuilt) |
| pages/Pricing/Swap.tsx | current | `text-swap` (new) |
| pages/Products/ApiExplorer.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `code-block (the product page shows code through Example)` |
| pages/Products/Example.tsx | current | `product-example` (new) |
| pages/Products/ProductCards.tsx | current | `product-cards` (new) |
| pages/Products/ProductCompare.tsx | current | `product-compare` (new) |
| pages/Products/ProductFeatures.tsx | current | `product-features` (new) |
| pages/Products/ProductHero.tsx | current | `product-hero` (new) |
| pages/Products/ProductPage.tsx | current | `product-page` (rebuilt) |
| pages/Products/ProductPricing.tsx | current | `product-pricing` (new) |
| pages/Products/ProductPricingOpen.tsx | current | `product-pricing` (new) |
| pages/Products/ProductPricingPlans.tsx | current | `product-pricing` (new) |
| pages/Products/ProductPricingReceipt.tsx | current | `product-pricing` (new) |
| pages/Products/ResultsRun.tsx | current | `product-hero` (new) |
| pages/Products/visuals/AddAccount.tsx | current | `product-visual` (new) |
| pages/Products/visuals/AddCreator.tsx | current | `product-visual` (new) |
| pages/Products/visuals/BrandRecord.tsx | current | `product-visual` (new) |
| pages/Products/visuals/CollabsTimeline.tsx | current | `product-visual` (new) |
| pages/Products/visuals/CommentThemes.tsx | current | `product-visual` (new) |
| pages/Products/visuals/CommentThread.tsx | current | `product-visual` (new) |
| pages/Products/visuals/CreativeRecord.tsx | current | `product-visual` (new) |
| pages/Products/visuals/CreatorFilters.tsx | current | `product-visual` (new) |
| pages/Products/visuals/CreatorRecord.tsx | current | `product-visual` (new) |
| pages/Products/visuals/FilterNarrow.tsx | current | `product-visual` (new) |
| pages/Products/visuals/PageRecord.tsx | current | `product-visual` (new) |
| pages/Products/visuals/RankedSheet.tsx | current | `product-visual` (new) |
| pages/Products/visuals/TaggedRecord.tsx | current | `product-visual` (new) |
| pages/Products/visuals/TaggedTimeline.tsx | current | `product-visual` (new) |
| pages/Products/visuals/index.tsx | current | `product-visual` (new) |
| pages/Resources/ResourceHub.tsx | current | `resources-page` (new) |
| pages/Resources/ResourceList.tsx | current | `resource-list-page` (new) |
| pages/TemplatesPage/TemplateCities.tsx | current | `templates-page` (new) |
| pages/TemplatesPage/TemplateResult.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `templates-page` |
| pages/TemplatesPage/TemplateStage.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `templates-page` |
| pages/UseCasesPage/BuildHero.tsx | current | `use-case-hero` (new) |
| pages/UseCasesPage/UseCaseAnswer.tsx | current | `use-case-answer` (new) |
| pages/UseCasesPage/UseCaseChat.tsx | current | `use-case-hero` (new) |
| pages/UseCasesPage/UseCaseDetail.tsx | current | `use-case-page` (new) |
| pages/UseCasesPage/UseCaseHero.tsx | current | `use-case-hero` (new) |
| pages/UseCasesPage/UseCaseHub.tsx | current | `use-cases-page` (new) |
| pages/UseCasesPage/UseCaseTemplate.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `use-case-page` |
| sections/Agents/Agents.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `features-block` |
| sections/Agents/Run.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `features-block` |
| sections/Agents/Wires.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `features-block` |
| sections/Audience/Audience.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `use-case-wheel` |
| sections/Audience/AudienceTabs.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `use-case-wheel` |
| sections/Closing/Closing.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `close-block` |
| sections/Connect/Code.tsx | current | `code-block` (new) |
| sections/Connect/CodeTabs.tsx | current | `code-block` (new) |
| sections/Connect/Connect.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `code-block` |
| sections/Connect/CopyButton.tsx | current | `code-block` (new) |
| sections/Coverage/AddDemo.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `product-visual` |
| sections/Coverage/Coverage.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `features-block` |
| sections/Faq/Faq.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `faq-block` |
| sections/Faq/FaqList.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `faq-block` |
| sections/Hero/Hero.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| sections/Hero/InlineCreative.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| sections/HeroCentered/HeroCentered.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| sections/HeroConveyor/HeroConveyor.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-row` |
| sections/HeroConveyor/Travel.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-row` |
| sections/HeroCopy/HeroCopy.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `playground-hero` |
| sections/HeroDiagonal/HeroDiagonal.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-grid` |
| sections/HeroDiagonal/Travel.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-grid` |
| sections/HeroRing/HeroRing.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-ring` |
| sections/HeroRing/RingSpin.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-ring` |
| sections/HeroStack/HeroStack.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `playground-hero` |
| sections/HowItWorks/ConnectPanel.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `how-it-works-block` |
| sections/HowItWorks/HowItWorks.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `how-it-works-block` |
| sections/Monitor/Monitor.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `why-block` |
| sections/Pricing/Pricing.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `pricing-panels-block` |
| sections/PricingStrip/PricingStrip.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `pricing-panels-block` |
| sections/Record/Record.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-corridor` |
| sections/Record/Timeline.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-corridor` |
| sections/Search/Search.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `search-bar` |
| sections/Search/SearchDemo.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `search-bar` |
| sections/Sources/Sources.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `proof-block` |
| sections/Templates/Templates.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `templates-wall` |
| sections/UseCases/UseCases.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `use-case-wheel` |
| sections/WhatYouGet/WhatYouGet.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `features-block` |
| sections/WhySpyglass/WhySpyglass.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `why-block` |
| sections/Works/Works.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `prompt-card` |
| site/Footer/Footer.tsx | current | `site-footer` (existing) |
| site/Footer/FooterWordmark.tsx | current | `site-footer` (existing) |
| site/Footer/FooterWordmarkGlow.tsx | current | `wordmark-glow` (new) |
| site/Header/Header.tsx | current | `site-header` (rebuilt) |
| site/Header/HeaderKey.tsx | current | `site-header` (rebuilt) |
| site/Header/HomeLink.tsx | current | `site-header` (rebuilt) |
| site/Header/LiveVisual.tsx | current | `site-header` (rebuilt) |
| site/Header/MenuPanels.tsx | current | `site-header` (rebuilt) |
| site/Header/MenuSheet.tsx | current | `site-header` (rebuilt) |
| site/Header/NavIcon.tsx | current | `site-header` (rebuilt) |
| site/Header/NavMenus.tsx | current | `site-header` (rebuilt) |
| site/Header/PlatformLogos.tsx | current | excluded: A row of PlatformMark (third-party platform logos); the header menu panels name the platforms in words instead. |
| site/Header/ProductsLivePanel.tsx | current | `site-header` (rebuilt) |
| site/Header/ScrollGround.tsx | current | `site-header` (rebuilt) |
| site/Header/SheetDisclosure.tsx | current | `site-header` (rebuilt) |
| site/JsonLd.tsx | current | excluded: Writes schema.org structured data for search engines into the page head: content, not a visible part. |
| story/ScrollStory/ScrollStory.tsx | current | `scroll-story` (new) |
| story/ScrollStory/pieces.tsx | current | `scroll-story` (new) |
| ui/AsciiDrift.tsx | current | `ascii-drift` (new) |
| ui/Avatar.tsx | current | `avatar` (existing) |
| ui/BrowserFrame.tsx | current | `browser-frame` (existing) |
| ui/ButtonGlow.tsx | current | `button` (existing) |
| ui/CreativeNode.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `creative-card` |
| ui/CreativeTile.tsx | current | `creative-card` (existing) |
| ui/FaqAccordion.tsx | current | `faq-block` (rebuilt) |
| ui/Light.tsx | v1-only | excluded: an earlier draft, v1 home only (app/v1, noindex); what it shows is covered by `brand-light` |
| ui/LoadAhead.tsx | current | excluded: Prefetches the next route's code and images when a link nears the viewport: Next.js routing behavior with no markup or look; library items take no Next imports. |
| ui/LoadAheadPage.tsx | current | excluded: The page-level half of LoadAhead (route prefetching for Next.js); no markup or look. |
| ui/Logo.tsx | current | `logo` (existing) |
| ui/PlatformMark.tsx | current | excluded: Draws the marks of Instagram, TikTok, YouTube, Facebook, X, LinkedIn and other platforms: third-party logos. Items that show platforms name them in words or take marks through a prop. |
| ui/RowFan.tsx | current | `row-fan` (new) |
| ui/Sentences.tsx | current | `text-swap` (new) |
| ui/SideDrifts.tsx | current | `side-drifts` (new) |
| ui/WarmPictures.tsx | current | `site-header` (rebuilt) |
| v2/V2Cta/V2Cta.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `close-block` |
| v2/V2Faq/V2Faq.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `faq-block` |
| v2/V2Faq/V2FaqList.tsx | current | `faq-block` (rebuilt) |
| v2/V2Features/AccountsBurst.tsx | current | `features-block` (new) |
| v2/V2Features/Demo.tsx | current | `features-block` (new) |
| v2/V2Features/LinksBoard.tsx | current | `product-visual` (new) |
| v2/V2Features/MediaStrip.tsx | current | `features-block` (new) |
| v2/V2Features/PatternsSort.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `features-block` |
| v2/V2Features/PatternsSwitch.tsx | current | `product-visual` (new) |
| v2/V2Features/PatternsTally.tsx | current | `features-block` (new) |
| v2/V2Features/V2Features.tsx | current | `features-block` (new) |
| v2/V2Hero/AppIcon.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| v2/V2Hero/HeroDemo.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| v2/V2Hero/V2Hero.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| v2/V2HowItWorks/Icons.tsx | current | `playground-hero` (new) |
| v2/V2HowItWorks/Session.tsx | current | `how-it-works-block` (new) |
| v2/V2HowItWorks/V2HowItWorks.tsx | current | `how-it-works-block` (new) |
| v2/V2Pricing/Panels.tsx | current | `pricing-panels-block` (new) |
| v2/V2Pricing/PanelsMotion.tsx | current | `pricing-panels-block` (new) |
| v2/V2Pricing/V2Pricing.tsx | current | `pricing-panels-block` (new) |
| v2/V2Story/StoryChat.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `scroll-story` |
| v2/V2Story/StoryTrack.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `scroll-story` |
| v2/V2Story/V2Story.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `scroll-story` |
| v2/V2Templates/TemplatesBoot.tsx | current | `templates-wall` (new) |
| v2/V2Templates/TemplatesWall.tsx | current | `templates-wall` (new) |
| v2/V2Templates/V2Templates.tsx | current | `templates-wall` (new) |
| v2/V2UseCases/UseCaseWheel.tsx | current | `use-case-wheel` (new) |
| v2/V2UseCases/V2UseCases.tsx | current | `use-case-wheel` (new) |
| v2/V2Why/AnalysisChips.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `why-block` |
| v2/V2Why/ArchiveAxis.tsx | current | `why-block` (new) |
| v2/V2Why/GraphRing.tsx | current | `features-block` (new) |
| v2/V2Why/MemoryReel.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `why-block` |
| v2/V2Why/V2Why.tsx | current | `why-block` (new) |
| v2/V2Why/WhyCustom.tsx | current | `why-block` (new) |
| v2/V2Why/WhyPricing.tsx | current | `why-block` (new) |
| v3/HeroVideo/HeroVideo.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; covered by the video command (motion) and playground-hero |
| v3/HeroVideo/PromptRow.tsx | current | `playground-hero` (new) |
| v3/LightBand/LightBand.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `brand-light` |
| v3/V3CaseStories/V3CaseStories.tsx | current | `case-stories-block` (new) |
| v3/V3Close/CloseLight.tsx | current | `close-block` (new) |
| v3/V3Close/CloseTags.tsx | current | `close-block` (new) |
| v3/V3Close/V3Close.tsx | current | `close-block` (new) |
| v3/V3Faq/V3Faq.tsx | current | `faq-block` (rebuilt) |
| v3/V3Hero/V3Hero.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| v3/V3Logos/V3Logos.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `proof-strip` |
| v3/V3Playground/ConnectMenu.tsx | current | `connect-menu` (new) |
| v3/V3Playground/HeroPrompt.tsx | current | `playground-hero` (new) |
| v3/V3Playground/HeroScatter.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `playground-hero` |
| v3/V3Playground/Playground.tsx | current | `playground-hero` (new) |
| v3/V3Playground/V3Playground.tsx | current | `playground-hero` (new) |
| v3/V3Proof/ProofLogos.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `proof-strip` |
| v3/V3Proof/ProofStrip.tsx | current | `proof-strip` (existing) |
| v3/V3Proof/V3Proof.tsx | current | `proof-block` (new) |
| v3/V3Record/Corridor.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-corridor` |
| v3/V3Record/V3Record.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `creative-corridor` |
| v3/V3Search/Composer.tsx | current | `playground-hero` (new) |
| v3/V3Search/SearchDemo.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `search-bar` |
| v3/V3Search/SearchStack.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `search-bar` |
| v3/V3Search/V3Search.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `search-bar` |
| v3/V3Stories/V3Stories.tsx | current | `stories-block` (new) |
| v3/V3Works/V3Works.tsx | unused | excluded: an earlier draft, not imported by any route in src/app; what it shows is covered by `prompt-card` |

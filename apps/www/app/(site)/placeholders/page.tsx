import { Code, InlineCode, PageBody, PageHead, Section } from "@www/components/chrome";
import { CreativeCard } from "@/react/components/site/CreativeCard";
import { LIGHT_TILE_B, LIGHT_TILE_C } from "@/lib/light-tiles";
import { elementPrefix } from "@www/lib/registry";

export const metadata = { title: "Replacing placeholders and moving sections" };

const PREFIX = elementPrefix;

const REACT = `import { HomePage } from '@/components/pages/HomePage'
import { CreativeCard } from '@/components/site/CreativeCard'

// One picture: src, alt, and where it sits in its box.
<CreativeCard src="/ads/acme-spring.jpg" alt="Acme spring sale ad" fit="cover" position="50% 20%" />

// A page: its sections in the order you want (leave one out to drop it), and each block's pictures.
<HomePage
  sections={['hero', 'stories', 'pricing', 'faq', 'close']}
  blocks={{
    stories: { cases: [{ company: 'Acme', href: '/customers/acme', picture: { src: '/team.jpg', alt: 'The Acme team', position: 'top' } /* ... */ }] },
    close: { creatives: [{ src: '/ads/1.jpg', alt: 'Acme ad' }, { src: '/ads/2.jpg', alt: 'Acme ad' }] },
  }}
/>`;

const ELEMENTS = `<${PREFIX}-creative-card src="/ads/acme-spring.jpg" alt="Acme spring sale ad" fit="cover" position="50% 20%"></${PREFIX}-creative-card>

<${PREFIX}-home-page id="home"></${PREFIX}-home-page>
<script type="module">
  const home = document.getElementById('home')
  home.sections = ['hero', 'stories', 'pricing', 'faq', 'close']
  home.blocks = {
    close: { creatives: [{ src: '/ads/1.jpg', alt: 'Acme ad' }, { src: '/ads/2.jpg', alt: 'Acme ad' }] },
  }
</script>`;

const CHECK = `// Every placeholder carries data-ds-placeholder: none should be left once the pictures are in.
const left = (root = document) => [...root.querySelectorAll('*')].flatMap((el) =>
  [...(el.hasAttribute('data-ds-placeholder') ? [el] : []), ...(el.shadowRoot ? left(el.shadowRoot) : [])])
console.log(left().length)`;

const PAGES = [
  ["home-page", "hero, proof, features, why, steps, stories, pricing, faq, close", "blocks: hero, features, why, steps, stories, pricing, close"],
  ["about-page", "head, photos, story, perks", "content.photos"],
  ["blog-page, blog-post-page, changelog-page", "head, featured, posts / head, cover, body, related, offer / head, entries", "each post's or entry's image"],
  ["case-studies-page, case-study-page", "head, stories, close / head, facts, cover, lead, body, more, close", "content.cases[].picture, study.cover"],
  ["enterprise-page", "hero, proof, run, features, close", "cards, run, features"],
  ["templates-page", "wall, run, cities, faq, close", "blocks.wall.pictures, blocks.run.items, content.cities rows"],
  ["use-case-page", "hero, proof, story, stories, wheel, faq, close", "chat, build, blocks.story.story, blocks.wheel.items"],
  ["product-page", "hero, proof, features, compare, pricing, faq, close", "features[].data, pricing rows' picture"],
  ["resources-page, use-cases-page, resource-list-page", "head, cards, close / head, list, close", "covers' creatives, entries' thumb"],
] as const;

export default function PlaceholdersPage() {
  return (
    <>
      <PageHead eyebrow="Guide" title="Replacing placeholders and moving sections" description="Every grey tile in the library is an image slot, and every page is a list of sections you can reorder or leave out. Both work the same way in React and in the web components." />
      <PageBody className="max-w-250">
        <Section id="slots" title="Image slots" description={<>A picture takes <InlineCode>src</InlineCode>, <InlineCode>alt</InlineCode> (empty when it is decoration), <InlineCode>fit</InlineCode> (object-fit: cover by default, or contain, fill, none, scale-down) and <InlineCode>position</InlineCode> (object-position). Lists of pictures take arrays of these, one per entry. Without <InlineCode>src</InlineCode> an item keeps its placeholder.</>}>
          <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
            <figure className="m-0 grid gap-2"><CreativeCard brand="ACME SHOES" caption="New season" tone={3} /><figcaption className="type-caption text-fg-muted">No src: the placeholder</figcaption></figure>
            <figure className="m-0 grid gap-2"><CreativeCard src={LIGHT_TILE_B} alt="" /><figcaption className="type-caption text-fg-muted">src (the brand&apos;s own light tile)</figcaption></figure>
            <figure className="m-0 grid gap-2"><CreativeCard src={LIGHT_TILE_C} alt="" fit="contain" position="top" /><figcaption className="type-caption text-fg-muted">fit=&quot;contain&quot; position=&quot;top&quot;</figcaption></figure>
          </div>
        </Section>

        <Section id="example" title="An example in both flavors" description={<>Pages take <InlineCode>sections</InlineCode> (the keys in order; a key left out is not shown) and their pictures as part of their data: <InlineCode>content</InlineCode> where the page owns the copy, <InlineCode>blocks</InlineCode> where it is made of blocks with their own data, and <InlineCode>menus</InlineCode> for the header&apos;s menus.</>}>
          <div className="grid gap-4">
            <Code title="React" code={REACT} />
            <Code title="Web components" code={ELEMENTS} />
          </div>
        </Section>

        <Section id="pages" title="Sections and pictures by page" description={<>Every other page takes <InlineCode>sections</InlineCode> too (pricing, careers, legal, contact, auth and the rest). An article&apos;s own sections stay inside its article, where the first of them falls.</>}>
          <div className="divide-y divide-edge rounded-control border border-edge px-5">
            {PAGES.map(([page, sections, pictures]) => (
              <div key={page} className="grid min-w-0 gap-1 py-4">
                <p className="type-ui-strong text-fg">{page}</p>
                <p className="type-ui text-fg-soft">Sections: {sections}</p>
                <p className="type-ui text-fg-muted">Pictures: {pictures}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section id="check" title="Check that none is left" description={<>Each placeholder carries <InlineCode>data-ds-placeholder</InlineCode>, through every shadow root.</>}>
          <Code title="Browser console" code={CHECK} />
        </Section>
      </PageBody>
    </>
  );
}

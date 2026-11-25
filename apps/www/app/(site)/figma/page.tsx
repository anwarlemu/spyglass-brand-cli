import { Command, InlineCode, PageBody, PageHead, Section } from "@www/components/chrome";
import { CLI } from "@www/lib/registry";

export const metadata = { title: "Figma" };

const ACTIONS = [
  ["tokens", `${CLI} figma tokens`, "Every token as a Figma variable in one collection with the Dark and Light modes, typed, scoped to the properties it belongs to and linked to its CSS variable. Writes tokens.json and use_figma scripts, each under the tool's size limit and safe to rerun. On a plan with one mode per collection the script makes one collection per mode."],
  ["push", `${CLI} figma push illustration pattern --variant corner`, "An illustration, an image or slide (any SVG, PNG or JPEG the CLI wrote), a library component preview or a page. A small SVG becomes a use_figma script that imports it as editable layers, its text as text layers in the brand fonts; anything bigger goes through upload_assets; components and pages become self-contained HTML for html_to_figma."],
  ["pull", `${CLI} figma pull "https://figma.com/design/<fileKey>/<name>?node-id=1-2"`, "The read steps for a frame: create_session, get_variable_defs and get_design_context, and where to save each result."],
  ["check", `${CLI} figma check figma/variables-1-2.json figma/design-1-2.txt`, "Every color, font, text size, radius and spacing in the saved results checked against the tokens. Off-brand values are listed with the nearest token, and the command exits 1 while there are any."],
] as const;

export default function FigmaPage() {
  return (
    <>
      <PageHead eyebrow="Brand" title="Figma" description="The CLI prepares Figma work for an agent with the Figma MCP tools. It never calls Figma itself: each action writes files and prints the tool calls to make, in order." />
      <PageBody className="max-w-250">
        <Section id="actions" title="Actions" description={<>Files go to <InlineCode>figma/</InlineCode> (<InlineCode>--out</InlineCode> changes it). <InlineCode>--file &lt;key&gt;</InlineCode> works in an existing file and skips the create-file steps. Add <InlineCode>--json</InlineCode> for the steps as data.</>}>
          <div className="divide-y divide-edge rounded-control border border-edge px-5">
            {ACTIONS.map(([id, command, text]) => (
              <div key={id} className="grid min-w-0 gap-3 py-5">
                <p className="type-heading-4">{id}</p>
                <p className="type-ui text-fg-soft">{text}</p>
                <Command command={command} />
              </div>
            ))}
          </div>
        </Section>

        <Section id="workflow" title="A round trip" description="From the brand into a Figma file and back, with the checks in between.">
          <ol className="m-0 grid list-decimal gap-3 pl-5 type-ui text-fg-soft">
            <li><InlineCode>{`${CLI} figma tokens`}</InlineCode>, then run its scripts with use_figma: the file has the brand variables.</li>
            <li><InlineCode>{`${CLI} image --template post-offer --format svg --out post.svg`}</InlineCode> and <InlineCode>{`${CLI} figma push asset post.svg`}</InlineCode>: the post arrives as editable layers.</li>
            <li>After edits in Figma, <InlineCode>{`${CLI} figma pull <frame url>`}</InlineCode> names the reads to make and where to save them.</li>
            <li><InlineCode>{`${CLI} figma check <saved files>`}</InlineCode> lists anything off brand with the nearest token; build with library items and tokens, never the raw values.</li>
          </ol>
        </Section>

        <Section id="skills" title="Before the first call" description="The Figma tools want their skills loaded first; the printed steps say which.">
          <ul className="m-0 grid list-disc gap-2 pl-5 type-ui text-fg-soft">
            <li>figma-use before any use_figma call, with figma-generate-library for variables or figma-generate-design for frames.</li>
            <li>figma-design-to-code before get_design_context.</li>
            <li>create_session first on every file, its sessionId passed on every later call.</li>
          </ul>
        </Section>
      </PageBody>
    </>
  );
}

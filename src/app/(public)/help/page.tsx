import type { Metadata } from "next";
import { LandingFooter } from "@/features/landing/footer";
import { LandingNav } from "@/features/landing/nav";

export const metadata: Metadata = {
  title: "Help",
  description: "How Strata works, topic by topic: from the catalogue to the optimization studio.",
};

const topics = [
  { id: "layers", title: "The idea: layers of blocks" },
  { id: "master-data", title: "The catalogue" },
  { id: "building", title: "Building a system" },
  { id: "predicting", title: "Predicting reliability" },
  { id: "failures", title: "Failures and fitting" },
  { id: "studio", title: "The optimization studio" },
];

export default function HelpPage() {
  return (
    <>
      <LandingNav />
      <main className="mx-auto w-full max-w-content px-6 pt-32 pb-24">
        <h1 className="text-h1 sm:text-display">Help</h1>
        <p className="mt-4 max-w-xl text-body text-foreground-muted">
          Everything the guided tour says, written down — plus the detail the film had no
          time for.
        </p>
        <div className="mt-12 flex flex-col gap-12 lg:flex-row">
          <nav aria-label="Help topics" className="lg:w-56 lg:shrink-0">
            <ol className="flex flex-col gap-1 lg:sticky lg:top-24">
              {topics.map((topic) => (
                <li key={topic.id}>
                  <a
                    href={`#${topic.id}`}
                    className="block rounded-sm px-3 py-1.5 text-body-sm text-foreground-muted hover:bg-accent hover:text-foreground"
                  >
                    {topic.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="min-w-0 flex-1">
            <section id="layers" className="scroll-mt-24">
              <h2 className="text-h2">The idea: layers of blocks</h2>
              <p className="mt-3 text-body text-foreground-muted">
                Take something familiar — a refrigerator. Underneath, it is a stack of
                sub-systems: cooling, control, power. Each sub-system breaks down further
                into the components that actually fail: a compressor, a thermostat, a
                relay. Strata models any engineered system exactly this way, as layers of
                blocks called a reliability block diagram. Every block carries its own
                chance of still working after a given number of running hours, and the
                layers roll up — component to group, group to sub-system, sub-system to
                system — so the single figure at the top always has a path back to the
                part that produced it.
              </p>
            </section>
            <section id="master-data" className="mt-12 scroll-mt-24">
              <h2 className="text-h2">The catalogue</h2>
              <p className="mt-3 text-body text-foreground-muted">
                Everything starts in Master data. Every component lives in a catalogue
                with the vendor who makes it, its failure rate, its price, and the list of
                other parts it is compatible with. The same component can come from
                several vendors, each with different numbers — that variety is exactly
                what the optimization studio searches over later. Vendors carry their own
                records and logos, and the whole catalogue can be imported from and
                exported to a spreadsheet.
              </p>
            </section>
            <section id="building" className="mt-12 scroll-mt-24">
              <h2 className="text-h2">Building a system</h2>
              <p className="mt-3 text-body text-foreground-muted">
                A project holds your machine; inside it, a system lays out sub-systems and
                components on the canvas. When a project is created you choose how many
                levels its systems may nest, from one to ten. Blocks are wired the way the
                machine really connects: in series, in parallel, or k-out-of-n — a block
                that works as long as at least k of its n units do. From the wiring,
                Strata derives the reliability formula of every level by itself; you can
                read it, and override it with a custom formula when the topology alone
                does not tell the whole story.
              </p>
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}

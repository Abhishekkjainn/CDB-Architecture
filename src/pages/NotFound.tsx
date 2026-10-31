import { Button } from '@/components/Button'
import { MaskText } from '@/components/Reveal'

export default function NotFound() {
  return (
    <section className="container-page min-h-[80svh] flex flex-col justify-center py-32">
      <p className="label text-stone mb-6">Error 404</p>
      <MaskText
        as="h1"
        text="That page does not exist."
        className="display text-[length:var(--text-fluid-2xl)] max-w-[14ch]"
      />
      <p className="mt-8 max-w-md text-stone">
        The link may be out of date. Browse the work, or write to the studio and we
        will point you to what you were looking for.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Button href="/work">See the work</Button>
        <Button href="/contact" variant="outline">
          Contact the studio
        </Button>
      </div>
    </section>
  )
}

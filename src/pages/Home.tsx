import { Hero } from '@/sections/Hero'
import { Manifesto } from '@/sections/Manifesto'
import { Stats } from '@/sections/Stats'
import { FeaturedWork } from '@/sections/FeaturedWork'
import { Method } from '@/sections/Method'
import { Services } from '@/sections/Services'
import { Testimonials } from '@/sections/Testimonials'
import { CallToAction } from '@/sections/CallToAction'

export default function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Stats />
      <FeaturedWork />
      <Method />
      <Services />
      <Testimonials />
      <CallToAction />
    </>
  )
}

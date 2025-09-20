import { buttonVariants } from "@/components/ui/button"

describe("buttonVariants - brand", () => {
  it("applies accessible prominent styles", () => {
    expect(buttonVariants({ variant: "brand", size: "prominent" })).toMatchInlineSnapshot(
      `"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 focus-visible:ring-primary focus-visible:ring-offset-background disabled:bg-primary/60 disabled:text-primary-foreground disabled:opacity-100 disabled:saturate-75 h-auto px-6 py-3 text-base"`
    )
  })
})
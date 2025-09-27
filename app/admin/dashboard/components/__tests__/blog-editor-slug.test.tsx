import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { BlogEditor } from "../blog-editor"

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}))

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

const toastMock = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
}

jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock }),
}))

jest.mock("@/hooks/useAutosave", () => ({
  useAutosave: () => ({ status: "idle", savedAt: null }),
}))

jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...rest }: any) => (
      <div {...rest}>{children}</div>
    ),
  },
}))

function Passthrough({ children, className }: any) {
  return <div className={className}>{children}</div>
}

function PassthroughFragment({ children }: any) {
  return <>{children}</>
}

jest.mock("../BlogPostPreview", () => () => null)
jest.mock("../media/MediaPickerDialog", () => () => null)

jest.mock("../rich-text-editor", () => ({
  RichTextEditor: ({ value, onChange }: any) => (
    <textarea
      aria-label="Rich text editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}))

jest.mock("@/components/ui/popover", () => ({
  Popover: Passthrough,
  PopoverTrigger: PassthroughFragment,
  PopoverContent: Passthrough,
}))

jest.mock("@/components/ui/dialog", () => ({
  Dialog: PassthroughFragment,
  DialogContent: Passthrough,
}))

jest.mock("@/components/ui/sheet", () => ({
  Sheet: PassthroughFragment,
  SheetContent: Passthrough,
  SheetHeader: Passthrough,
  SheetTitle: PassthroughFragment,
  SheetTrigger: PassthroughFragment,
}))

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: PassthroughFragment,
  TooltipTrigger: PassthroughFragment,
  TooltipContent: Passthrough,
}))

jest.mock("@/components/ui/select", () => ({
  Select: PassthroughFragment,
  SelectTrigger: PassthroughFragment,
  SelectValue: PassthroughFragment,
  SelectContent: Passthrough,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}))

jest.mock("@/components/ui/calendar", () => ({
  Calendar: () => <div data-testid="calendar" />,
}))

describe("BlogEditor slug behavior", () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ categories: [] }),
      }) as unknown as Promise<Response>
    ) as unknown as typeof fetch
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("keeps the slug in sync with the title until manually edited", async () => {
    const user = userEvent.setup()

    render(<BlogEditor />)

    const titleInput = screen.getByPlaceholderText("Enter your blog post title...")
    const slugInput = screen.getByPlaceholderText("url-friendly-slug")

    await user.type(titleInput, "Hello World!")
    await waitFor(() => expect(slugInput).toHaveValue("hello-world"))

    await user.type(slugInput, "-custom")
    await waitFor(() => expect(slugInput).toHaveValue("hello-world-custom"))

    await user.clear(titleInput)
    await user.type(titleInput, "Another Title")

    await waitFor(() => expect(titleInput).toHaveValue("Another Title"))
    await waitFor(() => expect(slugInput).toHaveValue("hello-world-custom"))
  })
})
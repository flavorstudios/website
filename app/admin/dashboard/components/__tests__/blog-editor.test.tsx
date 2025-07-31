import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlogEditor } from '../blog-editor'
import { TooltipProvider } from '@/components/ui/tooltip'

test('schedule button disabled until date and time selected', async () => {
  render(
    <TooltipProvider>
      <BlogEditor />
    </TooltipProvider>
  )

  const openScheduler = screen.getByRole('button', { name: /schedule post/i })
  await userEvent.click(openScheduler)

  const confirmButton = screen.getByRole('button', { name: /^schedule$/i })
  expect(confirmButton).toBeDisabled()

  // select date using mocked calendar
  const dayButton = screen.getByRole('button', { name: /calendar/i })
  await userEvent.click(dayButton)

  const timeInput = screen.getByLabelText(/time/i)
  await userEvent.type(timeInput, '12:00')

  expect(confirmButton).toBeEnabled()
})

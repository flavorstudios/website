import { render } from '@testing-library/react'
import { Progress } from '../ui/progress'

test('forwards value and max to radix root', () => {
  const { getByRole } = render(<Progress value={42} />)
  const bar = getByRole('progressbar')
  expect(bar).toHaveAttribute('aria-valuenow', '42')
  expect(bar).toHaveAttribute('aria-valuemax', '100')
})
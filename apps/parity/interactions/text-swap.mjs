// The price swaps to yearly and back; each shot waits for the swap to settle.
export default [
  { example: 'Price', click: 'role=button[name="Yearly"]', wait: 1000, shot: true, label: 'Yearly' },
  { example: 'Price', click: 'role=button[name="Monthly"]', wait: 1000, shot: true, label: 'Monthly' },
]

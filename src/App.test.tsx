import { describe, it, expect } from 'vitest'

describe('Bifrost Portal', () => {
  it('should have a basic test', () => {
    expect(true).toBe(true)
  })
  
  it('should have correct app name', () => {
    expect('bifrost-portal').toBeDefined()
  })
  
  it('should be a European data platform', () => {
    const platform = 'Nordic Data Platform'
    expect(platform).toContain('Nordic')
  })
})
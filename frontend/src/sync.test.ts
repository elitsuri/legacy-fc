import { describe, expect, it } from 'vitest'
import { decideSync } from './sync'

describe('decideSync', () => {
  it('uploads the first career when the cloud is empty', () => {
    expect(decideSync({ localHasCareer: true, knownVersion: null, cloudVersion: null, localDirty: true })).toBe('upload')
  })
  it('does nothing without a career and without a cloud save', () => {
    expect(decideSync({ localHasCareer: false, knownVersion: null, cloudVersion: null, localDirty: false })).toBe('none')
  })
  it('downloads to a fresh device', () => {
    expect(decideSync({ localHasCareer: false, knownVersion: null, cloudVersion: 4, localDirty: false })).toBe('download')
  })
  it('uploads normal progress on the same device', () => {
    expect(decideSync({ localHasCareer: true, knownVersion: 4, cloudVersion: 4, localDirty: true })).toBe('upload')
    expect(decideSync({ localHasCareer: true, knownVersion: 4, cloudVersion: 4, localDirty: false })).toBe('none')
  })
  it('pulls when another device advanced and this one has no new progress', () => {
    expect(decideSync({ localHasCareer: true, knownVersion: 4, cloudVersion: 6, localDirty: false })).toBe('download')
  })
  it('asks the player when both sides changed or the device never synced', () => {
    expect(decideSync({ localHasCareer: true, knownVersion: 4, cloudVersion: 6, localDirty: true })).toBe('conflict')
    expect(decideSync({ localHasCareer: true, knownVersion: null, cloudVersion: 2, localDirty: false })).toBe('conflict')
    expect(decideSync({ localHasCareer: true, knownVersion: 9, cloudVersion: 2, localDirty: false })).toBe('conflict')
  })
})
